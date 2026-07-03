// ===========================================================================
// /app/api/analyze/route.ts
// ---------------------------------------------------------------------------
// ContractGuard — main analysis endpoint.
//
// Accepts two request shapes:
//   (1) multipart/form-data — fields: file (File), sector, docLanguage, userNotes (optional)
//   (2) application/json     — fields: pastedText, sector, docLanguage, userNotes (optional)
//
// Returns a strict AnalyzeResponse JSON object that the frontend renders
// directly into the risk report.
//
// `runtime = 'nodejs'` is mandatory because pdf-parse and adm-zip both
// touch the Node `fs` module.
// ===========================================================================

import { NextRequest, NextResponse } from "next/server";
import type { AnalyzeResponse, DocLanguage, Sector } from "@/lib/types";
import { parseFile, parsePastedText } from "@/lib/parsers";
import { runSectorPipeline, computeRiskScore } from "@/lib/groq/sector-pipeline";

export const runtime = "nodejs";
export const maxDuration = 60; // NOTE: Vercel Hobby caps at 10s. Pro needed for 60s.

const ALLOWED_SECTORS: Sector[] = ["construction", "finance", "gig-job"];
const ALLOWED_LANGS: DocLanguage[] = ["en", "hi", "hinglish"];
const MAX_BYTES = 25 * 1024 * 1024;

function isSector(v: string | null): v is Sector {
  return !!v && (ALLOWED_SECTORS as string[]).includes(v);
}
function isDocLanguage(v: string | null): v is DocLanguage {
  return !!v && (ALLOWED_LANGS as string[]).includes(v);
}

function errorResponse(message: string, status = 400): NextResponse<AnalyzeResponse> {
  return NextResponse.json<AnalyzeResponse>(
    {
      status: "error",
      riskScore: 0,
      clauses: [],
      sector: "construction",
      docLanguage: "en",
      message,
      rulesConsidered: 0,
      pipelineMs: 0,
    },
    { status }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const startTime = Date.now();
  const contentType = req.headers.get("content-type") ?? "";
  let sector: Sector;
  let docLanguage: DocLanguage;
  let parsed;
  let userNotes = "";

  try {
    // ------------------------------------------------------------------
    // Parse input
    // ------------------------------------------------------------------
    if (contentType.includes("multipart/form-data")) {
      const form = await req.formData();
      const file = form.get("file");
      const sectorRaw = form.get("sector");
      const langRaw = form.get("docLanguage");
      const notesRaw = form.get("userNotes");

      if (!isSector(typeof sectorRaw === "string" ? sectorRaw : null)) {
        return errorResponse("Missing or invalid 'sector'. Must be one of: construction, finance, gig-job.");
      }
      sector = sectorRaw as Sector;
      if (!isDocLanguage(typeof langRaw === "string" ? langRaw : null)) {
        return errorResponse("Missing or invalid 'docLanguage'. Must be one of: en, hi, hinglish.");
      }
      docLanguage = langRaw as DocLanguage;
      userNotes = typeof notesRaw === "string" ? notesRaw.trim() : "";

      if (!(file instanceof File)) {
        return errorResponse("No 'file' field found in multipart upload.");
      }
      if (file.size === 0) {
        return errorResponse("The uploaded file is empty (0 bytes). Please re-select the file and try again — some browsers lose the file reference when the page is reloaded.");
      }
      if (file.size > MAX_BYTES) {
        return errorResponse(`File too large. Max ${MAX_BYTES / 1024 / 1024} MB.`);
      }
      console.log(`[analyze] file="${file.name}" size=${file.size} sector=${sector} lang=${docLanguage}`);
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      parsed = await parseFile(bytes, file.name, file.type);
      console.log(`[analyze] parsed kind=${parsed.kind} textLen=${parsed.text?.length ?? 0} in ${Date.now() - startTime}ms`);
    } else {
      const body = await req.json().catch(() => null) as
        | { pastedText?: string; sector?: string; docLanguage?: string; userNotes?: string }
        | null;
      if (!body) return errorResponse("Invalid JSON body.");
      if (!isSector(body.sector ?? null)) {
        return errorResponse("Missing or invalid 'sector'. Must be one of: construction, finance, gig-job.");
      }
      sector = body.sector as Sector;
      if (!isDocLanguage(body.docLanguage ?? null)) {
        return errorResponse("Missing or invalid 'docLanguage'. Must be one of: en, hi, hinglish.");
      }
      docLanguage = body.docLanguage as DocLanguage;
      userNotes = (body.userNotes ?? "").trim();
      const pastedText = (body.pastedText ?? "").trim();
      if (pastedText.length < 30) {
        return errorResponse("Pasted text is too short — at least 30 characters required.");
      }
      if (pastedText.length > 200_000) {
        return errorResponse("Pasted text is too long — at most 200,000 characters.");
      }
      console.log(`[analyze] pasted text len=${pastedText.length} sector=${sector} lang=${docLanguage}`);
      parsed = parsePastedText(pastedText);
    }

    // ------------------------------------------------------------------
    // Check if we have extractable text
    // ------------------------------------------------------------------
    if (parsed.kind === "text" && (parsed.text ?? "").trim().length < 10) {
      return NextResponse.json<AnalyzeResponse>(
        {
          status: "success",
          riskScore: 0,
          clauses: [],
          sector,
          docLanguage,
          message: "Could not extract enough text to analyse. If this is a scanned PDF, please upload as an image.",
          rulesConsidered: 0,
          pipelineMs: Date.now() - startTime,
        },
        { status: 200 }
      );
    }

    // ------------------------------------------------------------------
    // Handle PDFs/DOCX where text extraction failed
    // ------------------------------------------------------------------
    if (parsed.kind === "pdf_no_text") {
      return NextResponse.json<AnalyzeResponse>(
        {
          status: "success",
          riskScore: 0,
          clauses: [],
          sector,
          docLanguage,
          message: "This file has no extractable text layer (it's either scanned or uses custom font encoding the parser cannot decode). Please either: (1) paste the contract text manually using the paste mode, or (2) take a screenshot and upload it as an image — the vision model can OCR it.",
          rulesConsidered: 0,
          pipelineMs: Date.now() - startTime,
        },
        { status: 200 }
      );
    }

    // ------------------------------------------------------------------
    // Run the pipeline — with a hard 9-second budget on Vercel Hobby
    // ------------------------------------------------------------------
    const pipelinePromise = runSectorPipeline({ parsed, sector, docLanguage, userNotes });

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("PIPELINE_TIMEOUT_9S")), 9000)
    );

    let result;
    try {
      result = await Promise.race([pipelinePromise, timeoutPromise]);
    } catch (timeoutErr) {
      console.error(`[analyze] pipeline timed out at ${Date.now() - startTime}ms:`, (timeoutErr as Error).message);
      return errorResponse(
        "The analysis took too long and was aborted. This is usually because the Groq AI call exceeds Vercel's free-tier 10-second limit. Either upgrade to Vercel Pro (60s limit), or try pasting a shorter text snippet.",
        504
      );
    }

    const riskScore = computeRiskScore(result.clauses);
    console.log(`[analyze] done in ${Date.now() - startTime}ms clauses=${result.clauses.length} score=${riskScore} fallback=${result.usedFallback} key=${result.keySource}`);

    const response: AnalyzeResponse = {
      status: "success",
      riskScore,
      clauses: result.clauses,
      sector,
      docLanguage,
      rulesConsidered: result.rulesConsidered,
      pipelineMs: Date.now() - startTime,
      message: [result.roadmapNote, ...parsed.warnings].filter(Boolean).join(" ") || undefined,
      rulesFromSupabase: result.rulesFromSupabase,
      rulebooksInjected: result.rulebooksInjected,
      keySource: result.keySource,
    };
    return NextResponse.json<AnalyzeResponse>(response, { status: 200 });
  } catch (err) {
    console.error(`[analyze] FATAL error at ${Date.now() - startTime}ms:`, err);
    return errorResponse(`Server error: ${(err as Error).message}`, 500);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/analyze",
    methods: ["POST"],
    sectors: ALLOWED_SECTORS,
    docLanguages: ALLOWED_LANGS,
    maxBytes: MAX_BYTES,
  });
}

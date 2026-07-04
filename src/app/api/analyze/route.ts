// ===========================================================================
// /app/api/analyze/route.ts
// ---------------------------------------------------------------------------
// ContractGuard — main analysis endpoint.
//
// Accepts two request shapes:
//   (1) multipart/form-data — fields: file (File), sector, docLanguage
//   (2) application/json     — fields: pastedText, sector, docLanguage
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
// Allow larger uploads (Next.js default is 1 MB on the body parser for
// serverless; the Node runtime can take more, but we cap explicitly).
export const maxDuration = 60;

const ALLOWED_SECTORS: Sector[] = ["construction", "finance", "gig-job"];
const ALLOWED_LANGS: DocLanguage[] = ["en", "hi", "hinglish"];

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB upload cap

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
      rulesTotal: 0,
      rulesPassed: 0,
      rulesTriggered: 0,
    },
    { status }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse<AnalyzeResponse>> {
  const contentType = req.headers.get("content-type") ?? "";

  let sector: Sector;
  let docLanguage: DocLanguage;
  let parsed;
  let userNotes = "";

  try {
    // ---------------------------------------------------------------------
    // Branch A: multipart/form-data (file upload)
    // ---------------------------------------------------------------------
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
      if (file.size > MAX_BYTES) {
        return errorResponse(`File too large. Max ${MAX_BYTES / 1024 / 1024} MB.`);
      }
      const arrayBuf = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuf);
      parsed = await parseFile(bytes, file.name, file.type);
    } else {
      // ---------------------------------------------------------------------
      // Branch B: JSON (pasted text)
      // ---------------------------------------------------------------------
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
      parsed = parsePastedText(pastedText);
    }

    // -----------------------------------------------------------------------
    // Sanity: empty extraction
    // -----------------------------------------------------------------------
    if (parsed.kind === "text" && (parsed.text ?? "").trim().length < 10) {
      return NextResponse.json<AnalyzeResponse>(
        {
          status: "success",
          riskScore: 0,
          clauses: [],
          sector,
          docLanguage,
          message:
            "We could not extract enough text to analyse. If this is a scanned PDF, please upload it as an image so the vision model can OCR it.",
          rulesConsidered: 0,
          pipelineMs: 0,
          rulesTotal: 0,
          rulesPassed: 0,
          rulesTriggered: 0,
        },
        { status: 200 }
      );
    }

    // -----------------------------------------------------------------------
    // Run the Groq pipeline
    // -----------------------------------------------------------------------
    const result = await runSectorPipeline({ parsed, sector, docLanguage, userNotes });
    const riskScore = computeRiskScore(result.clauses);

    // Compute document statistics
    const fullText = parsed.text ?? "";
    const wordCount = fullText.trim() ? fullText.trim().split(/\s+/).length : 0;
    const charCount = fullText.length;
    const estimatedPages = Math.max(1, Math.ceil(charCount / 3000));
    const wasFileUpload = contentType.includes("multipart/form-data");

    // Generate a unique report ID — CG-YYYY-MM-DD-XXXX
    const dateStr = new Date().toISOString().slice(0, 10);
    const randomSuffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    const reportId = `CG-${dateStr}-${randomSuffix}`;

    const response: AnalyzeResponse = {
      status: "success",
      riskScore,
      clauses: result.clauses,
      sector,
      docLanguage,
      rulesConsidered: result.rulesConsidered,
      pipelineMs: result.pipelineMs,
      message: [result.roadmapNote, ...parsed.warnings].filter(Boolean).join(" ") || undefined,
      // New transparency fields
      rulesTotal: result.rulesTotal,
      rulesPassed: result.rulesPassed,
      rulesTriggered: result.rulesTriggered,
      executiveSummaryEn: result.executiveSummaryEn,
      executiveSummaryHi: result.executiveSummaryHi,
      documentStats: {
        estimatedPages,
        wordCount,
        charCount,
        language: docLanguage,
        processingTimeMs: result.pipelineMs,
        chunksProcessed: result.chunksProcessed,
        wasFileUpload,
        filename: parsed.filename,
      },
      reportId,
      generatedAt: new Date().toISOString(),
      usedFallback: result.usedFallback,
      keySource: result.keySource,
    };
    return NextResponse.json<AnalyzeResponse>(response, { status: 200 });
  } catch (err) {
    console.error("[analyze] error", err);
    return errorResponse(`Unexpected server error: ${(err as Error).message}`, 500);
  }
}

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(
    {
      ok: true,
      endpoint: "/api/analyze",
      methods: ["POST"],
      accepts: ["multipart/form-data", "application/json"],
      sectors: ALLOWED_SECTORS,
      docLanguages: ALLOWED_LANGS,
      maxBytes: MAX_BYTES,
    },
    { status: 200 }
  );
}

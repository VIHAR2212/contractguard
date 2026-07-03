// ===========================================================================
// /lib/parsers/index.ts
// ---------------------------------------------------------------------------
// File parsing utilities for ContractGuard.
//
// PDF parsing uses `unpdf` (serverless-friendly pdfjs-dist wrapper) instead
// of pdf-parse v2. unpdf handles custom font subsetting better and is built
// for Vercel's serverless environment.
//
// If text extraction returns empty (scanned PDF or font-encoding issue),
// the parser returns kind="pdf_no_text" so the API can return a clear
// message to the user instead of pretending the analysis succeeded.
// ===========================================================================

import type { DocLanguage } from "@/lib/types";

export type ParsedKind = "text" | "image" | "pdf_no_text";

export interface ParsedDocument {
  kind: ParsedKind;
  /** For "text": the extracted text. For "image": the original filename. */
  text?: string;
  /** For "image": base64 (no data: prefix) of the bytes. */
  base64?: string;
  /** For "image": the MIME media type, e.g. image/png. */
  mediaType?: string;
  /** Filename the user uploaded, or "pasted.txt" for paste mode. */
  filename: string;
  /** Best-effort detected language of the document text. */
  detectedLanguage?: DocLanguage;
  /** For ZIP: every file we actually opened. */
  containedFiles?: string[];
  /** Warnings (non-fatal issues we want surfaced in the report). */
  warnings: string[];
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const IMAGE_EXT = /\.(png|jpe?g|webp|gif)$/i;
const PDF_EXT = /\.pdf$/i;
const TXT_EXT = /\.(txt|md|csv|json|log)$/i;

const MIME_BY_EXT: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

function extOf(name: string): string {
  const m = name.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "";
}

function looksLikeHindi(text: string): boolean {
  const devanagari = (text.match(/[\u0900-\u097F]/g) || []).length;
  return devanagari > text.length * 0.05;
}

function looksLikeHinglish(text: string): boolean {
  if (looksLikeHindi(text)) return false;
  const sample = text.toLowerCase();
  const markers = [
    "hai", "hoga", "kar", "karna", "kya", "nahi", "nahin", "aap",
    "tum", "hum", "ye", "wo", "ka", "ki", "ke", "ne", "se", "ko",
    "bhai", "yaar", "kaisa", "thik", "theek", "rupees", "paisa",
  ];
  let hits = 0;
  for (const m of markers) {
    const re = new RegExp(`\\b${m}\\b`, "g");
    if (re.test(sample)) hits += 1;
  }
  return hits >= 4;
}

export function detectLanguage(text: string): DocLanguage {
  if (!text) return "en";
  if (looksLikeHindi(text)) return "hi";
  if (looksLikeHinglish(text)) return "hinglish";
  return "en";
}

// ---------------------------------------------------------------------------
// PDF parsing — uses unpdf (serverless-friendly)
// ---------------------------------------------------------------------------

async function parsePdf(bytes: Uint8Array, filename: string): Promise<ParsedDocument> {
  // Guard against empty / 0-byte uploads — pdfjs-dist will crash the
  // Vercel worker process on an empty buffer.
  if (!bytes || bytes.length === 0) {
    return {
      kind: "pdf_no_text",
      text: "",
      filename,
      detectedLanguage: "en",
      warnings: ["The uploaded file is 0 bytes. Please re-select the file and try again."],
    };
  }

  try {
    const { extractText, getDocumentProxy } = await import("unpdf");

    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: true });
    const cleaned = (text ?? "").trim();

    if (cleaned.length < 10) {
      // Text extraction failed — likely a scanned PDF or font-encoding issue.
      return {
        kind: "pdf_no_text",
        text: "",
        filename,
        detectedLanguage: "en",
        warnings: [
          "PDF text extraction returned no readable text. This usually means the PDF is scanned (image-based) or uses custom font subsetting that pdfjs-dist cannot decode.",
          "Falling back to vision-model OCR. If this fails, try pasting the contract text manually.",
        ],
      };
    }

    return {
      kind: "text",
      text: cleaned,
      filename,
      detectedLanguage: detectLanguage(cleaned),
      warnings: [],
    };
  } catch (err) {
    // Catch ANY error from unpdf — invalid PDF, encrypted PDF, corrupt
    // header, worker crash, etc. Don't let it kill the Vercel function.
    return {
      kind: "pdf_no_text",
      text: "",
      filename,
      detectedLanguage: "en",
      warnings: [`Could not parse PDF: ${(err as Error).message}. Try pasting the contract text manually.`],
    };
  }
}

// ---------------------------------------------------------------------------
// Plain text passthrough
// ---------------------------------------------------------------------------

function parsePlain(bytes: Uint8Array, filename: string): ParsedDocument {
  const text = Buffer.from(bytes).toString("utf-8");
  return {
    kind: "text",
    text,
    filename,
    detectedLanguage: detectLanguage(text),
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// Image passthrough
// ---------------------------------------------------------------------------

function parseImage(bytes: Uint8Array, filename: string): ParsedDocument {
  const ext = extOf(filename);
  const mediaType = MIME_BY_EXT[ext] ?? "image/png";
  return {
    kind: "image",
    base64: Buffer.from(bytes).toString("base64"),
    mediaType,
    filename,
    detectedLanguage: "en",
    warnings: [],
  };
}

// ---------------------------------------------------------------------------
// ZIP parsing
// ---------------------------------------------------------------------------

async function parseZip(bytes: Uint8Array, filename: string): Promise<ParsedDocument> {
  const AdmZip = (await import("adm-zip")).default;
  const zip = new AdmZip(Buffer.from(bytes));
  const entries = zip.getEntries();
  const containedFiles: string[] = [];
  const warnings: string[] = [];
  const textParts: string[] = [];
  const images: ParsedDocument[] = [];

  for (const entry of entries) {
    if (entry.isDirectory) continue;
    const name = entry.entryName;
    const data = entry.getData();
    try {
      if (PDF_EXT.test(name)) {
        const sub = await parsePdf(new Uint8Array(data), name);
        containedFiles.push(name);
        if (sub.text) {
          textParts.push(`--- ${name} ---\n${sub.text}`);
        }
        if (sub.warnings.length) warnings.push(...sub.warnings);
      } else if (TXT_EXT.test(name)) {
        const t = data.toString("utf-8");
        containedFiles.push(name);
        textParts.push(`--- ${name} ---\n${t}`);
      } else if (IMAGE_EXT.test(name)) {
        containedFiles.push(name);
        images.push(parseImage(new Uint8Array(data), name));
      } else {
        warnings.push(`Skipped unsupported file in ZIP: ${name}`);
      }
    } catch (err) {
      warnings.push(`Failed to parse ${name} from ZIP: ${(err as Error).message}`);
    }
  }

  if (images.length === 1 && textParts.length === 0) {
    return { ...images[0], containedFiles, warnings };
  }

  if (images.length > 0) {
    warnings.push(
      `ZIP contained ${images.length} image(s) which were skipped in the text path.`
    );
  }

  const text = textParts.join("\n\n");
  return {
    kind: "text",
    text,
    filename,
    containedFiles,
    detectedLanguage: detectLanguage(text),
    warnings,
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function parseFile(
  bytes: Uint8Array,
  filename: string,
  mime: string
): Promise<ParsedDocument> {
  const name = filename.toLowerCase();
  try {
    if (PDF_EXT.test(name) || mime === "application/pdf") {
      return await parsePdf(bytes, filename);
    }
    if (name.endsWith(".zip") || mime === "application/zip" || mime === "application/x-zip-compressed") {
      return await parseZip(bytes, filename);
    }
    if (IMAGE_EXT.test(name) || (mime || "").startsWith("image/")) {
      return parseImage(bytes, filename);
    }
    if (TXT_EXT.test(name) || (mime || "").startsWith("text/")) {
      return parsePlain(bytes, filename);
    }
    return parsePlain(bytes, filename);
  } catch (err) {
    return {
      kind: "text",
      text: "",
      filename,
      warnings: [`Failed to parse ${filename}: ${(err as Error).message}`],
    };
  }
}

/** Build a ParsedDocument from pasted text — used by the JSON code path. */
export function parsePastedText(text: string): ParsedDocument {
  return {
    kind: "text",
    text,
    filename: "pasted.txt",
    detectedLanguage: detectLanguage(text),
    warnings: [],
  };
}

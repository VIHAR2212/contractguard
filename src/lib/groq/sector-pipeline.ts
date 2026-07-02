// ===========================================================================
// /lib/groq/sector-pipeline.ts
// ---------------------------------------------------------------------------
// Extract → Match → Explain pipeline using the Groq SDK.
//
// **Multi-key architecture**: ContractGuard uses THREE Groq accounts — one
// per sector. The right API key + model is selected based on the user's
// chosen sector, so you can spread load across free-tier accounts and
// pick a different model per document type.
//
// Env vars (one set per sector):
//   GROQ_API_KEY_CONSTRUCTION  +  GROQ_MODEL_CONSTRUCTION  +  GROQ_VISION_MODEL_CONSTRUCTION
//   GROQ_API_KEY_FINANCE       +  GROQ_MODEL_FINANCE       +  GROQ_VISION_MODEL_FINANCE
//   GROQ_API_KEY_GIG_JOB       +  GROQ_MODEL_GIG_JOB       +  GROQ_VISION_MODEL_GIG_JOB
//
// Fallback: if the sector-specific key is missing, we try a generic
// GROQ_API_KEY (handy for local dev with a single key). If that's also
// missing, the deterministic keyword matcher runs so the demo still works.
// ===========================================================================

import Groq from "groq-sdk";
import type {
  DocLanguage,
  MatchedClause,
  Rule,
  Sector,
  Severity,
} from "@/lib/types";
import { getRulesForSector } from "@/lib/rules";
import type { ParsedDocument } from "@/lib/parsers";

// ---------------------------------------------------------------------------
// Pipeline input / output
// ---------------------------------------------------------------------------

export interface SectorPipelineInput {
  parsed: ParsedDocument;
  sector: Sector;
  docLanguage: DocLanguage;
}

export interface SectorPipelineResult {
  clauses: MatchedClause[];
  rulesConsidered: number;
  pipelineMs: number;
  roadmapNote?: string;
  usedFallback: boolean;
  /** Which Groq account / key was actually used (for logs, not PII). */
  keySource: "construction" | "finance" | "gig_job" | "generic" | "none";
}

// ---------------------------------------------------------------------------
// Severity weighting for risk score
// ---------------------------------------------------------------------------

const SEVERITY_WEIGHT: Record<Severity, number> = {
  high: 25,
  medium: 12,
  low: 5,
};

export function computeRiskScore(clauses: MatchedClause[]): number {
  if (clauses.length === 0) return 0;
  const raw = clauses.reduce((sum, c) => sum + SEVERITY_WEIGHT[c.severity], 0);
  return Math.min(Math.round(raw), 100);
}

// ---------------------------------------------------------------------------
// Per-sector env config
// ---------------------------------------------------------------------------

interface SectorConfig {
  apiKey: string | undefined;
  textModel: string;
  visionModel: string;
  /** Which env slot the key came from — surfaced in pipeline result. */
  keySource: "construction" | "finance" | "gig_job" | "generic" | "none";
}

const DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_VISION_MODEL = "llama-3.2-90b-vision-preview";

function getSectorConfig(sector: Sector): SectorConfig {
  // Sector-specific env var names. GIG_JOB uses underscore to match
  // conventional env-var naming (GROQ_API_KEY_GIG_JOB).
  const sectorKey = sector.toUpperCase().replace("-", "_"); // CONSTRUCTION | FINANCE | GIG_JOB

  const sectorApiKey = process.env[`GROQ_API_KEY_${sectorKey}`];
  const sectorTextModel =
    process.env[`GROQ_MODEL_${sectorKey}`] || DEFAULT_TEXT_MODEL;
  const sectorVisionModel =
    process.env[`GROQ_VISION_MODEL_${sectorKey}`] || DEFAULT_VISION_MODEL;

  if (sectorApiKey) {
    return {
      apiKey: sectorApiKey,
      textModel: sectorTextModel,
      visionModel: sectorVisionModel,
      keySource: sectorKey.toLowerCase() as SectorConfig["keySource"],
    };
  }

  // Fallback: generic GROQ_API_KEY (for local dev with a single key)
  const genericKey = process.env.GROQ_API_KEY;
  if (genericKey) {
    return {
      apiKey: genericKey,
      textModel: process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL,
      visionModel: process.env.GROQ_VISION_MODEL || DEFAULT_VISION_MODEL,
      keySource: "generic",
    };
  }

  // No key at all — keyword fallback will run
  return {
    apiKey: undefined,
    textModel: sectorTextModel,
    visionModel: sectorVisionModel,
    keySource: "none",
  };
}

// Cache one Groq client per API key so we don't re-instantiate on every call
// (the SDK does connection pooling internally; we just want to avoid the
// constructor overhead).
const _groqClients = new Map<string, Groq>();

function getGroq(apiKey: string): Groq {
  let client = _groqClients.get(apiKey);
  if (!client) {
    client = new Groq({ apiKey });
    _groqClients.set(apiKey, client);
  }
  return client;
}

// ---------------------------------------------------------------------------
// Internal: the JSON schema we ask the model to emit
// ---------------------------------------------------------------------------

interface RawModelMatch {
  ruleId: string;
  snippet: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
}

// ---------------------------------------------------------------------------
// Prompt construction — TEXT path
// ---------------------------------------------------------------------------

function buildTextSystemPrompt(rules: Rule[], sector: Sector): string {
  const rulesDigest = rules
    .map(
      (r) =>
        `- id: ${r.id}\n  category: ${r.category}\n  severity: ${r.severity}\n  legal_basis: ${r.legal_basis}\n  pattern: ${r.pattern_description_en}`
    )
    .join("\n");

  return `You are ContractGuard, a strict legal-clause matching engine for Indian consumer contracts.
Your job: read the user's contract text and identify every clause that matches one of the rules in the supplied RULES list.
You must ONLY match rules that appear in the RULES list — never invent a rule, never invent a legal basis, never invent a statute.
For every match you must quote the EXACT text snippet from the contract that triggered the match (no paraphrasing, must be a verbatim substring of the contract text).

SECTOR: ${sector}

RULES (id | category | severity | legal_basis | pattern):
 ${rulesDigest}

OUTPUT FORMAT — return ONLY a JSON object, no prose, no markdown fences:
{
  "matches": [
    { "ruleId": "<must be one of the ids above>", "snippet": "<verbatim text from the contract>", "confidence": "high|medium|low", "notes": "<optional short note>" }
  ],
  "roadmapNote": "<optional — only if the contract was not in English/Hindi/Hinglish and you had to translate internally; otherwise omit>"
}

RULES OF THE GAME:
1. If a clause does not clearly match a rule, do NOT match it. Precision over recall.
2. If the contract text is not in English/Hindi/Hinglish, translate the relevant snippet to English internally before matching, and add a roadmapNote describing the source language.
3. Snippets must be at most 400 characters. If the triggering clause is longer, pick the most relevant 400-character window.
4. Do not match the same rule twice with the same snippet. If the contract violates the same rule in multiple places, pick the strongest example.
5. Return at most one match per rule id.`;
}

function buildTextUserPrompt(parsed: ParsedDocument, docLanguage: DocLanguage): string {
  const langHint =
    docLanguage === "en"
      ? "The document is in English."
      : docLanguage === "hi"
      ? "The document is in Hindi (Devanagari)."
      : docLanguage === "hinglish"
      ? "The document is in Hinglish (Roman-script Hindi)."
      : "The document language is not English/Hindi/Hinglish. Translate internally to English before matching and add a roadmapNote.";

  const header = `DOCUMENT LANGUAGE: ${langHint}
DOCUMENT FILENAME: ${parsed.filename}

CONTRACT TEXT:
"""`;
  const footer = `"""`;
  const text = (parsed.text ?? "").slice(0, 60_000);
  return `${header}\n${text}\n${footer}`;
}

// ---------------------------------------------------------------------------
// Prompt construction — VISION path (image upload)
// ---------------------------------------------------------------------------

function buildVisionSystemPrompt(rules: Rule[], sector: Sector): string {
  return (
    buildTextSystemPrompt(rules, sector) +
    `\n\nADDITIONAL: The contract is provided as an IMAGE. Use OCR-like reading of the image to extract the contract text, then apply the same matching rules. If the image is illegible or not a contract, return {"matches": []} with a roadmapNote explaining the issue.`
  );
}

// ---------------------------------------------------------------------------
// Model call — text
// ---------------------------------------------------------------------------

async function callGroqText(
  parsed: ParsedDocument,
  rules: Rule[],
  sector: Sector,
  docLanguage: DocLanguage,
  config: SectorConfig
): Promise<{ matches: RawModelMatch[]; roadmapNote?: string } | null> {
  if (!config.apiKey) return null;
  const groq = getGroq(config.apiKey);

  const sys = buildTextSystemPrompt(rules, sector);
  const user = buildTextUserPrompt(parsed, docLanguage);

  const resp = await groq.chat.completions.create({
    model: config.textModel,
    temperature: 0.1,
    max_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: sys },
      { role: "user", content: user },
    ],
  });

  const raw = resp.choices?.[0]?.message?.content ?? "{}";
  try {
    const parsedJson = JSON.parse(raw) as {
      matches?: RawModelMatch[];
      roadmapNote?: string;
    };
    return { matches: parsedJson.matches ?? [], roadmapNote: parsedJson.roadmapNote };
  } catch {
    return { matches: [], roadmapNote: "Model returned invalid JSON — falling back." };
  }
}

// ---------------------------------------------------------------------------
// Model call — vision
// ---------------------------------------------------------------------------

async function callGroqVision(
  parsed: ParsedDocument,
  rules: Rule[],
  sector: Sector,
  docLanguage: DocLanguage,
  config: SectorConfig
): Promise<{ matches: RawModelMatch[]; roadmapNote?: string } | null> {
  if (!config.apiKey) return null;
  if (!parsed.base64 || !parsed.mediaType) return null;
  const groq = getGroq(config.apiKey);

  const sys = buildVisionSystemPrompt(rules, sector);
  const langHint =
    docLanguage === "en"
      ? "The document is in English."
      : docLanguage === "hi"
      ? "The document is in Hindi (Devanagari)."
      : docLanguage === "hinglish"
      ? "The document is in Hinglish."
      : "The document language is unknown — translate to English internally and add a roadmapNote.";

  const dataUrl = `data:${parsed.mediaType};base64,${parsed.base64}`;

  const resp = await groq.chat.completions.create({
    model: config.visionModel,
    temperature: 0.1,
    max_tokens: 2048,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: [
          { type: "text", text: `${langHint}\n\nAnalyse the contract in this image and return JSON as instructed.` },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });

  const raw = resp.choices?.[0]?.message?.content ?? "{}";
  // Some vision models wrap JSON in markdown fences — strip them.
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const parsedJson = JSON.parse(cleaned) as {
      matches?: RawModelMatch[];
      roadmapNote?: string;
    };
    return { matches: parsedJson.matches ?? [], roadmapNote: parsedJson.roadmapNote };
  } catch {
    return { matches: [], roadmapNote: "Vision model returned invalid JSON." };
  }
}

// ---------------------------------------------------------------------------
// Deterministic fallback — used when no API key is set, or API call fails.
// ---------------------------------------------------------------------------

const KEYWORDS_BY_RULE: Record<string, string[]> = {
  // Construction
  "RERA-DELAY-001": ["delay", "possession", "force majeure", "compensation", "per month", "delay in giving", "delayed possession"],
  "RERA-CARPET-002": ["super built-up", "built-up area", "saleable area", "carpet area", "loading", "super area"],
  "RERA-TITLE-003": ["free and marketable", "encumbrance", "mortgage", "title defect", "clear title", "litigation"],
  "RERA-CANCEL-004": ["cancel", "forfeit", "forfeiture", "allotment", "termination", "cancel the allotment"],
  "RERA-ESC-005": ["escalation", "input cost", "statutory", "revision", "increase in price", "price escalation"],
  "RERA-REFUND-006": ["refund", "without interest", "administration fee", "re-sale", "resale"],
  "RERA-MAINT-007": ["maintenance", "common area", "association", "society", "maintenance charge"],
  "RERA-FM-008": ["force majeure", "act of god", "beyond control", "labour", "material shortage", "government policy"],
  "RERA-JURIS-009": ["arbitration", "exclusive jurisdiction", "seat of arbitration", "court at", "governing law"],
  "RERA-PLAN-010": ["alteration", "sanctioned plan", "structural", "amenities", "two-thirds", "2/3"],
  "RERA-PARK-011": ["parking", "stilt", "open parking", "covered parking", "garage"],
  "RERA-TRANSFER-012": ["transfer", "assignment", "nominee", "transfer fee", "transfer charges"],
  // Finance
  "RBI-PERSONAL-FEE-001": ["processing fee", "documentation charge", "insurance premium", "incidental", "admin fee"],
  "RBI-FLOAT-RESET-002": ["floating", "benchmark", "reset", "repo rate", "spread", "external benchmark"],
  "RBI-PREPAY-003": ["prepayment", "foreclosure", "pre-payment", "pre closure", "pre-closure", "early closure"],
  "RBI-COMPOUND-004": ["compound", "interest on interest", "penal interest", "default interest", "default charges"],
  "RBI-MODIFY-005": ["deemed consent", "modify", "amend", "unilaterally", "without notice", "as the lender may decide"],
  "RBI-CC-INTEREST-006": ["annualised", "annual percentage rate", "apr", "finance charge", "interest free", "grace period", "daily rate"],
  "RBI-CC-LATEFEE-007": ["late fee", "late payment", "late payment charge", "finance charge"],
  "RBI-CC-BILL-008": ["statement", "due date", "billing cycle", "minimum due"],
  "RBI-CC-UNSOLICITED-009": ["upgrade", "auto activate", "implicit consent", "activation", "unsolicited"],
  "GOLD-BUYBACK-010": ["buyback", "buy back", "making charge", "wastage", "resale", "exchange"],
  "GOLD-HALLMARK-011": ["hallmark", "huid", "bis", "purity", "carat", "22k", "24k", "18k", "14k"],
  "RBI-GOLDLTV-012": ["ltv", "loan to value", "loan-to-value", "auction", "pledge", "gold loan"],
  // Gig-job
  "GIG-RATE-001": ["rate card", "rate change", "pay rate", "incentive", "per task", "piece rate", "revision"],
  "GIG-TERM-002": ["at will", "at the will", "without cause", "terminate", "termination", "summary termination", "without notice"],
  "GIG-NONCOMPETE-003": ["non-compete", "non compete", "restraint", "competing", "competitor", "shall not engage"],
  "GIG-PROBATION-004": ["probation", "probationary", "extend", "confirmation"],
  "GIG-NDA-005": ["confidential", "non-disclosure", "nda", "proprietary information"],
  "GIG-IP-006": ["intellectual property", "assignment of ip", "invention", "copyright", "patent", "work product"],
  "GIG-EXCLUSIVITY-007": ["exclusively", "exclusive", "shall not work", "other platform", "competitor platform"],
  "GIG-DEBIT-008": ["auto debit", "auto-debit", "security deposit", "forfeit", "deduct", "shortfall"],
  "GIG-DATA-009": ["personal data", "device access", "location", "biometric", "contacts", "monitor", "consent"],
  "GIG-JURIS-010": ["arbitration", "exclusive jurisdiction", "seat", "governing law", "courts of"],
  "GIG-NOTICE-011": ["notice period", "notice of", "serve notice", "30 days", "60 days", "90 days"],
  "GIG-SOCIAL-012": ["social media", "code of conduct", "public statement", "disparage", "criticism"],
};

function fallbackMatch(
  parsed: ParsedDocument,
  rules: Rule[],
  docLanguage: DocLanguage
): { matches: RawModelMatch[]; roadmapNote?: string } {
  const text = (parsed.text ?? "").toLowerCase();
  if (!text) return { matches: [] };
  const matches: RawModelMatch[] = [];
  const seenSnippets = new Set<string>();

  for (const rule of rules) {
    const keywords = KEYWORDS_BY_RULE[rule.id] ?? [];
    if (!keywords.length) continue;
    const hits = keywords.filter((k) => text.includes(k.toLowerCase()));
    if (hits.length < 2) continue;

    const firstHit = hits
      .map((k) => text.indexOf(k.toLowerCase()))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b)[0];
    if (firstHit < 0) continue;

    const start = Math.max(0, firstHit - 120);
    const end = Math.min(text.length, firstHit + 280);
    let snippet = (parsed.text ?? "").slice(start, end).replace(/\s+/g, " ").trim();
    if (snippet.length > 400) snippet = snippet.slice(0, 400);

    const key = `${rule.id}:${snippet.slice(0, 80)}`;
    if (seenSnippets.has(key)) continue;
    seenSnippets.add(key);

    matches.push({
      ruleId: rule.id,
      snippet,
      confidence: hits.length >= 4 ? "high" : hits.length >= 3 ? "medium" : "low",
      notes: `Matched on keywords: ${hits.slice(0, 4).join(", ")}.`,
    });
  }

  const roadmapNote =
    docLanguage !== "en" && docLanguage !== "hi" && docLanguage !== "hinglish"
      ? `Source document language (${docLanguage}) was not English/Hindi/Hinglish — fallback matcher ran on Roman-script subset only.`
      : undefined;

  return { matches, roadmapNote };
}

// ---------------------------------------------------------------------------
// Render — fill the rule's plain-language template with the matched snippet
// ---------------------------------------------------------------------------

function renderTemplates(rule: Rule, snippet: string): { en: string; hi: string } {
  const safe = snippet.replace(/\s+/g, " ").trim() || "(snippet unavailable)";
  return {
    en: rule.plainEnglishTemplate.replace("{clause}", safe),
    hi: rule.plainHindiTemplate.replace("{clause}", safe),
  };
}

// ---------------------------------------------------------------------------
// Public entry point
// ---------------------------------------------------------------------------

export async function runSectorPipeline(
  input: SectorPipelineInput
): Promise<SectorPipelineResult> {
  const start = Date.now();
  const rules = getRulesForSector(input.sector);
  if (!rules.length) {
    return {
      clauses: [],
      rulesConsidered: 0,
      pipelineMs: 0,
      usedFallback: false,
      keySource: "none",
    };
  }

  // Pick the per-sector config (key + model)
  const config = getSectorConfig(input.sector);

  let raw: { matches: RawModelMatch[]; roadmapNote?: string } | null = null;
  let usedFallback = false;

  if (config.apiKey) {
    try {
      if (input.parsed.kind === "image") {
        raw = await callGroqVision(input.parsed, rules, input.sector, input.docLanguage, config);
      } else {
        raw = await callGroqText(input.parsed, rules, input.sector, input.docLanguage, config);
      }
    } catch (err) {
      raw = {
        matches: [],
        roadmapNote: `Groq API error (${config.keySource} key): ${(err as Error).message}. Falling back to keyword matcher.`,
      };
    }
  }

  // Fallback — keyword matcher — if no API key, API call failed, or model returned zero matches.
  if (!raw || (raw.matches.length === 0 && input.parsed.kind === "text" && (input.parsed.text ?? "").length > 0)) {
    const fb = fallbackMatch(input.parsed, rules, input.docLanguage);
    if (fb.matches.length > 0 || !raw) {
      raw = fb;
      usedFallback = true;
    }
  }

  // Resolve raw matches to full MatchedClause objects.
  const rulesById = new Map<string, Rule>(rules.map((r) => [r.id, r]));
  const clauses: MatchedClause[] = [];
  for (const m of raw.matches) {
    const rule = rulesById.get(m.ruleId);
    if (!rule) continue;
    if (!m.snippet || m.snippet.length < 5) continue;
    const rendered = renderTemplates(rule, m.snippet);
    clauses.push({
      ruleId: rule.id,
      category: rule.category,
      severity: rule.severity,
      snippet: m.snippet,
      explanationEn: rendered.en,
      explanationHi: rendered.hi,
      legalBasis: rule.legal_basis,
      roadmapNote: m.notes || raw.roadmapNote,
    });
  }

  const sevRank: Record<Severity, number> = { high: 0, medium: 1, low: 2 };
  clauses.sort((a, b) => sevRank[a.severity] - sevRank[b.severity]);

  return {
    clauses,
    rulesConsidered: rules.length,
    pipelineMs: Date.now() - start,
    roadmapNote: raw?.roadmapNote,
    usedFallback,
    keySource: config.keySource,
  };
}

export { computeRiskScore as computeRisk };

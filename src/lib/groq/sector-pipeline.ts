// ===========================================================================
// /lib/groq/sector-pipeline.ts
// ---------------------------------------------------------------------------
// Extract → Match → Explain pipeline using Groq SDK + Supabase rulebook
// context.
//
// - Merges local rules + Supabase rules (Supabase overrides on ID collision)
// - Loads full-text rulebooks from Supabase and injects them as context
// - Uses three Groq accounts (one per sector) for load balancing
// - Falls back to a deterministic keyword matcher when no API key is set
//   or the API call fails, so the demo always returns a result
// ===========================================================================

import Groq from "groq-sdk";
import type {
  ChargeValidity,
  DocLanguage,
  MatchedClause,
  PrecedentStrength,
  Rule,
  Sector,
  Severity,
} from "@/lib/types";
import { loadRulesForSector } from "@/lib/supabase/rules-loader";
import {
  loadRulebooksForSector,
  type RulebookDoc,
} from "@/lib/supabase/rulebooks";
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
  keySource: "construction" | "finance" | "gig_job" | "generic" | "none";
  rulesFromSupabase: number;
  rulebooksInjected: number;
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
// Per-sector Groq config (three accounts)
// ---------------------------------------------------------------------------

interface SectorConfig {
  apiKey: string | undefined;
  textModel: string;
  visionModel: string;
  keySource: "construction" | "finance" | "gig_job" | "generic" | "none";
}

const DEFAULT_TEXT_MODEL = "llama-3.3-70b-versatile";
const DEFAULT_VISION_MODEL = "llama-3.2-90b-vision-preview";

function getSectorConfig(sector: Sector): SectorConfig {
  const sectorKey = sector.toUpperCase().replace("-", "_");
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

  const genericKey = process.env.GROQ_API_KEY;
  if (genericKey) {
    return {
      apiKey: genericKey,
      textModel: process.env.GROQ_MODEL || DEFAULT_TEXT_MODEL,
      visionModel: process.env.GROQ_VISION_MODEL || DEFAULT_VISION_MODEL,
      keySource: "generic",
    };
  }

  return {
    apiKey: undefined,
    textModel: sectorTextModel,
    visionModel: sectorVisionModel,
    keySource: "none",
  };
}

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
// Model output schema
// ---------------------------------------------------------------------------

interface RawModelMatch {
  ruleId: string;
  snippet: string;
  confidence: "high" | "medium" | "low";
  notes?: string;
  chargeValidity?: ChargeValidity;
  chargeExtracted?: string;
  permittedCharge?: string;
  chargeAnalysisEn?: string;
  chargeAnalysisHi?: string;
  summarizedReasonEn?: string;
  summarizedReasonHi?: string;
  counterArgumentEn?: string;
  counterArgumentHi?: string;
  precedentStrength?: PrecedentStrength;
  citedSections?: string[];
}

// ---------------------------------------------------------------------------
// Prompt construction
// ---------------------------------------------------------------------------

function buildRulesDigest(rules: Rule[]): string {
  return rules
    .map((r) => {
      const chargeInfo = r.involvesChargeValidation
        ? `\n  involves_charge_validation: true\n  charge_validation_criteria: ${r.chargeValidationCriteria ?? "N/A"}\n  permitted_charge: ${r.permittedCharge ?? "N/A"}`
        : "";
      return `- id: ${r.id}\n  category: ${r.category}\n  severity: ${r.severity}\n  legal_basis: ${r.legal_basis}\n  pattern: ${r.pattern_description_en}${chargeInfo}`;
    })
    .join("\n");
}

function buildRulebooksContext(rulebooks: RulebookDoc[]): string {
  if (rulebooks.length === 0) {
    return "No full-text rulebooks available. Rely on the legal_basis field of each rule.";
  }
  return rulebooks
    .map(
      (rb, i) =>
        `--- RULEBOOK ${i + 1}: ${rb.title} ---\n${rb.content}\n--- END RULEBOOK ${i + 1} ---`
    )
    .join("\n\n");
}

function buildTextSystemPrompt(
  rules: Rule[],
  sector: Sector,
  rulebooks: RulebookDoc[]
): string {
  const rulesDigest = buildRulesDigest(rules);
  const rulebooksContext = buildRulebooksContext(rulebooks);

  return `You are ContractGuard, a strict legal-clause matching engine for Indian consumer contracts.
Your job: read the user's contract text and identify every clause that matches one of the rules in the supplied RULES list.
You must ONLY match rules that appear in the RULES list — never invent a rule, never invent a legal basis, never invent a statute.
For every match you must quote the EXACT text snippet from the contract that triggered the match (no paraphrasing, must be a verbatim substring of the contract text).

SECTOR: ${sector}

== RULES (id | category | severity | legal_basis | pattern | charge info) ==
 ${rulesDigest}

== FULL-TEXT RULEBOOKS (actual statutory text — read these before matching) ==
 ${rulebooksContext}

== OUTPUT FORMAT — return ONLY a JSON object, no prose, no markdown fences ==
{
  "matches": [
    {
      "ruleId": "<must be one of the ids above>",
      "snippet": "<verbatim text from the contract, max 400 chars>",
      "confidence": "high|medium|low",
      "notes": "<optional short note>",
      "chargeValidity": "valid|invalid|partially_valid|not_applicable",
      "chargeExtracted": "<the exact charge/cost/fee mentioned in the clause>",
      "permittedCharge": "<what the law actually permits>",
      "chargeAnalysisEn": "<2-4 sentences explaining WHY the charge is valid/invalid, citing the specific statute section>",
      "chargeAnalysisHi": "<same analysis in Hindi (Devanagari)>",
      "summarizedReasonEn": "<1-2 sentences. The single most powerful line.>",
      "summarizedReasonHi": "<same in Hindi>",
      "counterArgumentEn": "<a ready-to-use statement the user can copy-paste and send to the builder/bank/employer>",
      "counterArgumentHi": "<same counter-argument in Hindi>",
      "precedentStrength": "statutory|binding|persuasive|regulatory",
      "citedSections": ["<specific section numbers>"]
    }
  ],
  "roadmapNote": "<optional — only if the contract was not in English/Hindi/Hinglish>"
}

RULES OF THE GAME:
1. PRECISION OVER RECALL. Only match a clause if it CLEARLY matches a rule.
2. CHARGE VALIDATION IS MANDATORY for rules where involves_charge_validation is true.
3. THE SUMMARIZED REASON must be 1-2 sentences. Powerful and specific.
4. THE COUNTER-ARGUMENT must be a complete, ready-to-send statement citing the specific section.
5. CITED SECTIONS must be specific (e.g. 'Section 18(1)', not just 'RERA').
6. PRECEDENT STRENGTH: statutory=Act, binding=SC judgment, persuasive=HC judgment, regulatory=circular.
7. READ THE FULL-TEXT RULEBOOKS. Quote the actual statutory language.
8. If the contract is not in English/Hindi/Hinglish, translate internally and add a roadmapNote.
9. Snippets must be at most 400 characters, verbatim from the contract.
10. Return at most one match per rule id.`;
}

function buildTextUserPrompt(
  parsed: ParsedDocument,
  docLanguage: DocLanguage
): string {
  const langHint =
    docLanguage === "en"
      ? "The document is in English."
      : docLanguage === "hi"
      ? "The document is in Hindi (Devanagari)."
      : docLanguage === "hinglish"
      ? "The document is in Hinglish (Roman-script Hindi)."
      : "The document language is not English/Hindi/Hinglish. Translate internally to English before matching and add a roadmapNote.";

  return `DOCUMENT LANGUAGE: ${langHint}
DOCUMENT FILENAME: ${parsed.filename}

CONTRACT TEXT:
"""
 ${(parsed.text ?? "").slice(0, 60_000)}
"""`;
}

function buildVisionSystemPrompt(
  rules: Rule[],
  sector: Sector,
  rulebooks: RulebookDoc[]
): string {
  return (
    buildTextSystemPrompt(rules, sector, rulebooks) +
    `\n\nADDITIONAL: The contract is provided as an IMAGE. Use OCR-like reading of the image to extract the contract text, then apply the same matching rules.`
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
  config: SectorConfig,
  rulebooks: RulebookDoc[]
): Promise<{ matches: RawModelMatch[]; roadmapNote?: string } | null> {
  if (!config.apiKey) return null;
  const groq = getGroq(config.apiKey);

  const sys = buildTextSystemPrompt(rules, sector, rulebooks);
  const user = buildTextUserPrompt(parsed, docLanguage);

  const resp = await groq.chat.completions.create({
    model: config.textModel,
    temperature: 0.1,
    max_tokens: 4096,
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
    return {
      matches: parsedJson.matches ?? [],
      roadmapNote: parsedJson.roadmapNote,
    };
  } catch {
    return {
      matches: [],
      roadmapNote: "Model returned invalid JSON — falling back.",
    };
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
  config: SectorConfig,
  rulebooks: RulebookDoc[]
): Promise<{ matches: RawModelMatch[]; roadmapNote?: string } | null> {
  if (!config.apiKey) return null;
  if (!parsed.base64 || !parsed.mediaType) return null;
  const groq = getGroq(config.apiKey);

  const sys = buildVisionSystemPrompt(rules, sector, rulebooks);
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
    max_tokens: 4096,
    messages: [
      { role: "system", content: sys },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `${langHint}\n\nAnalyse the contract in this image and return JSON as instructed.`,
          },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });

  const raw = resp.choices?.[0]?.message?.content ?? "{}";
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/```$/i, "")
    .trim();
  try {
    const parsedJson = JSON.parse(cleaned) as {
      matches?: RawModelMatch[];
      roadmapNote?: string;
    };
    return {
      matches: parsedJson.matches ?? [],
      roadmapNote: parsedJson.roadmapNote,
    };
  } catch {
    return { matches: [], roadmapNote: "Vision model returned invalid JSON." };
  }
}

// ---------------------------------------------------------------------------
// Deterministic fallback — keyword matcher
// ---------------------------------------------------------------------------

const KEYWORDS_BY_RULE: Record<string, string[]> = {
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

    const confidence =
      hits.length >= 4 ? "high" : hits.length >= 3 ? "medium" : "low";
    const involvesCharge = rule.involvesChargeValidation ?? false;

    matches.push({
      ruleId: rule.id,
      snippet,
      confidence,
      notes: `Fallback match on keywords: ${hits.slice(0, 4).join(", ")}.`,
    });
  }

  const roadmapNote =
    docLanguage !== "en" && docLanguage !== "hi" && docLanguage !== "hinglish"
      ? `Source document language (${docLanguage}) was not English/Hindi/Hinglish — fallback matcher ran on Roman-script subset only.`
      : undefined;

  return { matches, roadmapNote };
}

// ---------------------------------------------------------------------------
// Render templates
// ---------------------------------------------------------------------------

function renderTemplates(
  rule: Rule,
  snippet: string
): { en: string; hi: string } {
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

  // 1. Load rules (local + Supabase merge)
  const rulesResult = await loadRulesForSector(input.sector);
  const rules = rulesResult.rules;
  if (!rules.length) {
    return {
      clauses: [],
      rulesConsidered: 0,
      pipelineMs: 0,
      usedFallback: false,
      keySource: "none",
      rulesFromSupabase: 0,
      rulebooksInjected: 0,
    };
  }

  // 2. Load full-text rulebooks from Supabase
  const rulebooksResult = await loadRulebooksForSector(input.sector);
  const rulebooks = rulebooksResult.docs;

  // 3. Pick the per-sector Groq config
  const config = getSectorConfig(input.sector);

  let raw: { matches: RawModelMatch[]; roadmapNote?: string } | null = null;
  let usedFallback = false;

  if (config.apiKey) {
    try {
      if (input.parsed.kind === "image") {
        raw = await callGroqVision(
          input.parsed,
          rules,
          input.sector,
          input.docLanguage,
          config,
          rulebooks
        );
      } else {
        raw = await callGroqText(
          input.parsed,
          rules,
          input.sector,
          input.docLanguage,
          config,
          rulebooks
        );
      }
    } catch (err) {
      raw = {
        matches: [],
        roadmapNote: `Groq API error (${config.keySource} key): ${(err as Error).message}. Falling back to keyword matcher.`,
      };
    }
  }

  // Fallback — keyword matcher
  if (
    !raw ||
    (raw.matches.length === 0 &&
      input.parsed.kind === "text" &&
      (input.parsed.text ?? "").length > 0)
  ) {
    const fb = fallbackMatch(input.parsed, rules, input.docLanguage);
    if (fb.matches.length > 0 || !raw) {
      raw = fb;
      usedFallback = true;
    }
  }

  // Resolve raw matches to full MatchedClause objects.
  // Deep-research fields are optional — only included if the model returned them.
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
      // Deep-research fields — only included if the model returned them
      ...(m.chargeValidity !== undefined && { chargeValidity: m.chargeValidity }),
      ...(m.chargeExtracted !== undefined && { chargeExtracted: m.chargeExtracted }),
      ...(m.permittedCharge !== undefined && {
        permittedCharge: m.permittedCharge ?? rule.permittedCharge,
      }),
      ...(m.chargeAnalysisEn !== undefined && { chargeAnalysisEn: m.chargeAnalysisEn }),
      ...(m.chargeAnalysisHi !== undefined && { chargeAnalysisHi: m.chargeAnalysisHi }),
      ...(m.summarizedReasonEn !== undefined && { summarizedReasonEn: m.summarizedReasonEn }),
      ...(m.summarizedReasonHi !== undefined && { summarizedReasonHi: m.summarizedReasonHi }),
      ...(m.counterArgumentEn !== undefined && { counterArgumentEn: m.counterArgumentEn }),
      ...(m.counterArgumentHi !== undefined && { counterArgumentHi: m.counterArgumentHi }),
      ...(m.precedentStrength !== undefined && { precedentStrength: m.precedentStrength }),
      ...(m.citedSections !== undefined && { citedSections: m.citedSections }),
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
    rulesFromSupabase: rulesResult.supabaseCount,
    rulebooksInjected: rulebooks.length,
  };
}

export { computeRiskScore as computeRisk };

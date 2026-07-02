// ===========================================================================
// ContractGuard — Shared Types
// ===========================================================================
// These types are imported by rules DBs, the Groq pipeline, the API route
// and the frontend. Keeping them in one place guarantees the contract
// between backend and frontend stays strict.
// ===========================================================================

export type Sector = "construction" | "finance" | "gig-job";

export type DocLanguage = "en" | "hi" | "hinglish";

export type Severity = "high" | "medium" | "low";

export type UiLanguage = "en" | "hi" | "hinglish";

// ---------------------------------------------------------------------------
// Rules DB
// ---------------------------------------------------------------------------

/**
 * A single legally-anchored rule. Each rule describes a clause *pattern*
 * that ContractGuard searches for inside an uploaded contract, the Indian
 * statute or regulation it derives from, and a plain-language explanation
 * template that is rendered for the user once the pattern is matched.
 */
export interface Rule {
  /** Stable identifier, e.g. "RERA-DELAY-001" */
  id: string;
  /** Logical grouping shown as a chip in the UI, e.g. "RERA", "RBI", "BIS" */
  category: string;
  /** Human-readable description of the pattern in English (used as the canonical spec) */
  pattern_description_en: string;
  /** Same pattern described in Hindi (Devanagari) */
  pattern_description_hi: string;
  /** Same pattern in Hinglish (Roman-script Hindi) */
  pattern_description_hinglish: string;
  /** Real Indian statute / circular / standard this rule is anchored to */
  legal_basis: string;
  /** Risk severity if this pattern is matched in a contract */
  severity: Severity;
  /** Plain-English explanation template. {clause} is replaced with the snippet. */
  plainEnglishTemplate: string;
  /** Plain-Hindi explanation template. {clause} is replaced with the snippet. */
  plainHindiTemplate: string;
}

// ---------------------------------------------------------------------------
// Pipeline output
// ---------------------------------------------------------------------------

/**
 * A clause that was matched against a rule. This is what the frontend renders
 * in the report view. The shape is intentionally self-contained: the UI
 * never needs to re-look-up the rule.
 */
export interface MatchedClause {
  /** The rule ID that was matched */
  ruleId: string;
  /** Rule category chip (RERA / RBI / BIS / ICA …) */
  category: string;
  /** Severity of the matched rule */
  severity: Severity;
  /** The exact text snippet lifted from the document */
  snippet: string;
  /** Plain-English explanation, fully rendered */
  explanationEn: string;
  /** Plain-Hindi explanation, fully rendered */
  explanationHi: string;
  /** Legal basis citation */
  legalBasis: string;
  /** Optional note added when the source document was not in en/hi/hinglish */
  roadmapNote?: string;
}

export interface AnalyzeResponse {
  status: "success" | "error";
  /** 0–100 risk score derived from severities of matched clauses */
  riskScore: number;
  /** All clauses the pipeline flagged */
  clauses: MatchedClause[];
  /** Echo of inputs for traceability */
  sector: Sector;
  docLanguage: DocLanguage;
  /** Free-text message — used for errors or roadmap notes */
  message?: string;
  /** Number of rules the pipeline considered */
  rulesConsidered: number;
  /** Wall-clock duration of the analysis in ms (excludes file parse) */
  pipelineMs: number;
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

export interface UiStrings {
  // nav
  nav_brand: string;
  nav_analyze: string;
  nav_transparency: string;
  nav_docs: string;

  // hero
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_quote: string;
  hero_cta: string;

  // dropzone
  dropzone_title: string;
  dropzone_subtitle: string;
  dropzone_button: string;
  dropzone_or_paste: string;
  dropzone_paste_placeholder: string;
  dropzone_paste_submit: string;
  dropzone_pdf_hint: string;
  dropzone_zip_hint: string;
  dropzone_image_hint: string;
  dropzone_clear: string;

  // selectors
  selector_sector_label: string;
  selector_sector_construction: string;
  selector_sector_finance: string;
  selector_sector_gig_job: string;
  selector_doc_lang_label: string;
  selector_doc_lang_en: string;
  selector_doc_lang_hi: string;
  selector_doc_lang_hinglish: string;

  // processing statuses
  status_uploading: string;
  status_parsing: string;
  status_extracting: string;
  status_matching: string;
  status_explaining: string;
  status_done: string;
  status_error: string;

  // report
  report_title: string;
  report_risk_score: string;
  report_risk_low: string;
  report_risk_medium: string;
  report_risk_high: string;
  report_clauses_found: string;
  report_no_clauses: string;
  report_severity_high: string;
  report_severity_medium: string;
  report_severity_low: string;
  report_snippet: string;
  report_explanation: string;
  report_legal_basis: string;
  report_roadmap_note: string;
  report_back: string;
  report_download: string;

  // transparency
  transparency_title: string;
  transparency_intro: string;
  transparency_rules_count: string;
  transparency_legal_basis_heading: string;
  transparency_no_logging_heading: string;
  transparency_no_logging_body: string;
  transparency_ai_role_heading: string;
  transparency_ai_role_body: string;
  transparency_disclaimer_heading: string;
  transparency_disclaimer_body: string;

  // misc
  lang_switch_label: string;
  footer_built: string;
}

export type I18nDictionary = Record<UiLanguage, UiStrings>;

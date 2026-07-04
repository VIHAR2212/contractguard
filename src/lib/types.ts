// ===========================================================================
// ContractGuard — Shared Types
// ===========================================================================

export type Sector = "construction" | "finance" | "gig-job";
export type DocLanguage = "en" | "hi" | "hinglish";
export type Severity = "high" | "medium" | "low";
export type UiLanguage = "en" | "hi" | "hinglish";

export type ChargeValidity =
  | "valid"
  | "invalid"
  | "partially_valid"
  | "not_applicable";

export type PrecedentStrength =
  | "statutory"
  | "binding"
  | "persuasive"
  | "regulatory";

// ---------------------------------------------------------------------------
// Rules DB
// ---------------------------------------------------------------------------

export interface Rule {
  id: string;
  category: string;
  pattern_description_en: string;
  pattern_description_hi: string;
  pattern_description_hinglish: string;
  legal_basis: string;
  severity: Severity;
  plainEnglishTemplate: string;
  plainHindiTemplate: string;

  involvesChargeValidation?: boolean;
  chargeValidationCriteria?: string;
  permittedCharge?: string;

  source?: "local" | "supabase";
}

// ---------------------------------------------------------------------------
// Pipeline output
// ---------------------------------------------------------------------------

export interface MatchedClause {
  ruleId: string;
  category: string;
  severity: Severity;
  snippet: string;
  explanationEn: string;
  explanationHi: string;
  legalBasis: string;
  roadmapNote?: string;

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

  /** New: best-effort page or clause location where the match was found */
  pageLocation?: string;
  /** New: AI-extracted confidence indicator from Groq ("high" | "medium" | "low") */
  extractionConfidence?: "high" | "medium" | "low";
  /** New: AI-generated practical recommendation the user can act on */
  recommendedActionEn?: string;
  recommendedActionHi?: string;
}

// ---------------------------------------------------------------------------
// Document statistics — surfaced in the report for transparency
// ---------------------------------------------------------------------------

export interface DocumentStats {
  /** estimated page count of the source document (text-based heuristic) */
  estimatedPages: number;
  /** total words extracted from the document */
  wordCount: number;
  /** total characters extracted */
  charCount: number;
  /** detected dominant language of the document (en/hi/hinglish) */
  language: DocLanguage;
  /** processing time in milliseconds (full pipeline, including parse) */
  processingTimeMs: number;
  /** how many chunks the document was split into for analysis */
  chunksProcessed: number;
  /** true if the source was a file upload, false if pasted text */
  wasFileUpload: boolean;
  /** original filename or "pasted.txt" */
  filename: string;
}

export interface AnalyzeResponse {
  status: "success" | "error";
  riskScore: number;
  clauses: MatchedClause[];
  sector: Sector;
  docLanguage: DocLanguage;
  message?: string;
  rulesConsidered: number;
  pipelineMs: number;
  rulesFromSupabase?: number;
  rulebooksInjected?: number;
  keySource?: "construction" | "finance" | "gig_job" | "generic" | "none";
  usedFallback?: boolean;

  /** New: total rules in the sector DB (12 by default) */
  rulesTotal: number;
  /** New: rules that did NOT fire (rulesTotal - triggered) */
  rulesPassed: number;
  /** New: rules that triggered (clauses.length) */
  rulesTriggered: number;
  /** New: AI-generated 2-3 sentence executive summary of the document */
  executiveSummaryEn?: string;
  executiveSummaryHi?: string;
  /** New: structured document statistics */
  documentStats?: DocumentStats;
  /** New: unique report ID for the PDF export (e.g. "CG-2026-07-04-A1B2") */
  reportId?: string;
  /** New: ISO timestamp the report was generated */
  generatedAt?: string;
}

// ---------------------------------------------------------------------------
// i18n
// ---------------------------------------------------------------------------

export interface UiStrings {
  nav_brand: string;
  nav_analyze: string;
  nav_transparency: string;
  nav_docs: string;

  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_quote: string;
  hero_cta: string;

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

  selector_sector_label: string;
  selector_sector_construction: string;
  selector_sector_finance: string;
  selector_sector_gig_job: string;
  selector_doc_lang_label: string;
  selector_doc_lang_en: string;
  selector_doc_lang_hi: string;
  selector_doc_lang_hinglish: string;

  status_uploading: string;
  status_parsing: string;
  status_extracting: string;
  status_matching: string;
  status_explaining: string;
  status_done: string;
  status_error: string;

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

  report_charge_validity: string;
  report_charge_valid: string;
  report_charge_invalid: string;
  report_charge_partial: string;
  report_charge_na: string;
  report_charge_extracted: string;
  report_charge_permitted: string;
  report_charge_analysis: string;
  report_summarized_reason: string;
  report_counter_argument: string;
  report_cited_sections: string;
  report_precedent: string;
  report_precedent_statutory: string;
  report_precedent_binding: string;
  report_precedent_persuasive: string;
  report_precedent_regulatory: string;

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
  transparency_supabase_heading: string;
  transparency_supabase_body: string;

  lang_switch_label: string;
  footer_built: string;
}

export type I18nDictionary = Record<UiLanguage, UiStrings>;

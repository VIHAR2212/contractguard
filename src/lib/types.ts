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
// NOTE: The deep-research fields (chargeValidity, chargeAnalysisEn,
// summarizedReasonEn, counterArgumentEn, precedentStrength, citedSections,
// etc.) are OPTIONAL so that both the simple pipeline and the deep-research
// pipeline can produce MatchedClause objects. The UI renders whichever
// fields are present.
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

  // Deep-research fields — optional, populated by the deep-research pipeline
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

  // Deep-research labels (optional in UI — used only if rendered)
  report_charge_validity?: string;
  report_charge_valid?: string;
  report_charge_invalid?: string;
  report_charge_partial?: string;
  report_charge_na?: string;
  report_charge_extracted?: string;
  report_charge_permitted?: string;
  report_charge_analysis?: string;
  report_summarized_reason?: string;
  report_counter_argument?: string;
  report_cited_sections?: string;
  report_precedent?: string;
  report_precedent_statutory?: string;
  report_precedent_binding?: string;
  report_precedent_persuasive?: string;
  report_precedent_regulatory?: string;

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
  transparency_supabase_heading?: string;
  transparency_supabase_body?: string;

  lang_switch_label: string;
  footer_built: string;
}

export type I18nDictionary = Record<UiLanguage, UiStrings>;

// ===========================================================================
// ContractGuard — Shared Types
// ===========================================================================

export type Sector = "construction" | "finance" | "gig-job";
export type DocLanguage = "en" | "hi" | "hinglish";
export type Severity = "high" | "medium" | "low";
export type UiLanguage = "en" | "hi" | "hinglish";

// ---------------------------------------------------------------------------
// Charge validation — the core of "is this fee legal?"
// ---------------------------------------------------------------------------

export type ChargeValidity =
  | "valid"               // the charge is legally permissible
  | "invalid"             // the charge is prohibited / unenforceable
  | "partially_valid"     // the charge exists but the amount/method is wrong
  | "not_applicable";     // this clause doesn't involve a charge

export type PrecedentStrength =
  | "statutory"           // black-letter law (Act / Regulation)
  | "binding"             // Supreme Court judgment
  | "persuasive"          // High Court judgment or tribunal order
  | "regulatory";         // RBI / BIS / RERA circular or guideline

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

  /** Does this rule involve validating a charge / fee / cost? */
  involvesChargeValidation?: boolean;
  /** Criteria for what makes the charge valid (e.g. "must appear in KFS, must be reasonable") */
  chargeValidationCriteria?: string;
  /** Maximum permitted charge (e.g. "10% of booking", "Rs. 500", "actuals only", "0% — prohibited") */
  permittedCharge?: string;

  /** Where this rule came from — local file or Supabase */
  source?: "local" | "supabase";
}

// ---------------------------------------------------------------------------
// Pipeline output — the deep-research result
// ---------------------------------------------------------------------------

export interface MatchedClause {
  ruleId: string;
  category: string;
  severity: Severity;

  /** The exact text snippet lifted from the document */
  snippet: string;

  /** Plain-English explanation (full, from template) */
  explanationEn: string;
  explanationHi: string;

  legalBasis: string;
  roadmapNote?: string;

  // -------------------------------------------------------------------------
  // DEEP RESEARCH — charge validation + counter-argument
  // -------------------------------------------------------------------------

  /** Is the charge/cost in this clause legally valid? */
  chargeValidity: ChargeValidity;

  /** The exact charge amount extracted from the clause (e.g. "25% of total consideration") */
  chargeExtracted?: string;

  /** What the law actually permits (e.g. "max 10% of booking amount") */
  permittedCharge?: string;

  /** Specific analysis of WHY the charge is valid/invalid — with statutory reasoning */
  chargeAnalysisEn: string;
  chargeAnalysisHi: string;

  /** 1-2 sentence powerful summary — the "no lawyer can speak" line */
  summarizedReasonEn: string;
  summarizedReasonHi: string;

  /** Ready-to-use counter-statement the user can send to the builder/bank/employer */
  counterArgumentEn: string;
  counterArgumentHi: string;

  /** Strength of the legal basis */
  precedentStrength: PrecedentStrength;

  /** Specific section numbers cited (e.g. ["Section 18", "Section 14(1)"]) */
  citedSections: string[];
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
  /** How many rules came from Supabase vs. local */
  rulesFromSupabase?: number;
  /** How many rulebook documents were injected as context */
  rulebooksInjected?: number;
  keySource?: "construction" | "finance" | "gig_job" | "generic" | "none";
}

// ---------------------------------------------------------------------------
// i18n — unchanged
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

  // NEW — deep research labels
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

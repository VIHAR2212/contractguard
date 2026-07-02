// ===========================================================================
// /lib/i18n/en.ts
// English UI strings for ContractGuard
// ===========================================================================

import type { UiStrings } from "@/lib/types";

export const en: UiStrings = {
  // nav
  nav_brand: "ContractGuard",
  nav_analyze: "Analyze",
  nav_transparency: "Transparency",
  nav_docs: "Rules DB",

  // hero
  hero_eyebrow: "AI contract review for Indian consumers",
  hero_title: "Read the contract before it reads you.",
  hero_subtitle:
    "Upload a flat-buyer agreement, a personal loan, a credit-card T&C, a gold-loan document or a job offer letter. ContractGuard matches every clause against real Indian law — RERA, RBI, BIS, the Indian Contract Act — and tells you, in plain English or Hindi, what to push back on.",
  hero_quote:
    "\"Most people sign what they don't understand. We translate the legalese into a 60-second risk report.\"",
  hero_cta: "Analyze a contract",

  // dropzone
  dropzone_title: "Drop your contract here",
  dropzone_subtitle:
    "Drag & drop a file, or click to browse. PDF, ZIP, image (PNG/JPG) or plain text — up to 25 MB.",
  dropzone_button: "Choose file",
  dropzone_or_paste: "…or paste the contract text",
  dropzone_paste_placeholder:
    "Paste the full text of the agreement here. Try to include clause numbers and section headings — the matcher uses them as anchors.",
  dropzone_paste_submit: "Analyze pasted text",
  dropzone_pdf_hint: "PDF — we extract the text layer server-side",
  dropzone_zip_hint: "ZIP — we open it and read every PDF / .txt inside",
  dropzone_image_hint: "Image — sent to a vision model that reads the text",
  dropzone_clear: "Clear",

  // selectors
  selector_sector_label: "Sector",
  selector_sector_construction: "Construction (RERA)",
  selector_sector_finance: "Finance / Banking (incl. Gold)",
  selector_sector_gig_job: "Gig-Job / Employment",

  selector_doc_lang_label: "Document language",
  selector_doc_lang_en: "English",
  selector_doc_lang_hi: "Hindi",
  selector_doc_lang_hinglish: "Hinglish",

  // processing statuses
  status_uploading: "Uploading file…",
  status_parsing: "Parsing document…",
  status_extracting: "Extracting clauses…",
  status_matching: "Matching against rule database…",
  status_explaining: "Writing plain-language explanations…",
  status_done: "Done",
  status_error: "Something went wrong.",

  // report
  report_title: "Risk report",
  report_risk_score: "Risk score",
  report_risk_low: "Low risk",
  report_risk_medium: "Medium risk",
  report_risk_high: "High risk",
  report_clauses_found: "Flagged clauses",
  report_no_clauses:
    "No high-risk clauses were matched. This is not legal advice — please have a lawyer review anything you're unsure about.",
  report_severity_high: "High",
  report_severity_medium: "Medium",
  report_severity_low: "Low",
  report_snippet: "From the document",
  report_explanation: "Plain-language explanation",
  report_legal_basis: "Legal basis",
  report_roadmap_note: "Translation note",
  report_back: "Analyze another",
  report_download: "Download report",

  // transparency
  transparency_title: "How ContractGuard works",
  transparency_intro:
    "ContractGuard is a rules engine with an AI language layer on top. Here's exactly what happens to your document, in order.",
  transparency_rules_count:
    "The rule database contains {{count}} hand-curated rules across construction, finance and gig-job sectors.",
  transparency_legal_basis_heading: "Every rule is anchored to a real Indian law",
  transparency_no_logging_heading: "We do not store your document",
  transparency_no_logging_body:
    "Your file is parsed in memory, sent to the Groq inference API for clause extraction, and then discarded. We do not write the original document, the extracted text, or the report to any database. The only thing we keep is an anonymous count of how many documents were analyzed.",
  transparency_ai_role_heading: "What the AI actually does",
  transparency_ai_role_body:
    "The model (Groq) does three things: (1) extracts clause candidates from the document text using the rule pattern descriptions as a guide, (2) matches each candidate to the closest rule, and (3) renders the rule's plain-English / Hindi explanation template with the matched clause text. The model never invents a rule — every rule in the output comes from our verified database.",
  transparency_disclaimer_heading: "Not legal advice",
  transparency_disclaimer_body:
    "ContractGuard is an information tool. It is not a substitute for advice from a qualified advocate. If a matched clause affects a real transaction, please consult a lawyer registered with the Bar Council of India.",

  // misc
  lang_switch_label: "Interface language",
  footer_built: "Built for Indian consumers · RERA · RBI · BIS · ICA",
};

export default en;

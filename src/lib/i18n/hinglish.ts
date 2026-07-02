// ===========================================================================
// /lib/i18n/hinglish.ts
// Hinglish (Roman-script Hindi) UI strings for ContractGuard
// ===========================================================================

import type { UiStrings } from "@/lib/types";

export const hinglish: UiStrings = {
  // nav
  nav_brand: "ContractGuard",
  nav_analyze: "Analyze",
  nav_transparency: "Transparency",
  nav_docs: "Rules DB",

  // hero
  hero_eyebrow: "Indian consumers ke liye AI contract review",
  hero_title: "Contract ko padhne se pehle samajh lo.",
  hero_subtitle:
    "Flat-buyer agreement, personal loan, credit-card T&C, gold loan document ya job offer letter upload karo. ContractGuard har clause ko real Indian law — RERA, RBI, BIS, Indian Contract Act — se match karta hai aur plain English ya Hindi me batata hai ki kaha push back karna hai.",
  hero_quote:
    "\"Aksar log wahi sign karte hain jo samajh nahi aata. Hum legalese ko 60-second ke risk report me badalte hain.\"",
  hero_cta: "Contract analyze karo",

  // dropzone
  dropzone_title: "Apna contract yaha drop karo",
  dropzone_subtitle:
    "File drag & drop karo, ya browse karne ke liye click karo. PDF, ZIP, image (PNG/JPG) ya plain text — 25 MB tak.",
  dropzone_button: "File choose karo",
  dropzone_or_paste: "…ya contract text paste karo",
  dropzone_paste_placeholder:
    "Agreement ka full text yaha paste karo. Clause numbers aur section headings include karne ki koshish karo — matcher unhe anchor ke taur pe use karta hai.",
  dropzone_paste_submit: "Pasted text analyze karo",
  dropzone_pdf_hint: "PDF — hum server-side text layer extract karte hain",
  dropzone_zip_hint: "ZIP — hum ise kholega aur har PDF / .txt padhega",
  dropzone_image_hint: "Image — vision model ko bhej di jaati hai jo text padhti hai",
  dropzone_clear: "Clear",

  // selectors
  selector_sector_label: "Sector",
  selector_sector_construction: "Construction (RERA)",
  selector_sector_finance: "Finance / Banking (Gold included)",
  selector_sector_gig_job: "Gig-Job / Employment",

  selector_doc_lang_label: "Document language",
  selector_doc_lang_en: "English",
  selector_doc_lang_hi: "Hindi",
  selector_doc_lang_hinglish: "Hinglish",

  // processing statuses
  status_uploading: "File upload ho rahi hai…",
  status_parsing: "Document parse ho raha hai…",
  status_extracting: "Clauses extract ho rahe hain…",
  status_matching: "Rule database se match ho raha hai…",
  status_explaining: "Plain-language explanation likha ja raha hai…",
  status_done: "Done",
  status_error: "Kuch galat ho gaya.",

  // report
  report_title: "Risk report",
  report_risk_score: "Risk score",
  report_risk_low: "Low risk",
  report_risk_medium: "Medium risk",
  report_risk_high: "High risk",
  report_clauses_found: "Flagged clauses",
  report_no_clauses:
    "Koi high-risk clause match nahi hua. Ye legal advice nahi hai — kisi bhi doubt ke liye lawyer se consult karo.",
  report_severity_high: "High",
  report_severity_medium: "Medium",
  report_severity_low: "Low",
  report_snippet: "Document se",
  report_explanation: "Plain-language explanation",
  report_legal_basis: "Legal basis",
  report_roadmap_note: "Translation note",
  report_back: "Doosra analyze karo",
  report_download: "Report download karo",

  // transparency
  transparency_title: "ContractGuard kaise kaam karta hai",
  transparency_intro:
    "ContractGuard ek rules engine hai jiske upar AI language layer hai. Yeh exactly aapke document ke sath kya hota hai, order me.",
  transparency_rules_count:
    "Rule database me construction, finance aur gig-job sectors me {{count}} hand-curated rules hain.",
  transparency_legal_basis_heading: "Har rule ek real Indian law se anchored hai",
  transparency_no_logging_heading: "Hum aapka document store nahi karte",
  transparency_no_logging_body:
    "Aapki file memory me parse hoti hai, clause extraction ke liye Groq API ko bheji jaati hai, aur phir discard kar di jaati hai. Hum original document, extracted text ya report kisi database me nahi likhte. Sirf cheez jo hum rakhte hain wo anonymous count hai ki kitne documents analyze hue.",
  transparency_ai_role_heading: "AI actually karta kya hai",
  transparency_ai_role_body:
    "Model (Groq) teen kaam karta hai: (1) rule pattern descriptions ka use karke document text se clause candidates extract karta hai, (2) har candidate ko closest rule se match karta hai, aur (3) rule ka plain-English / Hindi explanation template matched clause text ke sath render karta hai. Model kabhi naya rule invent nahi karta — output me har rule hamare verified database se aata hai.",
  transparency_disclaimer_heading: "Legal advice nahi",
  transparency_disclaimer_body:
    "ContractGuard ek information tool hai. Ye qualified advocate ki advice ka substitute nahi hai. Agar koi matched clause real transaction ko affect karta hai, to please Bar Council of India ke paas registered lawyer se consult karo.",

  // misc
  lang_switch_label: "Interface language",
  footer_built: "Indian consumers ke liye banaya · RERA · RBI · BIS · ICA",
};

export default hinglish;

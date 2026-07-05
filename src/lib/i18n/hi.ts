// ===========================================================================
// /lib/i18n/hi.ts
// हिन्दी (Devanagari) UI strings for ContractGuard
// ===========================================================================

import type { UiStrings } from "@/lib/types";

export const hi: UiStrings = {
  // nav
  nav_brand: "कॉन्ट्रैक्टगार्ड",
  nav_analyze: "विश्लेषण",
  nav_transparency: "पारदर्शिता",
  nav_docs: "नियम डेटाबेस",

  // hero
  hero_eyebrow: "भारतीय उपभोक्ताओं के लिए AI अनुबंध समीक्षा",
  hero_title: "अनुबंध को पढ़ने से पहले उसे समझ लें।",
  hero_subtitle:
    "फ्लैट-खरीदार समझौता, पर्सनल लोन, क्रेडिट कार्ड T&C, गोल्ड लोन या नौकरी ऑफ़र पत्र अपलोड करें। कॉन्ट्रैक्टगार्ड हर धारा को वास्तविक भारतीय कानून — RERA, RBI, BIS, भारतीय अनुबंध अधिनियम — से मिलाता है और आपको सादे अंग्रेज़ी या हिन्दी में बताता है कि किस पर आपत्ति करनी है।",
  hero_quote:
    "\"अधिकांश लोग वही साइन करते हैं जो वे समझते नहीं हैं। हम कानूनी भाषा को 60-सेकंड की जोखिम रिपोर्ट में बदलते हैं।\"",
  hero_cta: "अनुबंध का विश्लेषण करें",

  // dropzone
  dropzone_title: "अपना अनुबंध यहाँ छोड़ें",
  dropzone_subtitle:
    "फ़ाइल खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें। PDF, ZIP, छवि (PNG/JPG) या सादा पाठ — 25 MB तक।",
  dropzone_button: "फ़ाइल चुनें",
  dropzone_or_paste: "…या अनुबंध का पाठ चिपकाएँ",
  dropzone_paste_placeholder:
    "समझौते का पूरा पाठ यहाँ चिपकाएँ। धारा संख्या और अनुभाग शीर्षक शामिल करने का प्रयास करें — मैचर उन्हें एंकर के रूप में उपयोग करता है।",
  dropzone_paste_submit: "चिपकाए गए पाठ का विश्लेषण करें",
  dropzone_pdf_hint: "PDF — हम सर्वर पर टेक्स्ट लेयर निकालते हैं",
  dropzone_zip_hint: "ZIP — हम इसे खोलते हैं और हर PDF / .txt पढ़ते हैं",
  dropzone_image_hint: "छवि — विज़न मॉडल को भेजी जाती है जो पाठ पढ़ता है",
  dropzone_clear: "साफ़ करें",

  // selectors
  selector_sector_label: "क्षेत्र",
  selector_sector_construction: "निर्माण (RERA)",
  selector_sector_finance: "वित्त / बैंकिंग (सोना सहित)",
  selector_sector_gig_job: "गिग-जॉब / रोजगार",

  selector_doc_lang_label: "दस्तावेज़ की भाषा",
  selector_doc_lang_en: "अंग्रेज़ी",
  selector_doc_lang_hi: "हिन्दी",
  selector_doc_lang_hinglish: "हिंग्लिश",

  // processing statuses
  status_uploading: "फ़ाइल अपलोड हो रही है…",
  status_parsing: "दस्तावेज़ पार्स हो रहा है…",
  status_extracting: "धाराएँ निकाली जा रही हैं…",
  status_matching: "नियम डेटाबेस से मिलान हो रहा है…",
  status_explaining: "सादे-भाषा स्पष्टीकरण लिखे जा रहे हैं…",
  status_done: "पूर्ण",
  status_error: "कुछ गलत हुआ।",

  // report
  report_title: "जोखिम रिपोर्ट",
  report_risk_score: "जोखिम स्कोर",
  report_risk_low: "कम जोखिम",
  report_risk_medium: "मध्यम जोखिम",
  report_risk_high: "उच्च जोखिम",
  report_clauses_found: "ध्वजित धाराएँ",
  report_no_clauses:
    "कोई उच्च-जोखिम धारा मेल नहीं खाई। यह कानूनी सलाह नहीं है — किसी भी संदिग्ध बात के लिए वकील से सलाह लें।",
  report_severity_high: "उच्च",
  report_severity_medium: "मध्यम",
  report_severity_low: "कम",
  report_snippet: "दस्तावेज़ से",
  report_explanation: "सादे-भाषा स्पष्टीकरण",
  report_legal_basis: "कानूनी आधार",
  report_roadmap_note: "अनुवाद नोट",
  report_back: "दूसरा विश्लेषण करें",
  report_download: "रिपोर्ट डाउनलोड करें",

  // transparency
  transparency_title: "कॉन्ट्रैक्टगार्ड कैसे काम करता है",
  transparency_intro:
    "कॉन्ट्रैक्टगार्ड एक नियम इंजन है जिसके ऊपर AI भाषा परत है। यहाँ आपके दस्तावेज़ के साथ क्रम से क्या होता है, यह बताया गया है।",
  transparency_rules_count:
    "नियम डेटाबेस में निर्माण, वित्त और गिग-जॉब क्षेत्रों में {{count}} हाथ से तैयार किए गए नियम हैं।",
  transparency_legal_basis_heading: "हर नियम एक वास्तविक भारतीय कानून से जुड़ा है",
  transparency_no_logging_heading: "हम आपका दस्तावेज़ संग्रहीत नहीं करते",
  transparency_no_logging_body:
    "आपकी फ़ाइल मेमोरी में पार्स होती है, धारा निष्कर्ष के लिए Groq API को भेजी जाती है, और फिर हटा दी जाती है। हम मूल दस्तावेज़, निकाला गया पाठ या रिपोर्ट किसी भी डेटाबेस में नहीं लिखते। एकमात्र चीज़ जो हम रखते हैं वह कितने दस्तावेज़ विश्लेषित किए गए, उसकी गुमनाम संख्या है।",
  transparency_ai_role_heading: "AI वास्तव में क्या करता है",
  transparency_ai_role_body:
    "मॉडल (Groq) तीन काम करता है: (1) नियम पैटर्न विवरण का उपयोग करके दस्तावेज़ पाठ से धारा उम्मीदवार निकालता है, (2) हर उम्मीदवार को निकटतम नियम से मिलाता है, और (3) नियम की सादे-अंग्रेज़ी / हिन्दी व्याख्या टेम्पलेट को मेल खाए धारा पाठ के साथ रेंडर करता है। मॉडल कभी नया नियम नहीं बनाता — आउटपुट में हर नियम हमारे सत्यापित डेटाबेस से आता है।",
  transparency_disclaimer_heading: "कानूनी सलाह नहीं",
  transparency_disclaimer_body:
    "कॉन्ट्रैक्टगार्ड एक सूचना उपकरण है। यह योग्य अधिवक्ता से सलाह का विकल्प नहीं है। यदि कोई मेल खाई धारा किसी वास्तविक लेन-देन को प्रभावित करती है, तो कृपया बार काउंसिल ऑफ़ इंडिया के पास पंजीकृत वकील से सलाह लें।",

  // misc
  report_charge_validity: "शुल्क वैधता",
  report_charge_valid: "वैध",
  report_charge_invalid: "अवैध",
  report_charge_partial: "आंशिक रूप से वैध",
  report_charge_na: "लागू नहीं",
  report_charge_extracted: "अनुबंध क्या कहता है",
  report_charge_permitted: "कानून क्या अनुमति देता है",
  report_charge_analysis: "शुल्क सत्यापन",
  report_summarized_reason: "निचली रेखा",
  report_counter_argument: "यह वापस भेजें",
  report_cited_sections: "उद्धृत धाराएँ",
  report_precedent: "नज़ीर की ताकत",
  report_precedent_statutory: "वैधानिक",
  report_precedent_binding: "बाध्यकारी (SC)",
  report_precedent_persuasive: "प्रेरक (HC)",
  report_precedent_regulatory: "विनियामक",

  transparency_supabase_heading: "भारतीय कानून के पूर्ण पाठ द्वारा समर्थित",
  transparency_supabase_body:
    "कॉन्ट्रैक्टगार्ड Supabase रूलबुक डेटाबेस से वास्तविक वैधानिक पाठ — RERA अधिनियम, RBI मास्टर निर्देश, BIS हॉलमार्किंग विनियम — पढ़ता है। हर शुल्क सत्यापन विशिष्ट धारा का हवाला देता है।",

  lang_switch_label: "इंटरफ़ेस भाषा",
  footer_built: "भारतीय उपभोक्ताओं के लिए बनाया गया · RERA · RBI · BIS · ICA",
};

export default hi;

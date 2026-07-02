// ===========================================================================
// /lib/rules/gig-job-rules.ts
// ---------------------------------------------------------------------------
// Sector: Gig-Job / Employment
// Document scope: Job offer letter / employment contract (white-collar,
//   blue-collar and platform-gig engagements)
//
// Every rule below is anchored to a real Indian statute — the Indian
// Contract Act 1872, Industrial Employment (Standing Orders) Act 1946,
// Industrial Disputes Act 1947, Code on Wages 2019, the Code on Social
// Security 2020 (which now formally recognises gig workers), or relevant
// Shop & Establishments / PF / ESI rules. Severities reflect how badly
// a matched clause prejudices the worker.
// ===========================================================================

import type { Rule } from "@/lib/types";

export const gigJobRules: Rule[] = [
  // 1. Unilateral rate / pay cut
  {
    id: "GIG-RATE-001",
    category: "ICA / Wages",
    pattern_description_en:
      "Clause that allows the employer or platform to unilaterally revise downward the worker's pay rate, incentive structure, or piece-rate per task, with effect from a date chosen by the employer/platform and without fresh consideration or notice, contrary to the Indian Contract Act Section 2(d) and the Code on Wages 2019 (which requires prospective notice of any reduction and prohibits deductions not authorised by the Code).",
    pattern_description_hi:
      "ऐसी धारा जो नियोक्ता या प्लेटफ़ॉर्म को ताज़ा विचार या सूचना के बिना कर्मचारी के वेतन दर, प्रोत्साहन संरचना या प्रति-कार्य दर को एकतरफा नीचे संशोधित करने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo employer ya platform ko fresh consideration ya notice ke bina worker ki pay rate, incentive structure, ya per-task rate ko ek-tarfa neeche revise karne de.",
    legal_basis:
      "Indian Contract Act, 1872 — Section 2(d) (consideration); Code on Wages, 2019 — Sections 13, 18 (prospective notice, deductions)",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the employer/platform unilaterally cut your pay, incentives, or per-task rate without fresh consideration or notice. Under the Indian Contract Act Section 2(d) any change to consideration requires a fresh agreement, and the Code on Wages 2019 requires prospective written notice of any reduction in wages. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता/प्लेटफ़ॉर्म को ताज़ा विचार या सूचना के बिना आपके वेतन, प्रोत्साहन या प्रति-कार्य दर को एकतरफा काटने देती है। भारतीय अनुबंध अधिनियम धारा 2(d) के तहत विचार में किसी भी बदलाव के लिए ताज़ा अनुबंध चाहिए, और वेतन संहिता 2019 वेतन में कमी की संभावित लिखित सूचना चाहती है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 2. No-fault termination without notice
  {
    id: "GIG-TERM-002",
    category: "IDA / Standing Orders",
    pattern_description_en:
      "Clause that allows the employer to terminate the worker 'at will', 'without cause', or 'without notice' (or with notice shorter than the statutory minimum — typically 30 days or one month's wages), without following the procedure of the Industrial Employment (Standing Orders) Act 1946 / Industrial Disputes Act 1947 Section 25F, including the requirement to give retrenchment compensation equal to 15 days' pay for every completed year of service.",
    pattern_description_hi:
      "ऐसी धारा जो नियोक्ता को 'इच्छानुसार', 'बिना कारण' या 'बिना सूचना' कर्मचारी को समाप्त करने की अनुमति देती है, बिना IDA धारा 25F के तहत सूचना और 15 दिन के वेतन के अवसर-कर-वर्ष हरजाने का भुगतान किए।",
    pattern_description_hinglish:
      "Aasi clause jo employer ko 'at will', 'without cause' ya 'without notice' worker ko terminate karne de, bina IDA Section 25F ke under notice aur 15 din ke pay per completed year ka compensation diye.",
    legal_basis:
      "Industrial Disputes Act, 1947 — Section 25F (retrenchment compensation); Industrial Employment (Standing Orders) Act, 1946",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the employer terminate you 'at will' or without notice. Under the Industrial Disputes Act Section 25F, any retrenchment of a worker with at least one year of continuous service requires one month's notice (or wages in lieu) and retrenchment compensation of 15 days' wages for every completed year of service. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता को 'इच्छानुसार' या बिना सूचना आपको समाप्त करने देती है। औद्योगिक विवाद अधिनियम धारा 25F के तहत, कम से कम एक वर्ष की निरंतर सेवा वाले कर्मचारी को एक माह की सूचना (या उसके बदले वेतन) और हर पूर्ण वर्ष के लिए 15 दिन के वेतन के बराबर हरजाना चाहिए। मिलान की गई धारा: \"{clause}\"।",
  },

  // 3. Overbroad non-compete
  {
    id: "GIG-NONCOMPETE-003",
    category: "ICA Section 27",
    pattern_description_en:
      "Clause that imposes a post-termination non-compete on the worker — i.e. a restraint from working for any competitor, in any geography, for any duration, after the engagement ends — which is void under Section 27 of the Indian Contract Act, 1872, except for sale of goodwill or during the term of employment (a negative covenant during service is permitted; a post-service restraint is not).",
    pattern_description_hi:
      "ऐसी धारा जो सेवा समाप्ति के बाद कर्मचारी को प्रतिस्पर्धी के साथ काम करने से रोकती है, जो भारतीय अनुबंध अधिनियम धारा 27 के तहत शून्य है।",
    pattern_description_hinglish:
      "Aasi clause jo service ke baad worker ko competitor ke saath kaam karne se rok de, jo Indian Contract Act Section 27 ke under void hai.",
    legal_basis:
      "Indian Contract Act, 1872 — Section 27 (agreement in restraint of trade); Niranjan Shankar Golikari v. Century Spinning (1967) 2 SCR 378; Percept D'Mark v. Zaheer Khan (2006) 4 SCC 227",
    severity: "high",
    plainEnglishTemplate:
      "This clause imposes a post-termination non-compete on you. Section 27 of the Indian Contract Act, 1872 makes agreements in restraint of trade void, with narrow exceptions (sale of goodwill). The Supreme Court (Percept D'Mark, 2006) has confirmed that a negative covenant is valid only during the term of employment — not after. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आप पर समाप्ति के बाद गैर-प्रतिस्पर्धा थोपती है। भारतीय अनुबंध अधिनियम धारा 27 व्यापार में रोक वाले अनुबंधों को शून्य घोषित करती है, संकीर्ण अपवादों के साथ। सुप्रीम कोर्ट (Percept D'Mark, 2006) ने पुष्टि की है कि नकारात्मक समझौता केवल सेवा के दौरान मान्य है — बाद में नहीं। मिलान की गई धारा: \"{clause}\"।",
  },

  // 4. Unpaid probation extension
  {
    id: "GIG-PROBATION-004",
    category: "Standing Orders",
    pattern_description_en:
      "Clause that allows the employer to extend the probation period unilaterally and indefinitely, or that strips the probationer of salary, statutory benefits (PF/ESI/bonus), or the notice-period entitlement that would apply to a confirmed employee, contrary to the Industrial Employment (Standing Orders) Act 1946 (which caps probation at 3 months, extendable to 6 with recorded reasons) and the EPF / ESI Acts which apply from day one of employment.",
    pattern_description_hi:
      "ऐसी धारा जो नियोक्ता को परिवीक्षा अवधि को अनिश्चित काल तक एकतरफा बढ़ाने या परिवीक्षार्थी को वेतन, वैधानिक लाभ या सूचना अवधि से वंचित करने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo employer ko probation period ko indefinitely ek-tarfa extend karne ya probationer ko salary, statutory benefits ya notice period se vanchit karne de.",
    legal_basis:
      "Industrial Employment (Standing Orders) Act, 1946 (probation capped at 3 months, extendable to 6); EPF Act 1952; ESI Act 1948 (apply from day one)",
    severity: "medium",
    plainEnglishTemplate:
      "This clause lets the employer extend probation indefinitely or strip you of statutory benefits during probation. The Standing Orders Act caps probation at 3 months (extendable to 6 with recorded reasons), and the EPF and ESI Acts apply from day one of employment — there is no 'probation exclusion' from statutory benefits. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता को परिवीक्षा अनिश्चित काल तक बढ़ाने या परिवीक्षा के दौरान आपको वैधानिक लाभों से वंचित करने देती है। स्टैंडिंग ऑर्डर अधिनियम परिवीक्षा को 3 महीने (रिकॉर्ड किए गए कारणों से 6 तक बढ़ाया) तक सीमित करता है, और EPF तथा ESI अधिनियम रोजगार के पहले दिन से लागू होते हैं — परिवीक्षा अपवाद नहीं है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 5. Broad NDA covering non-confidential info
  {
    id: "GIG-NDA-005",
    category: "ICA",
    pattern_description_en:
      "Clause that defines 'confidential information' so broadly as to include the worker's general skills, industry knowledge, public-domain information, or information the worker already possessed before joining, and that imposes a confidentiality obligation that survives indefinitely without a legitimate business interest, contrary to the reasonableness test under Section 27 of the Indian Contract Act and Supreme Court rulings on restraint of trade.",
    pattern_description_hi:
      "ऐसी धारा जो 'गोपनीय जानकारी' को इतनी व्यापक परिभाषित करती है कि उसमें कर्मचारी की सामान्य कौशल, उद्योग ज्ञान, सार्वजनिक जानकारी, या शामिल होने से पहले की जानकारी शामिल हो जाए।",
    pattern_description_hinglish:
      "Aasi clause jo 'confidential information' ko itna broadly define kare ki usme worker ki general skills, industry knowledge, public-domain info, ya joining se pehle ki info shamil ho jaye.",
    legal_basis:
      "Indian Contract Act, 1872 — Section 19 (voidability) and Section 27; Superintendence Co. of India v. Krishan Murgai (1980) 2 SCC 244",
    severity: "medium",
    plainEnglishTemplate:
      "This clause defines 'confidential information' so broadly that it captures your general skills, industry know-how, public-domain information, or things you already knew before joining. Courts have repeatedly struck down such over-broad confidentiality clauses (Superintendence Co. v. Krishan Murgai, 1980) as unreasonable restraints. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा 'गोपनीय जानकारी' को इतना व्यापक परिभाषित करती है कि इसमें आपकी सामान्य कौशल, उद्योग ज्ञान, सार्वजनिक जानकारी, या शामिल होने से पहले की जानकारी शामिल हो जाती है। न्यायालयों ने बार-बार ऐसी अति-व्यापक गोपनीयता धाराओं (Superintendence Co. v. Krishan Murgai, 1980) को अनुचित रोक माना है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 6. IP assignment of pre-existing work
  {
    id: "GIG-IP-006",
    category: "IP / ICA",
    pattern_description_en:
      "Clause that requires the worker to assign to the employer all intellectual property — including (a) inventions made before the date of joining, (b) inventions made on the worker's own time without using the employer's resources, or (c) work product that falls outside the scope of employment — without separate consideration, contrary to Section 2(d) and Section 19 of the Indian Contract Act and the Patents Act 1970 (which requires specific assignment and consideration for patent rights).",
    pattern_description_hi:
      "ऐसी धारा जो कर्मचारी को शामिल होने से पहले के आविष्कार, अपने समय पर बिना नियोक्ता संसाधन के आविष्कार, या रोजगार के दायरे से बाहर के कार्य को बिना अलग विचार के नियोक्ता को सौंपने की आवश्यकता रखती है।",
    pattern_description_hinglish:
      "Aasi clause jo worker ko joining se pehle ke inventions, apne time pe bina employer resources ke inventions, ya employment scope ke bahar ka work bina separate consideration ke employer ko assign karne kahe.",
    legal_basis:
      "Indian Contract Act, 1872 — Sections 2(d) & 19; Patents Act, 1970 — Sections 2(1)(s), 6, 7 (assignment requires consideration); Copyright Act, 1957 — Section 19",
    severity: "medium",
    plainEnglishTemplate:
      "This clause sweeps in your pre-joining inventions, your own-time work, and out-of-scope work, and assigns all of it to the employer without separate consideration. Section 2(d) of the Indian Contract Act requires consideration for every assignment, and the Patents Act treats assignment as a separate transaction requiring fresh consideration. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आपके शामिल होने से पहले के आविष्कार, अपने समय के कार्य और दायरे से बाहर के कार्य को शामिल करती है और बिना अलग विचार के सब नियोक्ता को सौंपती है। भारतीय अनुबंध अधिनियम धारा 2(d) हर असाइनमेंट के लिए विचार चाहती है, और पेटेंट अधिनियम असाइनमेंट को ताज़ा विचार के साथ अलग लेन-देन मानता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 7. Exclusivity for gig worker (no other platform)
  {
    id: "GIG-EXCLUSIVITY-007",
    category: "CoSS 2020",
    pattern_description_en:
      "Clause that requires a gig worker to work exclusively for one platform, prohibits multi-appivering / multi-platform engagement, or penalises the worker for accepting work on other platforms, contrary to the framework of the Code on Social Security 2020 (which recognises gig workers as a distinct class entitled to portability of benefits) and Section 27 of the Indian Contract Act (restraint of trade).",
    pattern_description_hi:
      "ऐसी धारा जो गिग कर्मचारी को एक प्लेटफ़ॉर्म के लिए विशेष रूप से काम करने, बहु-प्लेटफ़ॉर्म जुड़ने से रोकने, या अन्य प्लेटफ़ॉर्म पर काम स्वीकार करने पर दंडित करने की आवश्यकता रखती है।",
    pattern_description_hinglish:
      "Aasi clause jo gig worker ko ek platform ke liye exclusively kaam karne, multi-platform join karne se rokne, ya doosre platform pe kaam accept karne pe penalise kare.",
    legal_basis:
      "Code on Social Security, 2020 — Section 2(35) (gig worker definition), Sections 113–114 (portability); Indian Contract Act, 1872 — Section 27",
    severity: "medium",
    plainEnglishTemplate:
      "This clause forces you to work exclusively for one platform and punishes you for multi-platform engagement. The Code on Social Security 2020 recognises gig workers as a distinct class entitled to portable benefits, and Section 27 of the Indian Contract Act makes restraints on your ability to work for others void. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आपको एक प्लेटफ़ॉर्म के लिए विशेष रूप से काम करने के लिए मजबूर करती है और बहु-प्लेटफ़ॉर्म जुड़ने पर दंडित करती है। सामाजिक सुरक्षा संहिता 2020 गिग कर्मचारियों को पोर्टेबल लाभों के हकदार एक अलग वर्ग के रूप में मानती है, और भारतीय अनुबंध अधिनियम धारा 27 दूसरों के लिए काम करने की क्षमता पर रोक को शून्य घोषित करती है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 8. Auto-debit / payment bond
  {
    id: "GIG-DEBIT-008",
    category: "Consumer / ICA",
    pattern_description_en:
      "Clause that requires the worker to execute a mandate allowing the employer/platform to auto-debit from the worker's bank account for 'damages', 'shortfalls', 'penalties', 'customer complaints' or similar open-ended reasons, or to forfeit a 'security deposit' without an adjudication, contrary to the Consumer Protection Act 2019 (unfair terms) and the Indian Contract Act Section 23 (opposed to public policy).",
    pattern_description_hi:
      "ऐसी धारा जो कर्मचारी को नियोक्ता/प्लेटफ़ॉर्म को 'नुकसान', 'कमी', 'जुर्माना' आदि खुले कारणों के लिए ऑटो-डेबिट की अनुमति देने या बिना निर्णय के 'सुरक्षा जमा' जब्त करने की आवश्यकता रखती है।",
    pattern_description_hinglish:
      "Aasi clause jo worker ko employer/platform ko 'damages', 'shortfall', 'penalty' jaise open-ended reasons ke liye auto-debit ki anumati dene ya bina adjudication ke 'security deposit' forfeit karne kahe.",
    legal_basis:
      "Consumer Protection Act, 2019 — Section 2(46) (unfair contract); Indian Contract Act, 1872 — Section 23 (opposed to public policy)",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the employer auto-debit your bank account or forfeit your security deposit for open-ended reasons like 'damages' or 'customer complaints' without any adjudication. The Consumer Protection Act 2019 empowers the Consumer Commissions to declare such terms as 'unfair', and Section 23 of the Indian Contract Act voids agreements opposed to public policy. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता को बिना किसी निर्णय के 'नुकसान' या 'ग्राहक शिकायतों' जैसे खुले कारणों से आपके बैंक खाते से ऑटो-डेबिट या सुरक्षा जमा जब्त करने देती है। उपभोक्ता संरक्षण अधिनियम 2019 उपभोक्ता आयोगों को ऐसी शर्तों को 'अनुचित' घोषित करने का अधिकार देता है, और भारतीय अनुबंध अधिनियम धारा 23 लोकनीति के विरुद्ध अनुबंधों को शून्य करती है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 9. Data access / device monitoring without notice
  {
    id: "GIG-DATA-009",
    category: "DPDP Act",
    pattern_description_en:
      "Clause that allows the employer/platform to access the worker's personal device, contacts, messages, location, or biometric data without prior, explicit, revocable consent, or to use the worker's personal data for purposes unrelated to the engagement, contrary to the Digital Personal Data Protection Act 2023 (which requires specific, informed consent, purpose limitation, and a right to withdraw).",
    pattern_description_hi:
      "ऐसी धारा जो नियोक्ता/प्लेटफ़ॉर्म को पूर्व, स्पष्ट, वापस लेने योग्य सहमति के बिना कर्मचारी के व्यक्तिगत डिवाइस, संपर्क, संदेश, स्थान या बायोमेट्रिक डेटा तक पहुँचने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo employer/platform ko prior, explicit, revocable consent ke bina worker ke personal device, contacts, messages, location, ya biometric data tak access ki anumati de.",
    legal_basis:
      "Digital Personal Data Protection Act, 2023 — Sections 4, 6, 7 (consent, purpose limitation, right to withdraw)",
    severity: "medium",
    plainEnglishTemplate:
      "This clause lets the employer/platform access your personal device, contacts, messages, location or biometric data without specific informed consent, or use your data for unrelated purposes. The Digital Personal Data Protection Act 2023 requires explicit, purpose-limited consent and a right to withdraw. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता/प्लेटफ़ॉर्म को बिना विशिष्ट सूचित सहमति के आपके व्यक्तिगत डिवाइस, संपर्क, संदेश, स्थान या बायोमेट्रिक डेटा तक पहुँचने या असंबंधित उद्देश्यों के लिए आपके डेटा का उपयोग करने देती है। डिजिटल व्यक्तिगत डेटा संरक्षण अधिनियम 2023 स्पष्ट, उद्देश्य-सीमित सहमति और वापस लेने का अधिकार चाहता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 10. Dispute resolution — distant / foreign forum
  {
    id: "GIG-JURIS-010",
    category: "ICA",
    pattern_description_en:
      "Clause that designates an exclusive forum in a distant city or a foreign seat of arbitration for all disputes, ousting the worker's ability to sue in the court of the place of work or place where the worker resides, contrary to Section 20 of the Code of Civil Procedure (court where the defendant resides or cause of action arises) and the principle that such clauses are not unconscionable only if both parties have equal bargaining power.",
    pattern_description_hi:
      "ऐसी धारा जो सभी विवादों के लिए एक दूर के शहर या विदेशी मध्यस्थता को विशेष मंच नामित करती है, जिससे कर्मचारी कार्यस्थल या निवास स्थान की न्यायालय में मुकदमा नहीं कर सकता।",
    pattern_description_hinglish:
      "Aasi clause jo saare disputes ke liye ek distant city ya foreign arbitration seat ko exclusive forum name kare, jisse worker kaam ki jagah ya rehne ki jagah ki court me case nahi chal paaye.",
    legal_basis:
      "Code of Civil Procedure, 1908 — Section 20; Indian Contract Act, 1872 — Section 23 (opposed to public policy); Arti Devi v. Bhagwati Devi ratio on unconscionable forum clauses",
    severity: "low",
    plainEnglishTemplate:
      "This clause sends all your disputes to a distant city or a foreign arbitral seat. Section 20 of the CPC lets you sue where the defendant resides or where the cause of action arose, and courts treat exclusive forum clauses in contracts of adhesion (like employment contracts) with suspicion — they are often struck down as unconscionable. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आपके सभी विवादों को एक दूर के शहर या विदेशी मध्यस्थता स्थान पर भेजती है। CPC धारा 20 आपको जहाँ प्रतिवादी निवास करता है या जहाँ कारण उत्पन्न हुआ वहाँ मुकदमा करने देती है, और न्यायालय अनुबंध के अधीनता वाले अनुबंधों (जैसे रोजगार) में विशेष मंच खंडों पर संदेह करते हैं। मिलान की गई धारा: \"{clause}\"।",
  },

  // 11. Notice period asymmetric
  {
    id: "GIG-NOTICE-011",
    category: "Standing Orders",
    pattern_description_en:
      "Clause that requires the worker to give a longer notice period (e.g. 90 days) to resign than the employer must give to terminate (e.g. 30 days), or that requires the worker to serve the full notice period with no option to pay in lieu, while allowing the employer to terminate summarily or with shorter notice — a one-sided notice asymmetry disapproved under the Industrial Employment (Standing Orders) Act and the Industrial Disputes Act.",
    pattern_description_hi:
      "ऐसी धारा जो कर्मचारी को इस्तीफ़ा देने के लिए नियोक्ता के समाप्त करने से अधिक नोटिस अवधि (जैसे 90 दिन बनाम 30 दिन) मांगती है, या कर्मचारी को पूरी अवधि सेवा करने की आवश्यकता रखती है।",
    pattern_description_hinglish:
      "Aasi clause jo worker ko resign karne ke liye employer ke terminate karne se zyada notice period (jaise 90 din vs 30 din) maange, ya worker ko poori period serve karne kahe.",
    legal_basis:
      "Industrial Employment (Standing Orders) Act, 1946 — Schedule I (notice periods); Industrial Disputes Act, 1947 — Sections 25F, 25N",
    severity: "low",
    plainEnglishTemplate:
      "This clause imposes an asymmetric notice period — a long one on your resignation and a shorter one on the employer's termination, with no pay-in-lieu option for you. Courts and labour authorities have repeatedly read down such one-sided notice clauses under the Standing Orders Act and the Industrial Disputes Act. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा एक असममित नोटिस अवधि थोपती है — आपके इस्तीफ़े पर लंबी, नियोक्ता की समाप्ति पर छोटी, आपके लिए बिना वेतन-बदले विकल्प के। न्यायालय और श्रम अधिकारियों ने बार-बार ऐसी एक-तरफा नोटिस धाराओं को स्टैंडिंग ऑर्डर अधिनियम और औद्योगिक विवाद अधिनियम के तहत कम किया है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 12. Code of conduct / social media off-duty
  {
    id: "GIG-SOCIAL-012",
    category: "ICA / DPDP",
    pattern_description_en:
      "Clause that extends the employer's code of conduct / social-media policy to the worker's personal, off-duty, off-platform speech on matters of public interest (e.g. prohibiting 'negative comments about the industry', 'criticism of government policy', or 'joining any protest'), contrary to the worker's fundamental right to free expression (Article 19(1)(a) of the Constitution, which is recognised as a relevant public-policy consideration in private contracts under Section 23 of the Indian Contract Act).",
    pattern_description_hi:
      "ऐसी धारा जो नियोक्ता के आचार संहिता / सोशल-मीडिया नीति को कर्मचारी के व्यक्तिगत, ड्यूटी-बाह, सार्वजनिक हित के मुद्दों पर भाषण तक बढ़ाती है।",
    pattern_description_hinglish:
      "Aasi clause jo employer ke code of conduct / social-media policy ko worker ke personal, off-duty, public-interest matters pe speech tak extend kare.",
    legal_basis:
      "Indian Contract Act, 1872 — Section 23 (opposed to public policy); Constitution of India — Article 19(1)(a); NALSA v. Union of India principles on free expression",
    severity: "low",
    plainEnglishTemplate:
      "This clause extends the employer's code of conduct to your off-duty, off-platform speech on matters of public interest — barring you from criticising the industry, government policy, or joining protests. Such restrictions have been read down by courts as against the worker's Article 19(1)(a) right to free expression, treated as a relevant public-policy consideration under Section 23 of the Indian Contract Act. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा नियोक्ता के आचार संहिता को आपके ड्यूटी-बाह, सार्वजनिक हित के मुद्दों पर भाषण तक बढ़ाती है — आपको उद्योग, सरकारी नीति की आलोचना या विरोध-प्रदर्शन में शामिल होने से रोकती है। न्यायालयों ने ऐसे प्रतिबंधों को कर्मचारी के अनुच्छेद 19(1)(a) अभिव्यक्ति के अधिकार के विरुद्ध पढ़ा है, जिसे भारतीय अनुबंध अधिनियम धारा 23 के तहत प्रासंगिक लोकनीति माना जाता है। मिलान की गई धारा: \"{clause}\"।",
  },
];

export default gigJobRules;

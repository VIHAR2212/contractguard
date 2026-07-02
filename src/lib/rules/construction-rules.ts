// ===========================================================================
// /lib/rules/construction-rules.ts
// ---------------------------------------------------------------------------
// Sector: Construction (India)
// Document scope: Builder-buyer flat / property purchase agreement
//                 (governed by RERA, 2016 + allied statutes)
//
// Every rule below is anchored to a real Indian statute, regulation or
// authoritative guideline. Severity reflects how badly a matched clause
// prejudices a homebuyer's statutory rights.
// ===========================================================================

import type { Rule } from "@/lib/types";

export const constructionRules: Rule[] = [
  // -------------------------------------------------------------------------
  // 1. RERA delay penalty cap
  // -------------------------------------------------------------------------
  {
    id: "RERA-DELAY-001",
    category: "RERA",
    pattern_description_en:
      "Clause that caps or waives the builder's liability for delay in handing over possession, or sets a penalty rate lower than the rate prescribed under RERA Section 18 (typically the same rate as the annual interest rate the builder charges the allottee).",
    pattern_description_hi:
      "ऐसी धारा जो कब्ज़ा दिलाने में देरी के लिए बिल्डर की देनदारी को सीमित या माफ करती है, या RERA धारा 18 के तहत निर्धारित दर से कम दंड दर तय करती है।",
    pattern_description_hinglish:
      "Aisi clause jo possession delay pe builder ki liability ko cap ya waive kar de, ya RERA Section 18 se kam penalty rate fix kare.",
    legal_basis: "RERA, 2016 — Section 18; RERA Section 18 read with Section 19",
    severity: "high",
    plainEnglishTemplate:
      "This clause tries to cap or waive the builder's penalty for delaying possession. Under RERA Section 18, if the builder fails to give possession as per the agreement, you are entitled to compensation at a rate no less than the interest rate the builder charges you. The matched clause reads: \"{clause}\". This cap is not enforceable to the extent it reduces your statutory entitlement.",
    plainHindiTemplate:
      "यह धारा कब्ज़ा दिलाने में देरी के लिए बिल्डर के दंड को सीमित करने का प्रयास है। RERA धारा 18 के तहत, यदि बिल्डर समय पर कब्ज़ा नहीं दिलाता, तो आपको कम से कम उतने ब्याज दर पर हरजाना पाने का अधिकार है जितना बिल्डर आपसे वसूलता है। मिलान की गई धारा: \"{clause}\"। यह सीमा आपके वैधानिक अधिकार को घटाने तक लागू नहीं होती।",
  },

  // -------------------------------------------------------------------------
  // 2. Carpet area misrepresentation
  // -------------------------------------------------------------------------
  {
    id: "RERA-CARPET-002",
    category: "RERA",
    pattern_description_en:
      "Clause that defines the saleable area as 'super built-up area', 'saleable area', 'built-up area', or any area other than 'carpet area' as defined under RERA Section 2(k), or that allows the builder to vary the carpet area beyond the +/- 3% tolerance permitted under RERA.",
    pattern_description_hi:
      "ऐसी धारा जो बिक्री योग्य क्षेत्र को RERA धारा 2(k) में परिभाषित 'कार्पेट क्षेत्र' के बजाय 'सुपर बिल्ट-अप' या 'बिल्ट-अप' के रूप में परिभाषित करती है, या कार्पेट क्षेत्र को +/- 3% से अधिक बदलने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo saleable area ko 'super built-up' ya 'built-up' define kare instead of RERA Section 2(k) wala 'carpet area', ya carpet area ko +/- 3% se zyada vary karne de.",
    legal_basis:
      "RERA, 2016 — Section 2(k) (carpet area definition), Section 14(1) (variation tolerance), Section 61",
    severity: "high",
    plainEnglishTemplate:
      "This clause prices the flat on a non-standard area basis (e.g. super built-up) or allows the builder to vary the carpet area beyond the statutory 3% tolerance. Under RERA Section 14(1) read with Section 2(k), the only lawful unit of sale is 'carpet area' — the net usable internal floor area — and any variation beyond +/- 3% entitles you to a refund or proportional adjustment. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा फ्लैट की कीमत गैर-मानक क्षेत्र (जैसे सुपर बिल्ट-अप) पर तय करती है या बिल्डर को कार्पेट क्षेत्र को वैधानिक 3% से अधिक बदलने की अनुमति देती है। RERA धारा 14(1) और 2(k) के तहत, बिक्री का एकमात्र वैध आधार 'कार्पेट क्षेत्र' है, और +/- 3% से अधिक भिन्नता पर आपको रिफंड या समायोजन का अधिकार है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 3. Encumbrance / title defect
  // -------------------------------------------------------------------------
  {
    id: "RERA-TITLE-003",
    category: "RERA",
    pattern_description_en:
      "Clause where the builder disclaims responsibility for clearing mortgages, liens, litigations, or other encumbrances on the land/title, or fails to warrant that the title is free and marketable as required under RERA Section 4(2)(ii)(A) and Section 14(2).",
    pattern_description_hi:
      "ऐसी धारा जिसमें बिल्डर भूमि/स्वामित्व पर बंधक, मुकदमे या अन्य बोझ को साफ करने की जिम्मेदारी से इनकार करता है, या स्वामित्व के मुक्त और बिक्री योग्य होने की गारंटी नहीं देता।",
    pattern_description_hinglish:
      "Aasi clause jisme builder land/title pe mortgage, litigation ya encumbrance clear karne ki responsibility se inkar kare, ya free-and-marketability ka warranty na de.",
    legal_basis:
      "RERA, 2016 — Section 4(2)(ii)(A) (title warranty), Section 14(2) (transfer of interest)",
    severity: "high",
    plainEnglishTemplate:
      "This clause tries to shift the risk of title defects (mortgages, court cases, liens) onto you, the buyer. RERA Section 4(2)(ii)(A) makes it a registration precondition that the builder has a legally valid title with a warranty, and Section 14(2) requires the builder to transfer any interest in the land to the allottee. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा स्वामित्व दोषों (बंधक, मुकदमे, लियन) का जोखिम आप खरीदार पर डालने का प्रयास है। RERA धारा 4(2)(ii)(A) पंजीकरण की शर्त है कि बिल्डर के पास वैध और वारंटी युक्त स्वामित्व हो, और धारा 14(2) बिल्डर को भूमि में अपना हित अधिकारी को हस्तांतरित करने का निर्देश देती है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 4. Unilateral cancellation by builder
  // -------------------------------------------------------------------------
  {
    id: "RERA-CANCEL-004",
    category: "RERA",
    pattern_description_en:
      "Clause that allows the builder to unilaterally cancel the allotment agreement for default by the allottee without giving reasonable notice, without following the procedure under RERA Section 18(2) / Model Agreement Clause 9, or that forfeits more than a reasonable amount of the booking.",
    pattern_description_hi:
      "ऐसी धारा जो उचित नोटिस दिए बिना या RERA मॉडल अनुबंध की प्रक्रिया के बिना अधिकारी के दोष पर बिल्डर को एकतरफा आवंतन रद्द करने की अनुमति देती है, या बुकिंग राशि का अनुचित हिस्सा जब्त करती है।",
    pattern_description_hinglish:
      "Aasi clause jo builder ko allottee ke default pe reasonable notice ya RERA model agreement procedure follow kiye bina ek-tarfa allotment cancel karne de, ya booking ka unreasonable part forfeit kare.",
    legal_basis:
      "RERA, 2016 — Section 18(2); RERA Model Builder-Buyer Agreement Clauses 9 & 11",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the builder cancel the agreement unilaterally and/or forfeit a large slice of your booking amount. RERA's Model Builder-Buyer Agreement permits forfeiture of only a reasonable amount (often capped at 10% of the booking), requires written notice and a cure period, and reserves cancellation to the Authority's dispute-resolution mechanism. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा बिल्डर को एकतरफा अनुबंध रद्द करने और/या आपकी बुकिंग राशि का बड़ा हिस्सा जब्त करने की अनुमति देती है। RERA मॉडल बिल्डर-खरीदार अनुबंध के तहत केवल एक उचित राशि (अक्सर बुकिंग का 10%) ही जब्त की जा सकती है, लिखित नोटिस और सुधार अवधि आवश्यक है, और रद्दीकरण प्राधिकरण के विवाद-समाधान तंत्र के पास है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 5. Two-tariff / escalation clause
  // -------------------------------------------------------------------------
  {
    id: "RERA-ESC-005",
    category: "RERA",
    pattern_description_en:
      "Clause that allows the builder to unilaterally escalate the sale price after the agreement due to 'input cost increase', 'statutory changes', 'tariff revision', or similar open-ended reasons beyond what is permitted under RERA Section 13(1) read with the Model Agreement.",
    pattern_description_hi:
      "ऐसी धारा जो 'इनपुट लागत वृद्धि', 'स्टैट्यूटरी बदलाव', 'टैरिफ संशोधन' आदि खुले कारणों से समझौते के बाद बिल्डर को एकतरफा बिक्री मूल्य बढ़ाने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo 'input cost increase', 'statutory changes', 'tariff revision' jaise open-ended reasons se builder ko ek-tarfa sale price badhane de.",
    legal_basis: "RERA, 2016 — Section 13(1); RERA Model Agreement Clause 4",
    severity: "medium",
    plainEnglishTemplate:
      "This clause lets the builder hike the price after the agreement is signed using open-ended triggers like 'input cost increase'. Under RERA Section 13(1) and the Model Agreement, once the agreement is registered the price is fixed except for explicitly agreed, specific additions (e.g. statutory taxes passed through at actuals). Open-ended price escalation is not enforceable. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा बिल्डर को 'इनपुट लागत वृद्धि' जैसे खुले कारणों से समझौते के बाद कीमत बढ़ाने की अनुमति देती है। RERA धारा 13(1) और मॉडल अनुबंध के तहत, एक बार पंजीकरण होने के बाद कीमत तय रहती है सिवाय विशेष रूप से सहमत वास्तविक करों के। खुली कीमत वृद्धि लागू नहीं होती। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 6. No interest on buyer's refund
  // -------------------------------------------------------------------------
  {
    id: "RERA-REFUND-006",
    category: "RERA",
    pattern_description_en:
      "Clause stating that if the allottee cancels, the builder will refund the principal paid without interest, or will deduct an 'administration fee' that is not specified as a percentage, or will hold the refund until the unit is re-sold.",
    pattern_description_hi:
      "ऐसी धारा जिसमें कहा गया हो कि अधिकारी द्वारा रद्द करने पर बिल्डर मूलधन बिना ब्याज के लौटाएगा, या अनिर्दिष्ट 'प्रशासनिक शुल्क' काटेगा, या रिफंड को यूनिट दोबारा बिकने तक रोकेगा।",
    pattern_description_hinglish:
      "Aasi clause jisme likha ho ki allottee cancel kare to builder principal bina interest ke return kare, ya unspecified 'admin fee' kaate, ya refund ko re-sale tak rok de.",
    legal_basis: "RERA, 2016 — Section 18(3); Pioneer Urban Land judgment (2019) 8 SCC 473",
    severity: "medium",
    plainEnglishTemplate:
      "This clause strips you of interest on your own money if you cancel. The Supreme Court in Pioneer Urban Land (2019) held that a buyer who cancels due to the builder's delay or breach is entitled to refund with interest at the rate prescribed under RERA, and the builder cannot hold the refund hostage to a re-sale. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा रद्द करने पर आपके पैसे पर ब्याज से वंचित करती है। सुप्रीम कोर्ट ने Pioneer Urban Land (2019) में कहा कि बिल्डर की देरी या उल्लंघन के कारण रद्द करने वाले खरीदार को RERA के तहत निर्धारित दर पर ब्याज सहित रिफंड मिलेगा, और बिल्डर रिफंड को पुनर्विक्रय तक बंधक नहीं रख सकता। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 7. Hidden common-area maintenance transfer
  // -------------------------------------------------------------------------
  {
    id: "RERA-MAINT-007",
    category: "RERA",
    pattern_description_en:
      "Clause that transfers maintenance of common areas to the builder or a builder-affiliated entity indefinitely, or that creates a long-term (more than 5 years) maintenance contract without consent of the residents' association, contrary to RERA Section 18(2) and the Model Agreement provision on handover to the association.",
    pattern_description_hi:
      "ऐसी धारा जो सामान्य क्षेत्रों का रखरखाव अनिश्चित काल के लिए बिल्डर या उसके सहयोगी को सौंपती है, या निवासियों के संघ की सहमति के बिना 5 वर्ष से अधिक रखरखाव अनुबंध बनाती है।",
    pattern_description_hinglish:
      "Aasi clause jo common areas ka maintenance indefinitely builder ya uske affiliate ko de de, ya residents association ki consent ke bina 5 saal se zyada ka maintenance contract banaye.",
    legal_basis:
      "RERA, 2016 — Section 18(2); Model Builder-Buyer Agreement Clause 16 (handover to association)",
    severity: "medium",
    plainEnglishTemplate:
      "This clause hands common-area maintenance to the builder or an affiliated entity indefinitely or for an excessive term, blocking the residents' association from taking over. RERA Section 18(2) and the Model Agreement require the promoter to hand over common areas, after a majority of allottees have taken possession, to the association / registered society. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा सामान्य क्षेत्रों का रखरखाव अनिश्चित काल या अत्यधिक अवधि के लिए बिल्डर या सहयोगी को दे देती है, जिससे निवासियों के संघ को नियंत्रण नहीं मिलता। RERA धारा 18(2) और मॉडल अनुबंध के तहत बिल्डर को बहुसंख्यक अधिकारियों के कब्ज़े के बाद सामान्य क्षेत्र संघ को सौंपने हैं। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 8. Force majeure abuse
  // -------------------------------------------------------------------------
  {
    id: "RERA-FM-008",
    category: "RERA",
    pattern_description_en:
      "Clause that lists as 'force majeure' events that are clearly within the builder's control or foreseeability — e.g. 'delay in approvals', 'labour shortage', 'shortage of material', 'change in government policy' — and uses them to extend the possession date without limit or without paying compensation.",
    pattern_description_hi:
      "ऐसी धारा जो 'बल प्रमुख' में बिल्डर के नियंत्रण में रहने वाली घटनाओं (जैसे अनुमोदन में देरी, श्रम की कमी, सामग्री की कमी, सरकारी नीति बदलाव) को शामिल करती है और उन्हें बिना सीमा या हरजाने के कब्ज़ा तारीख बढ़ाने के लिए इस्तेमाल करती है।",
    pattern_description_hinglish:
      "Aasi clause jo 'force majeure' me builder ke control wali events (approval delay, labour shortage, material shortage, policy change) ko shamil kare aur unhe bina limit ya compensation ke possession date badhane ke liye use kare.",
    legal_basis:
      "RERA, 2016 — Section 6 (extension for force majeure, narrow scope); Indian Contract Act, 1872 — Section 32",
    severity: "medium",
    plainEnglishTemplate:
      "This clause over-broadly defines 'force majeure' to include events under the builder's control (delay in approvals, labour or material shortage) and uses them to push the possession date indefinitely. RERA Section 6 permits extension only for events truly beyond the promoter's control, and only by the Authority for the period actually required. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा 'बल प्रमुख' को बहुत व्यापक परिभाषित करती है और बिल्डर के नियंत्रण वाली घटनाओं को शामिल करती है। RERA धारा 6 विस्तार केवल वास्तव में बिल्डर के नियंत्रण से बाहर की घटनाओं के लिए और केवल प्राधिकरण द्वारा वास्तव में आवश्यक अवधि के लिए देती है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 9. Dispute resolution — exclusive non-RERA forum
  // -------------------------------------------------------------------------
  {
    id: "RERA-JURIS-009",
    category: "RERA",
    pattern_description_en:
      "Clause that designates an exclusive forum other than the RERA Authority / Adjudicating Officer (e.g. arbitration seated outside India, exclusive civil court in a distant city) for disputes 'arising out of the allotment', in an attempt to oust RERA jurisdiction which the Supreme Court has held is not permissible.",
    pattern_description_hi:
      "ऐसी धारा जो RERA प्राधिकरण के बजाय किसी अन्य विशेष मंच (विदेशी मध्यस्थता, दूर की न्यायालय) को विवादों के लिए नामित करती है, जो सुप्रीम कोर्ट के अनुसार अनुमत नहीं है।",
    pattern_description_hinglish:
      "Aasi clause jo RERA Authority ke bajaye kisi doosre exclusive forum (foreign arbitration, distant court) ko disputes ke liye name kare, jo Supreme Court ke according permissible nahi hai.",
    legal_basis:
      "RERA, 2016 — Section 18(2), Section 79; Imperium Structures v. Anil Pranjape (2020) 5 SCC 626; Pioneer Urban Land (2019) 8 SCC 473",
    severity: "high",
    plainEnglishTemplate:
      "This clause tries to send your disputes to a non-RERA forum (often arbitration or a distant civil court) to oust the RERA Authority. The Supreme Court has repeatedly held that the RERA Authority's jurisdiction under Section 18 read with Section 79 is not ousted by an arbitration clause — the buyer can still approach RERA. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आपके विवादों को गैर-RERA मंच (अक्सर मध्यस्थता या दूर की न्यायालय) में भेजने का प्रयास है। सुप्रीम कोर्ट ने बार-बार कहा है कि धारा 18 और धारा 79 के तहत RERA प्राधिकरण की क्षेत्राधिकार मध्यस्थता धारा द्वारा समाप्त नहीं होती — खरीदार अभी भी RERA के पास जा सकता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 10. Modification of plans without consent
  // -------------------------------------------------------------------------
  {
    id: "RERA-PLAN-010",
    category: "RERA",
    pattern_description_en:
      "Clause allowing the builder to make 'minor' or 'major' alterations to the sanctioned plans, structural designs, or amenities without the written consent of two-thirds of the allottees, contrary to RERA Section 14(1).",
    pattern_description_hi:
      "ऐसी धारा जो बिल्डर को दो-तिहाई अधिकारियों की लिखित सहमति के बिना स्वीकृत योजनाओं, संरचनात्मक डिज़ाइन या सुविधाओं में 'मामूली' या 'प्रमुख' बदलाव करने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo builder ko two-thirds allottees ki written consent ke bina sanctioned plans, structural designs, ya amenities me 'minor' ya 'major' changes karne de.",
    legal_basis: "RERA, 2016 — Section 14(1) (two-thirds consent for alterations)",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the builder alter sanctioned plans, structural designs, or amenities without the two-thirds written consent of allottees that RERA Section 14(1) mandates. Without that consent, you are entitled to a refund with interest and compensation. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा बिल्डर को दो-तिहाई अधिकारियों की लिखित सहमति के बिना स्वीकृत योजनाओं, संरचनात्मक डिज़ाइन या सुविधाओं में बदलाव करने देती है, जो RERA धारा 14(1) अनिवार्य करती है। उस सहमति के बिना आपको ब्याज और हरजाने के साथ रिफंड का अधिकार है। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 11. Ear-marked parking sale
  // -------------------------------------------------------------------------
  {
    id: "RERA-PARK-011",
    category: "RERA",
    pattern_description_en:
      "Clause that separately prices and sells 'open', 'stilt', or 'covered' parking slots to allottees. RERA Section 2(k) read with the Supreme Court ruling in Nabha Foundation (2018) holds that parking areas (open/stilt) are not part of the 'carpet area' and cannot be sold as independent units.",
    pattern_description_hi:
      "ऐसी धारा जो 'ओपन', 'स्टिल्ट' या 'कवर्ड' पार्किंग स्लॉट को अलग से मूल्य और बिक्री करती है। RERA धारा 2(k) और Nabha Foundation (2018) के अनुसार पार्किंग क्षेत्र स्वतंत्र इकाई के रूप में नहीं बेचे जा सकते।",
    pattern_description_hinglish:
      "Aasi clause jo 'open', 'stilt' ya 'covered' parking slots ko alag se price aur sale kare. RERA Section 2(k) aur Nabha Foundation (2018) ke according parking areas independent unit ke taur pe sold nahi ho sakte.",
    legal_basis:
      "RERA, 2016 — Section 2(k); Nabha Foundation Ltd. v. Punjab State Authority (2018); Pinnalace Promoters orders",
    severity: "medium",
    plainEnglishTemplate:
      "This clause treats parking as a separately saleable commodity. RERA Section 2(k) excludes open and stilt parking from 'carpet area', and the Supreme Court in Nabha Foundation (2018) confirmed that open/stilt parking cannot be sold as an independent unit — it goes with the common areas. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा पार्किंग को अलग से बिक्री योग्य वस्तु मानती है। RERA धारा 2(k) ओपन और स्टिल्ट पार्किंग को 'कार्पेट क्षेत्र' से बाहर रखती है, और Nabha Foundation (2018) में सुप्रीम कोर्ट ने पुष्टि की कि ओपन/स्टिल्ट पार्किंग स्वतंत्र इकाई नहीं बिक सकती। मिलान की गई धारा: \"{clause}\"।",
  },

  // -------------------------------------------------------------------------
  // 12. No transfer of right before possession
  // -------------------------------------------------------------------------
  {
    id: "RERA-TRANSFER-012",
    category: "RERA",
    pattern_description_en:
      "Clause that absolutely prohibits the allottee from transferring their rights under the agreement to a third party before possession, or charges a transfer fee higher than the reasonable amount contemplated by RERA / state rules (typically Rs. 100 to a few thousand rupees, or as prescribed), and is not limited to cases where part payment is outstanding.",
    pattern_description_hi:
      "ऐसी धारा जो अधिकारी को कब्ज़ा दिलाने से पहले अपने अधिकारों को तीसरे पक्ष को हस्तांतरित करने से पूरी तरह रोकती है, या अनुचित उच्च ट्रांसफर शुल्क लेती है।",
    pattern_description_hinglish:
      "Aasi clause jo allottee ko possession se pehle apne rights third party ko transfer karne se absolutely rok de, ya unreasonable high transfer fee charge kare.",
    legal_basis:
      "RERA, 2016 — Section 13(1); State RERA Rules (e.g. Haryana, Maharashtra) capping transfer charges",
    severity: "low",
    plainEnglishTemplate:
      "This clause either absolutely bars you from transferring your booking before possession, or imposes a transfer fee disproportionate to what state RERA rules permit. RERA Section 13(1) and most state rules allow transfer subject only to a small prescribed fee and the builder's right to recover outstanding dues. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा या तो पूरी तरह आपको कब्ज़ा दिलाने से पहले बुकिंग हस्तांतरित करने से रोकती है, या राज्य RERA नियमों द्वारा अनुमत से अधिक ट्रांसफर शुल्क लगाती है। RERA धारा 13(1) और अधिकांश राज्य नियम हस्तांतरण को केवल एक छोटे निर्धारित शुल्क और बकाया राशि की वसूली तक सीमित करते हैं। मिलान की गई धारा: \"{clause}\"।",
  },
];

export default constructionRules;

// ===========================================================================
// /lib/rules/finance-rules.ts
// ---------------------------------------------------------------------------
// Sector: Finance / Banking (incl. Gold & Jewellery lending)
// Document scope:
//   • Personal Loan Agreements
//   • Credit Card Terms & Conditions
//   • Gold / Jewellery Loan & Buyback Agreements
//
// Every rule below is anchored to a real Indian statute, RBI circular,
// BIS standard or authoritative guideline. Severities reflect how
// prejudicial a matched clause is to the borrower / cardholder.
// ===========================================================================

import type { Rule } from "@/lib/types";

export const financeRules: Rule[] = [
  // =========================================================================
  // PERSONAL LOAN
  // =========================================================================

  // 1. Undisclosed / bundling processing fee
  {
    id: "RBI-PERSONAL-FEE-001",
    category: "RBI",
    pattern_description_en:
      "Clause that allows the lender to deduct a 'processing fee', 'documentation charge', 'insurance premium', 'CIC charge', or similar upfront charge that was not disclosed in the Key Fact Statement (KFS) under RBI's Circular on Transparency in Lending (Aug 2024), or that exceeds the disclosed amount.",
    pattern_description_hi:
      "ऐसी धारा जो ऋणदाता को 'प्रोसेसिंग शुल्क', 'दस्तावेज़ीकरण शुल्क', 'बीमा प्रीमियम' आदि अग्रिम शुल्क काटने की अनुमति देती है जो RBI की KFS पारदर्शिता परिपत्र (अगस्त 2024) के तहत प्रमुख तथ्य विवरण में प्रकट नहीं किया गया था।",
    pattern_description_hinglish:
      "Aasi clause jo lender ko 'processing fee', 'documentation charge', 'insurance premium' jaisa upfront charge kaatne de jo RBI ke KFS Transparency Circular (Aug 2024) ke under Key Fact Statement me disclose nahi kiya gaya tha.",
    legal_basis:
      "RBI Circular on Transparency in Charging of Interest and Levying of Incidental Charges — Aug 2024 (KFS mandate, Section 2.3); RBI Master Direction on Fair Practices Code",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the lender deduct charges that were not declared in your Key Fact Statement (KFS). Under RBI's August 2024 transparency circular, every regulated lender must give you a KFS listing all charges, and the annual percentage rate (APR), before sanction. Any charge not in the KFS cannot be collected. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा ऋणदाता को उन शुल्कों को काटने की अनुमति देती है जो आपके प्रमुख तथ्य विवरण (KFS) में घोषित नहीं किए गए। RBI के अगस्त 2024 पारदर्शिता परिपत्र के तहत, प्रत्येक विनियमित ऋणदाता को स्वीकृति से पहले सभी शुल्क और वार्षिक प्रतिशत दर (APR) सूचीबद्ध KFS देना चाहिए। KFS में नहीं है वह वसूला नहीं जा सकता। मिलान की गई धारा: \"{clause}\"।",
  },

  // 2. Floating rate reset — no cap, no notice
  {
    id: "RBI-FLOAT-RESET-002",
    category: "RBI",
    pattern_description_en:
      "Clause that allows the lender to reset a floating interest rate at any frequency and by any margin without (a) disclosing the reset frequency and the external benchmark to which the rate is linked, (b) giving at least 7 days' notice of each reset, and (c) offering the borrower the option to switch to a fixed rate or prepay without penalty during tenor extension, contrary to RBI's Circular on Floating Interest Rates on Personal Loans (Dec 2024).",
    pattern_description_hi:
      "ऐसी धारा जो ऋणदाता को बिना सूचना, बिना बाहरी बेंचमार्क प्रकट किए, और बिना निश्चित दर पर स्विच करने का विकल्प दिए फ्लोटिंग ब्याज दर रीसेट करने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo lender ko bina notice, bina external benchmark disclose kiye, aur bina fixed-rate switch option diye floating interest rate reset karne de.",
    legal_basis:
      "RBI Circular on Floating Interest Rate on Personal Loans (Retail Loans other than Housing) — December 2024",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the lender reset your floating rate without the safeguards mandated by RBI's December 2024 circular: it must disclose the reset frequency and the external benchmark, give you at least 7 days' notice before each reset, and let you switch to a fixed rate or prepay without penalty if the reset would extend the tenor. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा ऋणदाता को बिना RBI के दिसंबर 2024 परिपत्र की सुरक्षा के फ्लोटिंग दर रीसेट करने देती है: रीसेट आवृत्ति और बाहरी बेंचमार्क प्रकट करना, हर रीसेट से पहले कम से कम 7 दिन की सूचना देना, और रीसेट से अवधि बढ़ने पर निश्चित दर पर स्विच या बिना जुर्माना पूर्व-भुगतान का विकल्प देना आवश्यक है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 3. Prepayment penalty on floating loans
  {
    id: "RBI-PREPAY-003",
    category: "RBI",
    pattern_description_en:
      "Clause that imposes a prepayment or foreclosure penalty on a floating-rate personal loan, or on any loan to an individual borrower (non-business), contrary to RBI's prohibition on foreclosure charges on floating-rate loans and the broader 2024 direction prohibiting such charges on personal loans of individual borrowers.",
    pattern_description_hi:
      "ऐसी धारा जो फ्लोटिंग-दर व्यक्तिगत ऋण या किसी व्यक्ति उधारकर्ता के व्यक्तिगत ऋण पर पूर्व-भुगतान या फोरक्लोज़र जुर्माना लगाती है, जो RBI द्वारा प्रतिषेधित है।",
    pattern_description_hinglish:
      "Aasi clause jo floating-rate personal loan ya kisi individual borrower ke personal loan pe prepayment ya foreclosure penalty lagaye, jo RBI dwara prohibited hai.",
    legal_basis:
      "RBI Circular — Foreclosure Charges on Floating Rate Loans; RBI Direction on Personal Loans of Individual Borrowers (2024)",
    severity: "high",
    plainEnglishTemplate:
      "This clause charges you a penalty for prepaying or foreclosing your loan. RBI has prohibited foreclosure / prepayment penalties on floating-rate loans to individual borrowers, and (effective 2024) on personal loans of individual borrowers generally. You should be able to exit the loan at any time without paying a penalty. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा आपके ऋण का पूर्व-भुगतान या फोरक्लोज़र करने पर जुर्माना लगाती है। RBI ने व्यक्तिगत उधारकर्ताओं को फ्लोटिंग-दर ऋण पर और (2024 से प्रभावी) व्यक्तिगत ऋण पर फोरक्लोज़र / पूर्व-भुगतान जुर्माना प्रतिषेधित कर दिया है। आपको किसी भी समय बिना जुर्माना ऋण बंद करने में सक्षम होना चाहिए। मिलान की गई धारा: \"{clause}\"।",
  },

  // 4. Compound interest on defaulted EMIs / interest capitalization
  {
    id: "RBI-COMPOUND-004",
    category: "RBI",
    pattern_description_en:
      "Clause that permits the lender to capitalise unpaid interest (i.e. charge interest on interest) on defaulted EMIs for personal loans, or that levies penal interest on already-defaulted penal charges, contrary to RBI's Circular on Penal Charges in Loan Accounts (Aug 2024) which prohibits penal interest / compounding of penal charges.",
    pattern_description_hi:
      "ऐसी धारा जो ऋणदाता को चूक ईएमआई पर ब्याज पर ब्याज (compound interest) लेने या पहले से लगाए गए जुर्माना पर पुनः जुर्माना लेने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo lender ko defaulted EMI pe interest-on-interest (compound interest) lene ya pehle se lage penal charge pe phir se penal charge lene de.",
    legal_basis:
      "RBI Circular on Penal Charges in Loan Accounts — August 2024 (no penal interest, no compounding of penal charges)",
    severity: "high",
    plainEnglishTemplate:
      "This clause lets the lender charge interest on interest, or compound penal charges. RBI's August 2024 circular explicitly prohibits 'penal interest' on defaulted amounts and bars compounding of penal charges — only reasonable penal charges (not compounded) are permitted. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा ऋणदाता को ब्याज पर ब्याज या जुर्माना पर जुर्माना लेने देती है। RBI का अगस्त 2024 परिपत्र 'जुर्माना ब्याज' को स्पष्ट रूप से प्रतिषेधित करता है और जुर्माना शुल्क के चक्रवृद्धि को रोकता है — केवल उचित जुर्माना शुल्क (चक्रवृद्धि रहित) की अनुमति है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 5. Unilateral modification of T&Cs
  {
    id: "RBI-MODIFY-005",
    category: "RBI",
    pattern_description_en:
      "Clause allowing the lender to unilaterally modify any term of the loan agreement — interest rate, charges, tenor — with 'deemed consent' or mere website posting, without giving the borrower at least 30 days' individual notice and an exit option without penalty, contrary to RBI Master Direction on Fair Practices Code.",
    pattern_description_hi:
      "ऐसी धारा जो ऋणदाता को 'मान्य सहमति' या केवल वेबसाइट पर डालकर ऋण समझौते के किसी भी शब्द को एकतरफा बदलने की अनुमति देती है।",
    pattern_description_hinglish:
      "Aasi clause jo lender ko 'deemed consent' ya website pe daal kar loan agreement ke kisi bhi term ko ek-tarfa modify karne de.",
    legal_basis:
      "RBI Master Direction on Fair Practices Code ( clauses on notice of changes); RBI Circular on Transparency (Aug 2024)",
    severity: "medium",
    plainEnglishTemplate:
      "This clause lets the lender rewrite your loan terms unilaterally using 'deemed consent' or a website posting. The RBI Fair Practices Code requires at least 30 days' individual written notice of any unfavourable change and an unconditional exit option without penalty. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह धारा ऋणदाता को 'मान्य सहमति' या वेबसाइट पोस्टिंग के माध्यम से आपकी ऋण शर्तों को एकतरफा बदलने देती है। RBI फेयर प्रैक्टिसेज कोड किसी भी प्रतिकूल बदलाव की कम से कम 30 दिन की व्यक्तिगत लिखित सूचना और बिना जुर्माना बाहर निकलने का विकल्प मांगता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // =========================================================================
  // CREDIT CARD
  // =========================================================================

  // 6. Interest calculation transparency
  {
    id: "RBI-CC-INTEREST-006",
    category: "RBI",
    pattern_description_en:
      "Credit Card T&Cs that fail to disclose (a) the Annualised Percentage Rate (APR), (b) the daily interest rate, (c) the grace / interest-free period, (d) the method of calculating interest (e.g. 'average daily balance' including new transactions), and (e) that interest is charged from the transaction date if the previous balance is not paid in full, contrary to RBI Master Direction on Credit Card and Debit Card — Issuance and Conduct Directions, 2022.",
    pattern_description_hi:
      "क्रेडिट कार्ड शर्तें जो वार्षिक ब्याज दर (APR), दैनिक ब्याज दर, ग्रेस अवधि, ब्याज गणना विधि और पूर्व शेष पूर्ण भुगतान न होने पर लेन-देन तिथि से ब्याज लगाने को प्रकट नहीं करतीं।",
    pattern_description_hinglish:
      "Credit Card T&Cs jo APR, daily interest rate, grace period, interest calculation method aur transaction date se interest lagane ko disclose na karein.",
    legal_basis:
      "RBI Master Direction — Credit Card and Debit Card — Issuance and Conduct Directions, 2022 (clauses on transparency, interest-free period, APR disclosure)",
    severity: "high",
    plainEnglishTemplate:
      "These T&Cs do not properly disclose the APR, daily interest rate, grace period, or how interest is computed. RBI's 2022 Master Direction requires card issuers to disclose the APR, the method of interest calculation, the interest-free credit period, and to spell out that interest is levied from the transaction date (not just the billing date) when the previous balance is unpaid. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें APR, दैनिक ब्याज दर, ग्रेस अवधि या ब्याज गणना विधि को ठीक से प्रकट नहीं करतीं। RBI का 2022 मास्टर निर्देश कार्ड जारीकर्ताओं को APR, ब्याज गणना विधि, ब्याज-मुक्त अवधि और यह स्पष्ट करने का आदेश देता है कि पिछला शेष अवैतनिक होने पर ब्याज लेन-देन तिथि से लगाया जाता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 7. Late fee + interest stacking
  {
    id: "RBI-CC-LATEFEE-007",
    category: "RBI",
    pattern_description_en:
      "Credit Card T&Cs that simultaneously levy (a) a late-payment fee, (b) interest on the unpaid amount, and (c) a finance charge on the late fee itself, or that charge interest on the full billed amount even when a part-payment has been made (i.e. no pro-rata adjustment), contrary to RBI Master Direction on Credit Cards (2022) and the RBI Fair Practices Code.",
    pattern_description_hi:
      "क्रेडिट कार्ड शर्तें जो एक साथ लेट-पेमेंट शुल्क, अवैतनिक राशि पर ब्याज और लेट शुल्क पर वित्त शुल्क लेती हैं, या आंशिक भुगतान के बावजूद पूरे बिल पर ब्याज लेती हैं।",
    pattern_description_hinglish:
      "Credit Card T&Cs jo ek saath late-payment fee, unpaid amount pe interest aur late fee pe finance charge le, ya part-payment ke bavajood poore bill pe interest lein.",
    legal_basis:
      "RBI Master Direction — Credit Card and Debit Card — Issuance and Conduct Directions, 2022 (clause 10); RBI Fair Practices Code",
    severity: "medium",
    plainEnglishTemplate:
      "These T&Cs stack a late fee, interest on the unpaid balance, and a finance charge on the late fee itself, or charge interest on the full billed amount even after a part-payment. RBI's 2022 Master Direction requires the interest-free period to be restored on the paid portion and bars stacking of penal charges. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें एक साथ लेट शुल्क, अवैतनिक शेष पर ब्याज और लेट शुल्क पर वित्त शुल्क लेती हैं, या आंशिक भुगतान के बावजूद पूरे बिल पर ब्याज लेती हैं। RBI का 2022 मास्टर निर्देश भुगतान किए गए हिस्से पर ब्याज-मुक्त अवधि बहाल करने और जुर्माना शुल्क के थोपने को रोकता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 8. Billing without statement / no notice
  {
    id: "RBI-CC-BILL-008",
    category: "RBI",
    pattern_description_en:
      "Credit Card T&Cs that allow the issuer to levy late fees even if the statement was not delivered (paper or e-statement) at least 15 days before the payment due date, contrary to RBI Master Direction on Credit Cards (2022) which mandates a minimum 15-day gap between statement and due date, and bars reporting to credit bureaus before that gap is honoured.",
    pattern_description_hi:
      "क्रेडिट कार्ड शर्तें जो बयान भेजे बिना या भुगतान नियत तिथि से कम से कम 15 दिन पहले न भेजकर भी लेट शुल्क लेने की अनुमति देती हैं।",
    pattern_description_hinglish:
      "Credit Card T&Cs jo statement bina bheje ya payment due date se kam se kam 15 din pehle bheje bina bhi late fee lene ki anumati dein.",
    legal_basis:
      "RBI Master Direction — Credit Card and Debit Card — Issuance and Conduct Directions, 2022 (clause 9 — minimum 15 days between statement and due date)",
    severity: "medium",
    plainEnglishTemplate:
      "These T&Cs allow the issuer to levy late fees even when the statement was not delivered with the statutory minimum 15-day gap before the due date. RBI's 2022 Master Direction mandates at least 15 days between statement generation and the payment due date, and bars reporting to credit bureaus during that window. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें जारीकर्ता को लेट शुल्क लेने की अनुमति देती हैं जब तक बयान नियत तिथि से कम से कम 15 दिन पहले न भेजा गया हो। RBI का 2022 मास्टर निर्देश बयान निर्माण और भुगतान नियत तिथि के बीच कम से कम 15 दिन अनिवार्य करता है और उस अवधि में क्रेडिट ब्यूरो को रिपोर्टिंग पर रोक लगाता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 9. Card activation without consent / unsolicited upgrades
  {
    id: "RBI-CC-UNSOLICITED-009",
    category: "RBI",
    pattern_description_en:
      "Credit Card T&Cs that allow the issuer to (a) activate a card on 'implicit consent' if the customer does not respond within X days, (b) upgrade or downgrade the card without explicit OTP-based consent, or (c) levy fees for an unsolicited upgraded card, contrary to RBI Master Direction on Credit Cards (2022) which requires explicit consent and a 7-day activation window with auto-closure.",
    pattern_description_hi:
      "क्रेडिट कार्ड शर्तें जो जारीकर्ता को 'अंतर्निहित सहमति' पर कार्ड सक्रिय करने, बिना OTP सहमति के कार्ड अपग्रेड करने, या अनधिकृत अपग्रेडेड कार्ड के लिए शुल्क लेने की अनुमति देती हैं।",
    pattern_description_hinglish:
      "Credit Card T&Cs jo issuer ko 'implicit consent' pe card activate karne, bina OTP consent ke card upgrade karne, ya unsolicited upgraded card pe fee lene ki anumati dein.",
    legal_basis:
      "RBI Master Direction — Credit Card and Debit Card — Issuance and Conduct Directions, 2022 (clauses 5 & 6 on activation and unsolicited cards)",
    severity: "high",
    plainEnglishTemplate:
      "These T&Cs allow the issuer to activate or upgrade your card on 'implicit consent' or to charge you for an unsolicited upgrade. RBI's 2022 Master Direction requires explicit OTP-based consent for activation, a 7-day activation window with auto-closure if you don't respond, and double refund of any charge on an unsolicited card. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें जारीकर्ता को 'अंतर्निहित सहमति' पर कार्ड सक्रिय या अपग्रेड करने या अनधिकृत अपग्रेड पर शुल्क लेने की अनुमति देती हैं। RBI का 2022 मास्टर निर्देश सक्रियण के लिए स्पष्ट OTP-आधारित सहमति, 7-दिन सक्रियण विंडो ऑटो-क्लोज़र के साथ, और अनधिकृत कार्ड पर किसी भी शुल्क का दोगुना रिफंड अनिवार्य करता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // =========================================================================
  // GOLD / JEWELLERY LOAN & BUYBACK
  // =========================================================================

  // 10. Buyback rate manipulation
  {
    id: "GOLD-BUYBACK-010",
    category: "BIS / Gold",
    pattern_description_en:
      "Gold/Jewellery buyback T&Cs that allow the jeweller to (a) apply arbitrary 'making charge' or 'wastage' deductions of more than the agreed percentage at buyback, (b) value the buyback at the gold rate of the day of sale rather than the day of buyback, or (c) refuse buyback of items not originally bought from that jeweller without disclosing this restriction at sale, contrary to the BIS Hallmarking Regulations and consumer protection norms.",
    pattern_description_hi:
      "सोना/गहने बायबैक शर्तें जो ज्वेलर को मनमाना 'मेकिंग चार्ज' या 'क्षय' काटने, बायबैक दर बिक्री के दिन की न बल्कि बायबैक के दिन की लेने, या बिक्री के समय प्रकट किए बिना बायबैक से इनकार करने की अनुमति देती हैं।",
    pattern_description_hinglish:
      "Gold/Jewellery buyback T&Cs jo jeweller ko arbitrary 'making charge' ya 'wastage' kaatne, buyback rate sale-day ka na le kar buyback-day ka lene, ya sale time disclose kiye bina buyback se inkar karne ki anumati dein.",
    legal_basis:
      "BIS Hallmarking Regulations, 2018; Consumer Protection Act, 2019 — Section 2(47) (unfair trade practice); BIS Act 2016",
    severity: "high",
    plainEnglishTemplate:
      "These T&Cs let the jeweller cut arbitrary 'making charges' or 'wastage' at buyback, value the buyback at the older sale-day rate instead of the day of return, or refuse to buy back without telling you at sale time. The BIS Hallmarking Regulations require transparent valuation, and the Consumer Protection Act, 2019 treats undisclosed buyback restrictions as an unfair trade practice. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें ज्वेलर को बायबैक पर मनमाना 'मेकिंग चार्ज' या 'क्षय' काटने, बायबैक दर बिक्री के दिन की लेने, या बिक्री के समय बताए बिना बायबैक से इनकार करने देती हैं। BIS हॉलमार्किंग विनियम पारदर्शी मूल्यांकन चाहते हैं, और उपभोक्ता संरक्षण अधिनियम 2019 अप्रकट बायबैक प्रतिबंधों को अनुचित व्यापार अभ्यास मानता है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 11. Hallmarking gap
  {
    id: "GOLD-HALLMARK-011",
    category: "BIS",
    pattern_description_en:
      "Gold/Jewellery sale T&Cs that allow sale of gold articles of 14K, 18K, 20K, 22K, 23K or 24K without a BIS hallmark (HUID), or that disclaim responsibility for hallmarking by calling the item 'made-to-order' or 'custom', contrary to BIS Hallmarking Regulations, 2018 which made hallmarking mandatory (with limited notified exemptions) for the notified purity grades.",
    pattern_description_hi:
      "सोना/गहने बिक्री शर्तें जो 14K-24K सोने की वस्तुओं को BIS हॉलमार्क (HUID) के बिना बेचने की अनुमति देती हैं, या वस्तु को 'कस्टम' कहकर हॉलमार्किंग की जिम्मेदारी से इनकार करती हैं।",
    pattern_description_hinglish:
      "Gold/Jewellery sale T&Cs jo 14K-24K gold articles ko BIS hallmark (HUID) ke bina bechne ki anumati dein, ya item ko 'custom' bolke hallmarking ki responsibility se inkar karein.",
    legal_basis:
      "BIS Hallmarking Regulations, 2018 (notified mandatory hallmarking from 16 June 2021); BIS Act, 2016 — Section 14 & 17",
    severity: "high",
    plainEnglishTemplate:
      "These T&Cs let the jeweller sell gold (14K–24K) without a BIS hallmark or evade hallmarking by calling the item 'custom'. Since 16 June 2021, BIS hallmarking (with HUID) is mandatory for the notified purity grades, subject to limited notified exemptions (e.g. articles below a notified weight). Sale without hallmarking is a penal offence. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "ये शर्तें ज्वेलर को BIS हॉलमार्क के बिना सोना (14K–24K) बेचने या वस्तु को 'कस्टम' कहकर हॉलमार्किंग से बचने देती हैं। 16 जून 2021 से BIS हॉलमार्किंग (HUID के साथ) सूचित शुद्धता ग्रेड के लिए अनिवार्य है, सीमित सूचित छूटों के अधीन। बिना हॉलमार्किंग बिक्री एक दंडनीय अपराध है। मिलान की गई धारा: \"{clause}\"।",
  },

  // 12. Gold loan LTV / auction transparency
  {
    id: "RBI-GOLDLTV-012",
    category: "RBI",
    pattern_description_en:
      "Gold loan agreement that (a) permits loan-to-value above 75% of the gold's value (the RBI regulatory cap for non-agricultural gold loans), (b) allows the lender to auction the pledged gold without giving at least 15 days' notice and an opportunity to redeem, or (c) values the gold at less than the average closing price of 22-carat gold for the preceding 30 days, contrary to RBI's Master Direction on Gold Loans and the BIS / RBI auction rules.",
    pattern_description_hi:
      "सोना ऋण समझौता जो 75% से अधिक LTV की अनुमति देता है, बिना 15 दिन की सूचना और छुड़ाने के अवसर के गिरवी सोने की नीलामी करता है, या सोने का मूल्य पिछले 30 दिनों की औसत कीमत से कम आंकता है।",
    pattern_description_hinglish:
      "Gold loan agreement jo 75% se zyada LTV ki anumati de, bina 15 din notice aur redeem karne ke mauke ke pledged gold ki auction kare, ya gold ka value pichhle 30 din ki average price se kam aankhe.",
    legal_basis:
      "RBI Master Direction on Loans and Advances — Gold Loan norms (LTV cap 75%); RBI Fair Practices Code (notice before auction)",
    severity: "high",
    plainEnglishTemplate:
      "This gold-loan clause breaches RBI's gold-loan norms: it allows LTV above 75% of the gold's value, lets the lender auction the pledged gold without 15 days' notice and a chance to redeem, or undervalues the gold. RBI caps LTV at 75% for non-agricultural gold loans and mandates notice plus valuation at the trailing 30-day average of 22-carat gold. Matched clause: \"{clause}\".",
    plainHindiTemplate:
      "यह गोल्ड लोन धारा RBI के गोल्ड लोन नियमों का उल्लंघन करती है: यह सोने के मूल्य के 75% से अधिक LTV की अनुमति देती है, बिना 15 दिन की सूचना और छुड़ाने के मौके के नीलामी करती है, या सोने का अवमूल्यांकन करती है। RBI गैर-कृषि गोल्ड लोन के लिए LTV 75% पर सीमित करता है और 22-कैरेट सोने की पिछली 30-दिन औसत कीमत पर मूल्यांकन और सूचना अनिवार्य करता है। मिलान की गई धारा: \"{clause}\"।",
  },
];

export default financeRules;

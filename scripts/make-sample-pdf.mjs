// ===========================================================================
// /scripts/make-sample-pdf.mjs
// Generate a tiny sample PDF to test the multipart upload path.
// ===========================================================================

import fs from "node:fs";

// Minimal valid PDF with one page of extractable text.
const text = "Builder-Buyer Agreement. The Builder shall not be liable for any mortgage, lien, or litigation affecting the title. The Builder may cancel the allotment and forfeit 25% of the consideration. Force Majeure includes labour shortage and material shortage. Disputes shall be referred to arbitration seated in Singapore.";

const pdf = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${text.length + 50} >>
stream
BT /F1 12 Tf 72 720 Td (${text}) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000241 00000 n
0000000339 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
410
%%EOF
`;

fs.writeFileSync("/home/z/my-project/scripts/sample.pdf", pdf);
console.log("Wrote sample.pdf (" + pdf.length + " bytes)");

// Now POST it as multipart/form-data to /api/analyze
const form = new FormData();
const file = new Blob([pdf], { type: "application/pdf" });
form.append("file", file, "sample.pdf");
form.append("sector", "construction");
form.append("docLanguage", "en");

const res = await fetch("http://localhost:3000/api/analyze", { method: "POST", body: form });
const data = await res.json();
console.log("\n[multipart test] status:", res.status);
console.log("[multipart test] result:", JSON.stringify({ status: data.status, riskScore: data.riskScore, clauses: data.clauses?.length, rulesConsidered: data.rulesConsidered }, null, 2));

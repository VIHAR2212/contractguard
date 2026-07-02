// ===========================================================================
// /scripts/test-analyze.mjs
// Quick end-to-end test for /api/analyze — uses pasted-text JSON path.
// Run with: node /home/z/my-project/scripts/test-analyze.mjs
// ===========================================================================

const SAMPLE_PASTED = `
Allottee Agreement for Flat No. 402, Tower B

1. Possession Date and Delay
The Builder shall endeavour to hand over possession of the Apartment on or before 31 December 2026.
In the event of delay, the Builder's maximum liability for delay shall be limited to Rs. 5 per square foot per month,
and the Allottee agrees that this rate is in full and final settlement of all claims for delay.

2. Saleable Area
The Sale Consideration is computed on the Super Built-up Area of the Apartment, being 1450 sq.ft.,
which includes the carpet area, balconies, walls, and a proportionate share of common areas.
The Builder reserves the right to vary the carpet area by up to 8% without any adjustment in the Sale Consideration.

3. Title and Encumbrance
The Allottee acknowledges that the Builder has disclosed all known encumbrances on the land.
The Builder shall not be liable for any mortgage, charge, lien, or litigation affecting the title that may arise
after the execution of this Agreement, and the Allottee accepts the title "as is".

4. Force Majeure
For the purposes of this Agreement, "Force Majeure" shall include, without limitation, delay in obtaining
statutory approvals, shortage of labour, shortage of construction material, change in government policy,
increase in input costs, rainfall, civil commotion, and any other cause beyond the reasonable control of the Builder.
The Builder shall be entitled to an extension of the possession date for the entire duration of the Force Majeure event
without payment of any compensation to the Allottee.

5. Cancellation by Builder
If the Allottee commits any default in payment of instalments for a period of 30 days, the Builder may,
at its sole discretion, cancel the allotment and forfeit 25% of the total Sale Consideration as liquidated damages,
in addition to the amounts already paid towards construction cost.

6. Dispute Resolution
All disputes arising out of this Agreement shall be referred to a sole arbitrator appointed by the Builder,
and the seat of arbitration shall be Singapore. The courts at Mumbai shall have exclusive jurisdiction,
to the exclusion of the Real Estate Regulatory Authority.
`;

async function main() {
  const payload = {
    pastedText: SAMPLE_PASTED,
    sector: "construction",
    docLanguage: "en",
  };

  console.log("[test] POSTing to /api/analyze …");
  const res = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  console.log("[test] status:", res.status);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));

  if (data.status === "success") {
    console.log(`\n[test] OK ${data.clauses.length} clauses flagged, riskScore=${data.riskScore}, pipelineMs=${data.pipelineMs}, rulesConsidered=${data.rulesConsidered}`);
  } else {
    console.error("\n[test] FAIL analysis failed");
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[test] error:", err);
  process.exit(1);
});

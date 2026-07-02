// ===========================================================================
// /scripts/test-all-sectors.mjs
// Verifies all three sector pipelines return sensible results.
// ===========================================================================

const SAMPLES = {
  finance: `
Personal Loan Agreement — Bank X

1. Processing Fee
The Borrower shall pay a processing fee of 2.5% of the loan amount, plus a documentation
charge of Rs. 5,000 and a one-time insurance premium of Rs. 8,000, all of which may be
deducted upfront from the disbursed loan amount at the Bank's discretion.

2. Interest Rate
The loan carries a floating rate of interest linked to the Bank's internal benchmark.
The Bank reserves the right to reset the rate at any time and from time to time without
prior notice to the Borrower. The Borrower agrees that the Bank's communication on the
website shall be deemed sufficient notice.

3. Prepayment
The Borrower may prepay the loan subject to a prepayment penalty of 4% of the
outstanding principal plus applicable taxes.

4. Default
On default, the Bank shall be entitled to compound the interest at the contractual rate
on the unpaid amount, including on the penal interest already accrued.

5. Credit Card T&C (Companion)
Annualised percentage rate shall be as published on the Bank's website. A late payment
fee of Rs. 1,000 plus a finance charge on the late fee itself shall apply if payment is
not received by the due date. The Bank may auto-upgrade the card to a higher tier if
the Borrower does not respond within 7 days of email notification.

6. Gold Loan
The Bank may lend up to 90% of the value of the pledged gold. The gold shall be valued
at the rate prevailing on the date of sanction. On default, the Bank may auction the
pledged gold without notice.
`,
  "gig-job": `
Employment Offer Letter — Tech Company Y

1. Probation
You will be on probation for a period of six (6) months. The Company may, at its sole
discretion, extend the probation period by further periods of three (3) months each
until such time as the Company is satisfied with your performance. During probation
you will not be eligible for any bonus or for the provident fund.

2. Notice Period
You are required to give the Company ninety (90) days' notice in writing should you
wish to resign. The Company may terminate your employment at any time with thirty (30)
days' notice or payment in lieu thereof.

3. Non-Compete
For a period of two (2) years following the termination of your employment, you shall
not, directly or indirectly, engage in any business that competes with the Company
anywhere in India or abroad.

4. Confidentiality
You agree that all information relating to the Company, including the general skills and
knowledge you acquire during your employment, shall be deemed confidential and shall
not be disclosed by you at any time, whether during or after your employment.

5. Intellectual Property
All inventions, designs, and works of authorship created by you, whether before, during,
or after your employment, and whether or not related to the Company's business, shall be
the sole and exclusive property of the Company.

6. Termination
The Company may terminate your employment at will and without cause at any time,
without any severance or retrenchment compensation.

7. Exclusivity
During the term of your employment you shall not engage with any other platform, customer
or client, whether paid or unpaid, without the prior written consent of the Company.

8. Auto-Debit
You hereby authorise the Company to debit your bank account for any shortfall, damage,
or penalty arising out of your engagement, without further notice or adjudication.

9. Code of Conduct
You agree not to make any public statement, on social media or otherwise, that is critical
of the Company, the industry, or any government policy, during and after your employment.

10. Dispute Resolution
All disputes shall be referred to arbitration seated in London, to the exclusion of all
Indian courts.
`,
  construction: `
Builder-Buyer Agreement — Flat 501

1. Possession
The Builder's maximum liability for delay in possession shall be Rs. 2 per sq.ft. per month.

2. Saleable Area
The Sale Consideration is on the Super Built-up Area. The Builder may vary the carpet
area by up to 10% without adjustment.

3. Title
The Builder disclaims all liability for any mortgage, charge, lien or litigation
affecting the title of the land.

4. Force Majeure
Force Majeure includes delay in statutory approvals, labour shortage, material shortage,
government policy changes, and increase in input costs.

5. Cancellation
The Builder may cancel the allotment and forfeit 25% of the total consideration as
liquidated damages.

6. Dispute Resolution
Disputes shall be referred to arbitration seated in Singapore, to the exclusion of the
Real Estate Regulatory Authority.
`,
};

async function testSector(sector, expectedMin) {
  const res = await fetch("http://localhost:3000/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pastedText: SAMPLES[sector], sector, docLanguage: "en" }),
  });
  const data = await res.json();
  const ids = data.clauses?.map((c) => c.ruleId) ?? [];
  console.log(`\n=== ${sector} ===`);
  console.log(`  status: ${data.status}, riskScore: ${data.riskScore}, clauses: ${data.clauses?.length}, rulesConsidered: ${data.rulesConsidered}`);
  console.log(`  matched rule IDs: ${ids.join(", ")}`);
  if (data.clauses?.length < expectedMin) {
    console.error(`  ✗ expected at least ${expectedMin} clauses, got ${data.clauses?.length}`);
    process.exitCode = 1;
  } else {
    console.log(`  ✓ at least ${expectedMin} matched (got ${data.clauses?.length})`);
  }
}

await testSector("construction", 5);
await testSector("finance", 6);
await testSector("gig-job", 6);

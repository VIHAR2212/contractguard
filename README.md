# ContractGuard — AI contract review for Indian consumers

Upload a flat-buyer agreement, a personal-loan agreement, a credit-card T&C,
a gold/jewellery loan & buyback document, or a job offer letter. ContractGuard
matches every clause against **real Indian law** — RERA, RBI guidelines, BIS
Hallmarking Regulations, the Indian Contract Act, the Code on Social Security
2020, DPDP 2023 — and tells you, in plain English or Hindi, what to push
back on.

> ⚠️ ContractGuard is an **information tool**. It is not a substitute for
> advice from a qualified advocate. If a matched clause affects a real
> transaction, please consult a lawyer registered with the Bar Council of
> India.

---

## Tech stack

| Layer        | Choice                                                        |
|--------------|---------------------------------------------------------------|
| Framework    | Next.js 16 (App Router, `runtime = 'nodejs'` for the API)    |
| Language     | TypeScript 5 (strict)                                         |
| Styling      | Tailwind CSS 4 + shadcn/ui (New York)                         |
| Animation    | Framer Motion                                                 |
| AI           | Groq SDK (`llama-3.3-70b-versatile` text, `llama-3.2-90b-vision-preview` vision) |
| File parsing | `pdf-parse` (PDF), `adm-zip` (ZIP), native (image / text)     |
| Package mgr  | Bun (also works with npm / pnpm / yarn)                       |

## Project structure

```
src/
├── lib/
│   ├── types.ts                     # shared TS types (Rule, MatchedClause, AnalyzeResponse, UiStrings…)
│   ├── rules/
│   │   ├── index.ts                 # rulesBySector map + getRulesForSector()
│   │   ├── construction-rules.ts    # 12 RERA rules
│   │   ├── finance-rules.ts         # 12 rules: Personal Loan + Credit Card + Gold/Jewellery
│   │   └── gig-job-rules.ts         # 12 employment / gig rules
│   ├── i18n/
│   │   ├── index.ts                 # getStrings() + interpolate()
│   │   ├── en.ts / hi.ts / hinglish.ts  # UI dictionaries
│   ├── parsers/
│   │   └── index.ts                 # PDF / ZIP / image / text + detectLanguage()
│   └── groq/
│       └── sector-pipeline.ts       # Extract → Match → Explain via Groq SDK + fallback
└── app/
    ├── api/analyze/route.ts         # multipart + JSON, runtime='nodejs'
    ├── layout.tsx                   # root layout + metadata
    └── page.tsx                     # full demo UI (dropzone, selectors, report)

scripts/
├── test-analyze.mjs                 # smoke test (construction sector)
├── test-all-sectors.mjs             # cross-sector verification
└── make-sample-pdf.mjs              # multipart upload test
```

## Rules database

36 hand-curated rules across three sectors. Every rule is anchored to a real
Indian statute:

- **Construction** (12 rules) — RERA Sections 2(k), 4(2)(ii)(A), 6, 13(1),
  14, 18, 79; Model Builder-Buyer Agreement; Supreme Court precedents
  (Pioneer Urban Land 2019, Imperium Structures 2020, Nabha Foundation 2018).
- **Finance** (12 rules) — RBI Master Direction on Credit Cards (2022);
  RBI Circular on Penal Charges (Aug 2024); RBI KFS Transparency Circular
  (Aug 2024); RBI Floating Rate on Personal Loans Circular (Dec 2024);
  BIS Hallmarking Regulations 2018 (mandatory hallmarking from 16 June 2021);
  RBI Master Direction on Gold Loans (LTV cap 75%).
- **Gig-Job** (12 rules) — Indian Contract Act 1872 (Sections 2(d), 19, 23,
  27, 32); Industrial Disputes Act 1947 (Section 25F); Industrial Employment
  (Standing Orders) Act 1946; Code on Wages 2019; Code on Social Security
  2020 (Sections 2(35), 113–114); Digital Personal Data Protection Act 2023;
  Patents Act 1970; Copyright Act 1957.

Each rule carries: `id`, `category`, pattern descriptions in **English +
Hindi (Devanagari) + Hinglish**, `legal_basis`, `severity`, and
plain-English / Hindi explanation templates with `{clause}` interpolation.

---

## Local development

### 1. Install dependencies

```bash
bun install          # or: npm install / pnpm install / yarn install
```

### 2. Environment variables

Copy `.env.example` to `.env` and fill in your Groq API key:

```bash
cp .env.example .env
```

```env
# Required for the AI pipeline (without it, the keyword fallback runs)
GROQ_API_KEY=gsk_...

# Optional — override the default models
# GROQ_MODEL=llama-3.3-70b-versatile
# GROQ_VISION_MODEL=llama-3.2-90b-vision-preview

# Only needed if you use Prisma (not required for the analyzer)
DATABASE_URL=file:./db/custom.db
```

Get a free Groq API key at <https://console.groq.com/keys>.

### 3. Run the dev server

```bash
bun run dev          # or: npm run dev
```

Open <http://localhost:3000>.

### 4. (Optional) Run the test scripts

```bash
node scripts/test-analyze.mjs           # construction sector smoke test
node scripts/test-all-sectors.mjs       # all three sectors
node scripts/make-sample-pdf.mjs        # multipart PDF upload test
```

---

## API reference

### `POST /api/analyze`

Accepts two content types.

#### A. `multipart/form-data` (file upload)

| Field         | Type   | Required | Notes                                            |
|---------------|--------|----------|--------------------------------------------------|
| `file`        | File   | yes      | PDF / ZIP / PNG / JPG / WEBP / GIF / TXT / MD    |
| `sector`      | string | yes      | `construction` \| `finance` \| `gig-job`        |
| `docLanguage` | string | yes      | `en` \| `hi` \| `hinglish`                       |

Max upload size: **25 MB**.

#### B. `application/json` (pasted text)

```jsonc
{
  "pastedText": "Allottee Agreement for Flat 402…",
  "sector": "construction",
  "docLanguage": "en"
}
```

Text length: 30 – 200 000 characters.

#### Response (200 OK)

```jsonc
{
  "status": "success",
  "riskScore": 75,                 // 0–100, severity-weighted
  "clauses": [
    {
      "ruleId": "RERA-DELAY-001",
      "category": "RERA",
      "severity": "high",          // high | medium | low
      "snippet": "…verbatim text from the document…",
      "explanationEn": "…plain-English explanation…",
      "explanationHi": "…हिन्दी स्पष्टीकरण…",
      "legalBasis": "RERA, 2016 — Section 18",
      "roadmapNote": "Matched on keywords: delay, possession, compensation."
    }
  ],
  "sector": "construction",
  "docLanguage": "en",
  "rulesConsidered": 12,
  "pipelineMs": 1422,
  "message": "Optional warning / roadmap note"
}
```

Risk score weights: **high = 25**, **medium = 12**, **low = 5**, capped at 100.

#### Example — `curl` (file upload)

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@./agreement.pdf" \
  -F "sector=construction" \
  -F "docLanguage=en"
```

#### Example — `curl` (pasted text)

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pastedText":"…","sector":"finance","docLanguage":"en"}'
```

---

## Deploy to Vercel

1. **Push to GitHub** — push this repository to a GitHub repo, e.g.
   `https://github.com/VIHAR2212/contractguard`.
2. **Import on Vercel** — go to <https://vercel.com/new>, select your repo,
   and click **Import**. Vercel will auto-detect Next.js.
3. **Add environment variables** — in the Vercel project settings →
   Environment Variables, add:
   - `GROQ_API_KEY` = `gsk_...`
   - (Optional) `GROQ_MODEL`, `GROQ_VISION_MODEL` overrides
4. **Deploy** — click **Deploy**. The build will run `next build`
   automatically.
5. **Verify** — once deployed, visit the Vercel URL, paste a sample
   contract, and confirm the report renders.

> The API route uses `export const runtime = 'nodejs'` so `pdf-parse` and
> `adm-zip` work on Vercel's Node.js runtime (not the Edge runtime).

---

## How the AI pipeline works

```
Uploaded file
     │
     ▼
[ parsers/index.ts ]
   • PDF → pdf-parse extracts text layer
   • ZIP → adm-zip opens it, reads every contained PDF / .txt / .md / image
   • Image → base64 + media type preserved for vision pass
   • Text → passthrough
     │
     ▼
ParsedDocument  { kind: "text" | "image", text?, base64?, mediaType?, filename, warnings }
     │
     ▼
[ groq/sector-pipeline.ts ]
   1. Load rules DB for the selected sector (e.g. 12 RERA rules)
   2. Build system prompt that LISTS every rule ID + pattern description
   3. Send document text or image to Groq
      • Text  → llama-3.3-70b-versatile, response_format=json_object
      • Image → llama-3.2-90b-vision-preview, multimodal message
   4. Model returns { matches: [{ ruleId, snippet, confidence }] }
      — constrained to ONLY rule IDs from our DB (never invents a rule)
   5. For every match, render the rule's plain-English/Hindi template
      with the verbatim snippet substituted into {clause}
   6. Compute risk score = Σ(severity weights), capped at 100
   7. If GROQ_API_KEY is missing OR the API call fails, fall back to a
      deterministic keyword matcher (per-rule keyword tables) so the demo
      always returns a sensible result
     │
     ▼
AnalyzeResponse  →  POST /api/analyze  →  frontend renders the report
```

### What the AI does NOT do

- ❌ Invent rules — every rule in the output comes from the verified DB.
- ❌ Invent legal citations — `legal_basis` is always the rule's pre-set value.
- ❌ Store your document — files are parsed in memory, sent to Groq, discarded.

---

## i18n

Three UI dictionaries (English / Hindi / Hinglish) cover every visible
string. Switch languages from the top-right chip switcher. The document's
own language is selected separately — if the document is not in
English / Hindi / Hinglish, the model translates internally and adds a
roadmap note to the report.

---

## License

MIT — see `LICENSE` if included, or assume MIT.

## Credits

Built for Indian consumers. Legal references are publicly available
statutes and Supreme Court judgments; this project does not claim any
affiliation with RERA, RBI, BIS, or any government body.

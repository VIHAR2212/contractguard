<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0A0A,100:1A1A1A&height=140&section=header&text=ContractGuard&fontSize=46&fontColor=E8E8E8&fontAlignY=55&animation=fadeIn&descAlignY=75" width="100%"/>

<img src="https://readme-typing-svg.demolab.com/?font=Georgia&size=22&duration=3000&pause=1000&color=B0B0B0&center=true&vCenter=true&width=600&height=40&lines=Read+the+contract+before+it+reads+you." alt="Typing SVG" />

<br/>

**AI contract review for Indian consumers** — flat-buyer agreements, personal loans,
credit-card T&Cs, gold-loan documents, and job offer letters, checked against
**real Indian law**.

<br/>

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-000000?style=for-the-badge&logo=vercel&logoColor=E8E8E8)](https://contractguard-ten.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js_16-1A1A1A?style=for-the-badge&logo=next.js&logoColor=E8E8E8)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-1A1A1A?style=for-the-badge&logo=typescript&logoColor=E8E8E8)](https://www.typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq_LLaMA-1A1A1A?style=for-the-badge&logo=lightning&logoColor=E8E8E8)](https://groq.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-1A1A1A?style=for-the-badge&logoColor=E8E8E8)](#license)

</div>

<br/>

<img src="https://raw.githubusercontent.com/VIHAR2212/contractguard/main/docs/hero-screenshot.png" width="100%" alt="ContractGuard homepage — Read the contract before it reads you."/>

<p align="center"><sub>⚠️ Screenshot path above is a placeholder — see the note at the bottom of this file for the one-time upload step.</sub></p>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

<br/>

> [!WARNING]
> ContractGuard is an **information tool**. It is not a substitute for advice
> from a qualified advocate. If a matched clause affects a real transaction,
> please consult a lawyer registered with the Bar Council of India.

<br/>

## Table of contents

- [Tech stack](#tech-stack)
- [Project structure](#project-structure)
- [Rules database](#rules-database)
- [Local development](#local-development)
- [API reference](#api-reference)
- [Deploy to Vercel](#deploy-to-vercel)
- [How the AI pipeline works](#how-the-ai-pipeline-works)
- [i18n](#i18n)
- [License](#license)
- [Credits](#credits)

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## Tech stack

| Layer        | Choice                                                                           |
|--------------|-----------------------------------------------------------------------------------|
| Framework    | Next.js 16 (App Router, `runtime = 'nodejs'` for the API)                        |
| Language     | TypeScript 5 (strict)                                                             |
| Styling      | Tailwind CSS 4 + shadcn/ui (New York)                                             |
| Animation    | Framer Motion                                                                     |
| AI           | Groq SDK (`llama-3.3-70b-versatile` text, `llama-3.2-90b-vision-preview` vision)  |
| File parsing | `pdf-parse` (PDF), `adm-zip` (ZIP), native (image / text)                         |
| Package mgr  | Bun (also works with npm / pnpm / yarn)                                          |

<br/>

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
│   │   └── en.ts / hi.ts / hinglish.ts  # UI dictionaries
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

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## Rules database

**36 hand-curated rules** across three sectors. Every rule is anchored to a
real Indian statute — nothing is invented at inference time.

<table>
<tr><td width="33%" valign="top">

### 🏗️ Construction
**12 rules**

RERA Sections 2(k), 4(2)(ii)(A),
6, 13(1), 14, 18, 79

Model Builder-Buyer Agreement

Supreme Court precedents:
- Pioneer Urban Land (2019)
- Imperium Structures (2020)
- Nabha Foundation (2018)

</td><td width="33%" valign="top">

### 💰 Finance
**12 rules**

RBI Master Direction on Credit
Cards (2022)

RBI Circular on Penal Charges
(Aug 2024)

RBI KFS Transparency Circular
(Aug 2024)

RBI Floating Rate on Personal
Loans Circular (Dec 2024)

BIS Hallmarking Regulations 2018

RBI Master Direction on Gold
Loans (LTV cap 75%)

</td><td width="33%" valign="top">

### 💼 Gig / Job
**12 rules**

Indian Contract Act 1872
(Sections 2(d), 19, 23, 27, 32)

Industrial Disputes Act 1947
(Section 25F)

Industrial Employment
(Standing Orders) Act 1946

Code on Wages 2019

Code on Social Security 2020
(Sections 2(35), 113–114)

DPDP Act 2023 · Patents Act
1970 · Copyright Act 1957

</td></tr>
</table>

Each rule carries: `id`, `category`, pattern descriptions in **English +
Hindi (Devanagari) + Hinglish**, `legal_basis`, `severity`, and plain-English
/ Hindi explanation templates with `{clause}` interpolation.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## Local development

### 1 · Install dependencies

```bash
bun install          # or: npm install / pnpm install / yarn install
```

### 2 · Environment variables

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

Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

### 3 · Run the dev server

```bash
bun run dev          # or: npm run dev
```

Open [localhost:3000](http://localhost:3000).

### 4 · (Optional) Run the test scripts

```bash
node scripts/test-analyze.mjs           # construction sector smoke test
node scripts/test-all-sectors.mjs       # all three sectors
node scripts/make-sample-pdf.mjs        # multipart PDF upload test
```

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## API reference

### `POST /api/analyze`

Accepts two content types.

#### A. `multipart/form-data` (file upload)

| Field         | Type   | Required | Notes                                          |
|---------------|--------|----------|-------------------------------------------------|
| `file`        | File   | yes      | PDF / ZIP / PNG / JPG / WEBP / GIF / TXT / MD  |
| `sector`      | string | yes      | `construction` \| `finance` \| `gig-job`       |
| `docLanguage` | string | yes      | `en` \| `hi` \| `hinglish`                     |

Max upload size: **25 MB**.

#### B. `application/json` (pasted text)

```jsonc
{
  "pastedText": "Allottee Agreement for Flat 402…",
  "sector": "construction",
  "docLanguage": "en"
}
```

Text length: 30 – 200,000 characters.

#### Response — `200 OK`

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

Risk score weights: **high = 25** · **medium = 12** · **low = 5** · capped at 100.

<details>
<summary><b>Example — curl (file upload)</b></summary>

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@./agreement.pdf" \
  -F "sector=construction" \
  -F "docLanguage=en"
```

</details>

<details>
<summary><b>Example — curl (pasted text)</b></summary>

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pastedText":"…","sector":"finance","docLanguage":"en"}'
```

</details>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## Deploy to Vercel

1. **Push to GitHub** — push this repository to a GitHub repo, e.g.
   `github.com/VIHAR2212/contractguard`.
2. **Import on Vercel** — go to [vercel.com/new](https://vercel.com/new),
   select your repo, and click **Import**. Vercel auto-detects Next.js.
3. **Add environment variables** — in Vercel project settings →
   Environment Variables, add:
   - `GROQ_API_KEY` = `gsk_...`
   - *(Optional)* `GROQ_MODEL`, `GROQ_VISION_MODEL` overrides
4. **Deploy** — click **Deploy**. The build runs `next build` automatically.
5. **Verify** — once deployed, visit the Vercel URL, paste a sample
   contract, and confirm the report renders.

> [!NOTE]
> The API route uses `export const runtime = 'nodejs'` so `pdf-parse` and
> `adm-zip` work on Vercel's Node.js runtime (not the Edge runtime).

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

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

- ❌ **Invent rules** — every rule in the output comes from the verified DB.
- ❌ **Invent legal citations** — `legal_basis` is always the rule's pre-set value.
- ❌ **Store your document** — files are parsed in memory, sent to Groq, discarded.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## i18n

Three UI dictionaries — **English / Hindi / Hinglish** — cover every visible
string. Switch languages from the top-right chip switcher. The document's
own language is selected separately — if the document isn't in English,
Hindi, or Hinglish, the model translates internally and adds a roadmap note
to the report.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:1A1A1A,100:0A0A0A&height=2&width=100%25" width="100%"/>
</div>

## License

MIT — see `LICENSE` if included, or assume MIT.

## Credits

Built for Indian consumers. Legal references are publicly available statutes
and Supreme Court judgments; this project does not claim any affiliation
with RERA, RBI, BIS, or any government body.

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0A0A,100:1A1A1A&height=100&section=footer" width="100%"/>

<sub>ContractGuard · Built solo · <a href="https://contractguard-ten.vercel.app">Live demo</a></sub>

</div>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0A0A,50:141414,100:0A0A0A&height=140&section=header&text=ContractGuard&fontSize=44&fontColor=EDEDED&fontAlignY=52&animation=fadeIn&descAlignY=75&descAlign=50" width="100%"/>

<img src="https://readme-typing-svg.demolab.com/?font=Georgia&size=21&duration=2800&pause=1400&color=A8A8A8&center=true&vCenter=true&width=560&height=40&lines=Read+the+contract+before+it+reads+you." alt="tagline" />

<sub>AI contract review for Indian consumers · RERA · RBI · BIS · Indian Contract Act</sub>

<br/><br/>

[![Live Demo](https://img.shields.io/badge/→_LIVE_DEMO-EDEDED?style=for-the-badge&labelColor=0A0A0A&color=141414)](https://contractguard-ten.vercel.app)
&nbsp;
[![Next.js](https://img.shields.io/badge/Next.js_16-141414?style=flat-square&logo=next.js&logoColor=EDEDED)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-141414?style=flat-square&logo=typescript&logoColor=3178C6)](https://www.typescriptlang.org)
[![Groq](https://img.shields.io/badge/Groq_·_LLaMA_3.3-141414?style=flat-square&logo=lightning&logoColor=F55036)](https://groq.com)
[![Vercel](https://img.shields.io/badge/Deployed_on_Vercel-141414?style=flat-square&logo=vercel&logoColor=EDEDED)](https://vercel.com)
[![MIT](https://img.shields.io/badge/License-MIT-141414?style=flat-square)](#license)

</div>

<br/>

<table width="100%">
<tr>
<td width="50%" valign="top">

### 😬 Without ContractGuard

You sign the flat-buyer agreement.
Six months later possession is delayed
— and Clause 14(b) says that's your
problem, not the builder's.

You find out *after* you've signed.

</td>
<td width="50%" valign="top">

### ✅ With ContractGuard

You upload the same PDF. In under
a minute, Clause 14(b) is flagged
**high severity**, matched to
**RERA Section 18**, with the exact
compensation you're owed.

You find out *before* you sign.

</td>
</tr>
</table>

<div align="center">
<img src="https://raw.githubusercontent.com/VIHAR2212/contractguard/main/docs/hero-screenshot.png" width="100%" alt="ContractGuard — Read the contract before it reads you."/>
<sub><i>Screenshot path is a placeholder until the image is pushed — see the note at the very bottom.</i></sub>
</div>

<br/>

> [!WARNING]
> ContractGuard is an **information tool**, not legal advice. If a matched
> clause affects a real transaction, consult a lawyer registered with the
> Bar Council of India.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 🗺️ Contents

<table width="100%"><tr><td>

[`Tech stack`](#tech-stack) · [`Structure`](#-project-structure) · [`Rules DB`](#the-rules-database) · [`Quick start`](#-quick-start) · [`API`](#-api-reference) · [`Deploy`](#-deploy-to-vercel) · [`Pipeline`](#-how-the-pipeline-thinks) · [`i18n`](#-i18n) · [`License`](#-license--credits)

</td></tr></table>

<br/>

## ⚙️ Tech stack

<table width="100%">
<tr><td width="18%"><b>Framework</b></td><td>Next.js 16 — App Router, <code>runtime = 'nodejs'</code> for the API</td></tr>
<tr><td><b>Language</b></td><td>TypeScript 5, strict mode</td></tr>
<tr><td><b>Styling</b></td><td>Tailwind CSS 4 + shadcn/ui <i>(New York style)</i></td></tr>
<tr><td><b>Motion</b></td><td>Framer Motion</td></tr>
<tr><td><b>AI</b></td><td>Groq SDK — <code>llama-3.3-70b-versatile</code> (text) · <code>llama-3.2-90b-vision-preview</code> (vision)</td></tr>
<tr><td><b>Parsing</b></td><td><code>pdf-parse</code> · <code>adm-zip</code> · native image / text</td></tr>
<tr><td><b>Package mgr</b></td><td>Bun <i>(npm / pnpm / yarn all work too)</i></td></tr>
</table>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 📁 Project structure

```
src/
├── lib/
│   ├── types.ts                     # Rule, MatchedClause, AnalyzeResponse, UiStrings…
│   ├── rules/
│   │   ├── index.ts                 # rulesBySector map + getRulesForSector()
│   │   ├── construction-rules.ts    # 12 RERA rules
│   │   ├── finance-rules.ts         # 12 rules — Personal Loan + Credit Card + Gold/Jewellery
│   │   └── gig-job-rules.ts         # 12 employment / gig rules
│   ├── i18n/
│   │   ├── index.ts                 # getStrings() + interpolate()
│   │   └── en.ts / hi.ts / hinglish.ts
│   ├── parsers/
│   │   └── index.ts                 # PDF / ZIP / image / text + detectLanguage()
│   └── groq/
│       └── sector-pipeline.ts       # Extract → Match → Explain, with fallback
└── app/
    ├── api/analyze/route.ts         # multipart + JSON, runtime='nodejs'
    ├── layout.tsx
    └── page.tsx                     # dropzone, selectors, report UI

scripts/
├── test-analyze.mjs                 # smoke test — construction sector
├── test-all-sectors.mjs             # cross-sector verification
└── make-sample-pdf.mjs              # multipart upload test
```

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## ⚖️ The rules database

<div align="center">

**36 hand-curated rules** · anchored to real Indian statutes · **nothing invented at inference time**

</div>

<br/>

<table width="100%">
<tr><td width="33%" valign="top">

#### 🏗️ Construction
<sub><b>12 rules</b></sub>

RERA §§ 2(k), 4(2)(ii)(A), 6,
13(1), 14, 18, 79

Model Builder-Buyer Agreement

**Precedents:**
Pioneer Urban Land (2019) ·
Imperium Structures (2020) ·
Nabha Foundation (2018)

</td><td width="33%" valign="top">

#### 💰 Finance
<sub><b>12 rules</b></sub>

RBI Master Direction, Credit
Cards (2022)

RBI Penal Charges Circular
(Aug 2024)

RBI KFS Transparency Circular
(Aug 2024)

RBI Floating Rate, Personal
Loans (Dec 2024)

BIS Hallmarking Regs 2018

RBI Gold Loans — LTV cap 75%

</td><td width="33%" valign="top">

#### 💼 Gig / Job
<sub><b>12 rules</b></sub>

Indian Contract Act 1872
§§ 2(d), 19, 23, 27, 32

Industrial Disputes Act 1947
§ 25F

Industrial Employment
(Standing Orders) Act 1946

Code on Wages 2019

Code on Social Security 2020
§§ 2(35), 113–114

DPDP 2023 · Patents 1970 ·
Copyright 1957

</td></tr>
</table>

Each rule carries an `id`, `category`, pattern descriptions in **English +
Hindi (Devanagari) + Hinglish**, `legal_basis`, `severity`, and bilingual
explanation templates with `{clause}` interpolation.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 🚀 Quick start

```bash
bun install && cp .env.example .env
# → drop your GROQ_API_KEY into .env (free key: console.groq.com/keys)
bun run dev
# → open localhost:3000
```

<details>
<summary><b>Full setup, step by step</b></summary>

<br/>

**1 · Install dependencies**

```bash
bun install          # or: npm install / pnpm install / yarn install
```

**2 · Environment variables**

```bash
cp .env.example .env
```

```env
# Required for the AI pipeline — without it, the keyword fallback runs
GROQ_API_KEY=gsk_...

# Optional — override the default models
# GROQ_MODEL=llama-3.3-70b-versatile
# GROQ_VISION_MODEL=llama-3.2-90b-vision-preview

# Only needed if you use Prisma (not required for the analyzer)
DATABASE_URL=file:./db/custom.db
```

Get a free Groq API key at [console.groq.com/keys](https://console.groq.com/keys).

**3 · Run the dev server**

```bash
bun run dev          # or: npm run dev
```

Open [localhost:3000](http://localhost:3000).

**4 · (Optional) run the test scripts**

```bash
node scripts/test-analyze.mjs           # construction sector smoke test
node scripts/test-all-sectors.mjs       # all three sectors
node scripts/make-sample-pdf.mjs        # multipart PDF upload test
```

</details>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 🔌 API reference

### `POST /api/analyze`

Accepts two content types —

<table width="100%">
<tr><td width="50%" valign="top">

**A · `multipart/form-data`** *(file upload)*

| Field | Type | Notes |
|---|---|---|
| `file` | File | PDF·ZIP·PNG·JPG·WEBP·GIF·TXT·MD |
| `sector` | string | `construction`\|`finance`\|`gig-job` |
| `docLanguage` | string | `en`\|`hi`\|`hinglish` |

Max upload: **25 MB**

</td><td width="50%" valign="top">

**B · `application/json`** *(pasted text)*

```jsonc
{
  "pastedText": "Allottee Agreement…",
  "sector": "construction",
  "docLanguage": "en"
}
```

Length: **30 – 200,000** characters

</td></tr>
</table>

**Response — `200 OK`**

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

<sub>Risk weights → **high = 25** · **medium = 12** · **low = 5** · capped at 100</sub>

<details>
<summary><b>curl — file upload</b></summary>

```bash
curl -X POST http://localhost:3000/api/analyze \
  -F "file=@./agreement.pdf" \
  -F "sector=construction" \
  -F "docLanguage=en"
```

</details>

<details>
<summary><b>curl — pasted text</b></summary>

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"pastedText":"…","sector":"finance","docLanguage":"en"}'
```

</details>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## ▲ Deploy to Vercel

<table width="100%">
<tr><td width="8%" align="center"><b>1</b></td><td>Push this repo to GitHub — <code>github.com/VIHAR2212/contractguard</code></td></tr>
<tr><td align="center"><b>2</b></td><td>Go to <a href="https://vercel.com/new">vercel.com/new</a> → select the repo → <b>Import</b> (Next.js auto-detected)</td></tr>
<tr><td align="center"><b>3</b></td><td>Add env var <code>GROQ_API_KEY</code> in Project Settings → Environment Variables</td></tr>
<tr><td align="center"><b>4</b></td><td>Click <b>Deploy</b> — <code>next build</code> runs automatically</td></tr>
<tr><td align="center"><b>5</b></td><td>Visit the deployed URL, paste a sample contract, confirm the report renders</td></tr>
</table>

> [!NOTE]
> The API route uses `export const runtime = 'nodejs'` so `pdf-parse` and
> `adm-zip` work on Vercel's Node.js runtime — not the Edge runtime.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 🧠 How the pipeline thinks

```
   Uploaded file
        │
        ▼
   ┌─────────────────────────────────────────────┐
   │  parsers/index.ts                            │
   │  PDF → pdf-parse text layer                   │
   │  ZIP → adm-zip opens every PDF/txt/md/image   │
   │  Image → base64 preserved for vision pass     │
   │  Text → passthrough                           │
   └─────────────────────────────────────────────┘
        │
        ▼
   ParsedDocument { kind, text?, base64?, mediaType?, filename, warnings }
        │
        ▼
   ┌─────────────────────────────────────────────┐
   │  groq/sector-pipeline.ts                      │
   │  1 · load rules DB for selected sector        │
   │  2 · prompt lists every rule ID + pattern     │
   │  3 · send to Groq                             │
   │        text  → llama-3.3-70b-versatile        │
   │        image → llama-3.2-90b-vision-preview   │
   │  4 · model returns matches — DB rule IDs only │
   │  5 · render bilingual template w/ {clause}    │
   │  6 · risk score = Σ(severity weights), ≤100   │
   │  7 · Groq unavailable → keyword-match fallback│
   └─────────────────────────────────────────────┘
        │
        ▼
   AnalyzeResponse → POST /api/analyze → report UI
```

<table width="100%">
<tr><td>

**What the AI does *not* do**
❌ Invent rules — output only ever cites the verified DB
❌ Invent legal citations — `legal_basis` is always pre-set
❌ Store your document — parsed in memory, sent to Groq, discarded

</td></tr>
</table>

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 🌐 i18n

Three UI dictionaries — **English / Hindi / Hinglish** — cover every visible
string, switchable from the top-right chip switcher. The *document's* own
language is selected separately: if it isn't English, Hindi, or Hinglish,
the model translates internally and adds a roadmap note to the report.

<br/>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:0A0A0A,100:141414&height=2&width=100%25" width="100%"/>
</div>

<br/>

## 📜 License & credits

MIT — see `LICENSE` if included, or assume MIT.

Built for Indian consumers. Legal references are publicly available statutes
and Supreme Court judgments; this project claims no affiliation with RERA,
RBI, BIS, or any government body.

<br/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A0A0A,50:141414,100:0A0A0A&height=100&section=footer" width="100%"/>

<sub><i>Built solo, clause by clause.</i> · <a href="https://contractguard-ten.vercel.app">Live demo →</a></sub>

</div>

<br/>

<sub>⚠️ <b>One-time step:</b> the hero screenshot above points to <code>docs/hero-screenshot.png</code> in this repo. Upload that image to a <code>docs/</code> folder at the repo root (drag-and-drop via GitHub's web UI, or <code>git add docs/hero-screenshot.png</code>) and it renders automatically — no other edits needed.</sub>

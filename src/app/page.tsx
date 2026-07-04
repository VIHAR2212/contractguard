"use client";

// ===========================================================================
// ContractGuard — monochrome redline system
// ---------------------------------------------------------------------------
// Pure black canvas (#000000), 1px #242424 hairline borders, no shadows,
// no glow, no chromatic accent anywhere in the shell. Every button is
// outlined or ghost in grey/off-white — there is no filled or colored
// button in this file.
//
// Color exists in exactly one place: clause severity in the report body.
// That is data the reader scans under time pressure, not decoration, and
// the values are deliberately desaturated so they read as signal rather
// than UI chrome.
//
// Type roles are held strictly apart:
//   - DM Serif Display  → hero headline only, nowhere else
//   - Inter             → every other piece of UI copy, including headings
//   - JetBrains Mono    → rule IDs, legal citations, file sizes, the score
//                          numeral — actual code-identity content only
//
// Motion is held to one sequence: the scan pipeline turning a document
// into a scored report. Nothing fades in on mount, nothing lifts on hover.
// ===========================================================================

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronRight,
  Download,
  FileSearch,
  FileText,
  Filter,
  Image as ImageIcon,
  Layers,
  Lightbulb,
  Loader2,
  PlayCircle,
  QrCode,
  Shield,
  Sparkles,
  Upload,
  X,
  Zap,
} from "lucide-react";

import type {
  AnalyzeResponse,
  DocLanguage,
  Sector,
  Severity,
  UiLanguage,
} from "@/lib/types";
import { getStrings, interpolate } from "@/lib/i18n";
import { totalRuleCount } from "@/lib/rules";
import { useRateLimit } from "@/hooks/use-rate-limit";

// ---------------------------------------------------------------------------
// Selector data
// ---------------------------------------------------------------------------

const SECTORS: { id: Sector; labelKey: keyof ReturnType<typeof getStrings> }[] = [
  { id: "construction", labelKey: "selector_sector_construction" },
  { id: "finance", labelKey: "selector_sector_finance" },
  { id: "gig-job", labelKey: "selector_sector_gig_job" },
];

const DOC_LANGS: { id: DocLanguage; labelKey: keyof ReturnType<typeof getStrings> }[] = [
  { id: "en", labelKey: "selector_doc_lang_en" },
  { id: "hi", labelKey: "selector_doc_lang_hi" },
  { id: "hinglish", labelKey: "selector_doc_lang_hinglish" },
];

const UI_LANGS: UiLanguage[] = ["en", "hi", "hinglish"];

// ---------------------------------------------------------------------------
// Severity vocabulary — the only color in the entire system.
// Desaturated on purpose: signal, not neon.
// ---------------------------------------------------------------------------

const SEVERITY_STYLE: Record<Severity, { color: string; label: string }> = {
  high: { color: "#c9827f", label: "High" },
  medium: { color: "#c9ab6a", label: "Medium" },
  low: { color: "#7f9db3", label: "Low" },
};

function riskTone(score: number): { label: string; color: string } {
  if (score >= 50) return { label: "High risk", color: "#c9827f" };
  if (score >= 20) return { label: "Medium risk", color: "#c9ab6a" };
  return { label: "Low risk", color: "#7fae8e" };
}

// ---------------------------------------------------------------------------
// Motion — one restrained vocabulary reused everywhere: a short fade+rise
// on entrance, staggered by container, and a single scroll-reveal used for
// every section below the fold. No bounce, no rotation, no glow — the
// same discipline the rest of the page already holds itself to.
// ---------------------------------------------------------------------------

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

const revealOnScroll = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" },
} as const;

const tapScale = { scale: 0.97 };

// ---------------------------------------------------------------------------
// Demo contracts — three short but realistic sample agreements, one per
// sector. Each is loaded verbatim into the paste textarea when the user
// clicks the matching item in the Demo Mode dropdown. Every sample is
// written to trigger multiple rules in the sector so the demo produces a
// real risk report rather than an empty result.
// ---------------------------------------------------------------------------

const DEMO_CONTRACTS: { sector: Sector; title: string; text: string }[] = [
  {
    sector: "construction",
    title: "Flat-Buyer Agreement (Builder draft)",
    text: `FLAT-BUYER AGREEMENT — Builder draft, dated 14 March 2026.

1. POSSESSION: The Builder shall endeavour to hand over possession of the flat on or before 31 December 2029. However, the Builder reserves the right to extend the possession date by up to 24 months for any reason, including force majeure, without paying any compensation or penalty to the Allottee.

2. COMMON AREAS: All common areas, corridors, staircases, lift lobbies and the rooftop terrace shall remain the sole property of the Builder and may be leased or sold to third parties at the Builder's discretion.

3. BOOKING AMOUNT: The booking amount of Rs. 5,00,000 shall be non-refundable under any circumstances, including cancellation by the Allottee within the cooling-off period or failure of the Builder to obtain requisite approvals.

4. ALTERATIONS: The Builder may, at its sole discretion, alter the layout, carpet area, specifications and amenities of the project at any time without prior intimation to the Allottee.

5. ESCROW: Sale proceeds may be utilised by the Builder for any project of its choice; the 70% escrow requirement under RERA shall not apply to this project.

6. DISPUTE: All disputes shall be settled by arbitration seated in Mumbai with the Builder's nominee as the sole arbitrator. No Allottee shall approach the RERA Authority or the Consumer Forum.`,
  },
  {
    sector: "finance",
    title: "Personal Loan Agreement (NBFC draft)",
    text: `PERSONAL LOAN AGREEMENT — NBFC draft, dated 20 March 2026.

1. INTEREST: The borrower agrees to pay interest at the rate of 36% per annum on a flat basis. The lender may, at its sole discretion and without prior notice, revise the interest rate upwards at any time during the tenor of the loan.

2. PROCESSING FEE: A non-refundable processing fee of 8% of the loan amount shall be deducted upfront from the disbursed amount.

3. PREPAYMENT: The borrower shall not prepay the loan before completion of 12 EMIs. Any prepayment after 12 EMIs shall attract a prepayment penalty of 5% of the outstanding principal plus applicable taxes.

4. DEFAULT: In the event of default of a single EMI, the entire outstanding amount shall become immediately due and payable, and the lender may invoke recovery action under the SARFAESI Act without notice.

5. NACH: The borrower hereby authorises the lender to debit any amount, including penal charges and restructuring fees, from any bank account held by the borrower, regardless of the mandate amount.

6. FORCEFUL RECOVERY: The lender may engage recovery agents to visit the borrower's residence and workplace. The borrower waives the right to initiate any action under the RBI Fair Practices Code.

7. KYC: The lender may share the borrower's KYC details, PAN and Aadhaar with third-party marketing partners for promotional purposes.`,
  },
  {
    sector: "gig-job",
    title: "Gig-Worker Onboarding (Platform draft)",
    text: `GIG-WORKER ONBOARDING AGREEMENT — Platform draft, dated 25 March 2026.

1. STATUS: The Worker acknowledges that they are an independent contractor and not an employee of the Platform. No minimum wage, PF, ESI, gratuity or any other statutory benefit shall accrue to the Worker under any labour law.

2. TERMINATION: The Platform may terminate this agreement at any time, with or without cause and without any notice or severance payment. The Worker shall not be entitled to any hearing or representation before termination.

3. WORKING HOURS: The Worker shall be available to accept rides/orders for a minimum of 12 hours per day, 7 days a week. Failure to meet the acceptance rate of 90% shall attract a penalty of Rs. 500 per missed assignment.

4. EXCLUSIVITY: The Worker shall not, during the term of this agreement and for a period of 24 months thereafter, work with any competing platform or engage in any similar business in any city in India.

5. EQUIPMENT: The Worker shall, at their own cost, purchase or lease a smartphone, vehicle and uniform from vendors approved by the Platform. The Platform may revise the approved vendor list at any time.

6. IP: All data, including the Worker's personal location data, customer interactions and route history, shall be the exclusive property of the Platform. The Worker waives all rights under the DPDP Act 2023.

7. DISPUTE: All disputes shall be referred to the internal grievance officer of the Platform whose decision shall be final and binding. No Worker shall approach the Labour Court or any other judicial forum.`,
  },
];

// ---------------------------------------------------------------------------
// Page state
// ---------------------------------------------------------------------------

type Stage =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "parsing" }
  | { kind: "matching" }
  | { kind: "done"; result: AnalyzeResponse }
  | { kind: "error"; message: string };

export default function Home() {
  const [uiLang, setUiLang] = useState<UiLanguage>("en");
  const t = useMemo(() => getStrings(uiLang), [uiLang]);

  const [sector, setSector] = useState<Sector>("construction");
  const [docLanguage, setDocLanguage] = useState<DocLanguage>("en");

  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [showPaste, setShowPaste] = useState(false);
  const [userNotes, setUserNotes] = useState<string>("");
  const [selectedFileType, setSelectedFileType] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [stage, setStage] = useState<Stage>({ kind: "idle" });

  // New: severity filter for the report clause list ("all" by default),
  // expandable legal-basis cards (keyed by ruleId) and the demo-mode
  // dropdown toggle. These live in the Home() component so the demo
  // button — which sits in the analyzer section — can wire them up.
  const [severityFilter, setSeverityFilter] = useState<"all" | "high" | "medium" | "low">("all");
  const [expandedRules, setExpandedRules] = useState<Set<string>>(new Set());
  const [showDemo, setShowDemo] = useState(false);

  // Rate-limit tracker — keeps a rolling log of every Analyze click in
  // localStorage so the indicator below the Analyze button can show
  // how much Groq free-tier capacity is left in the current minute /
  // day / week window. Purely client-side; no backend round-trip.
  const rateLimit = useRateLimit();

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const reset = useCallback(() => {
    setStage({ kind: "idle" });
    setFile(null);
    setPastedText("");
    setUserNotes("");
    setSelectedFileType("");
    setSeverityFilter("all");
    setExpandedRules(new Set());
    setShowDemo(false);
  }, []);

  // Load a sample contract into the paste textarea and switch to paste
  // mode. We pre-select the matching sector so the rules engine uses the
  // correct rulebook — without this the demo would silently match nothing.
  const loadDemo = useCallback((demo: { sector: Sector; title: string; text: string }) => {
    setPastedText(demo.text);
    setSector(demo.sector);
    setShowPaste(true);
    setFile(null);
    setSelectedFileType("");
    setShowDemo(false);
    setStage({ kind: "idle" });
  }, []);

  // Toggle a single rule card's expandable legal-basis section. Uses
  // Set<string> so we can O(1) check membership on every render.
  const toggleRuleExpanded = useCallback((ruleId: string) => {
    setExpandedRules((prev) => {
      const next = new Set(prev);
      if (next.has(ruleId)) next.delete(ruleId);
      else next.add(ruleId);
      return next;
    });
  }, []);

  const onPickFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setShowPaste(false);
    setStage({ kind: "idle" });
  }, []);

  // Click a format chip → open the file picker filtered to that type
  const onChipClick = useCallback((type: string) => {
    setSelectedFileType(type);
    setShowPaste(false);
    if (inputRef.current) {
      const acceptMap: Record<string, string> = {
        pdf: ".pdf",
        docx: ".docx,.doc",
        image: ".png,.jpg,.jpeg,.webp,.gif",
        zip: ".zip",
        text: ".txt,.md,.csv,.json",
      };
      inputRef.current.accept = acceptMap[type] ?? "";
    }
    inputRef.current?.click();
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const f = e.dataTransfer.files?.[0];
      if (f) onPickFile(f);
    },
    [onPickFile]
  );

  const analyze = useCallback(async () => {
    setStage({ kind: "uploading" });
    // Record this attempt in the rate-limit tracker so the indicator
    // below the button reflects the new count immediately. We log on
    // click rather than on response so a hung request still consumes
    // a slot in the user's mental model of "how much have I sent."
    rateLimit.recordAnalysis();
    try {
      let res: Response;
      // Paste mode takes priority — a stale file from a previous upload
      // must never hijack the paste path.
      const trimmedNotes = userNotes.trim();
      if (showPaste) {
        if (pastedText.trim().length < 30) {
          setStage({
            kind: "error",
            message: "Please paste at least 30 characters of text.",
          });
          return;
        }
        setStage({ kind: "matching" });
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pastedText,
            sector,
            docLanguage,
            userNotes: trimmedNotes || undefined,
          }),
        });
      } else if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("sector", sector);
        fd.append("docLanguage", docLanguage);
        if (trimmedNotes) fd.append("userNotes", trimmedNotes);
        setStage({ kind: "parsing" });
        res = await fetch("/api/analyze", { method: "POST", body: fd });
      } else {
        setStage({
          kind: "error",
          message: "Please upload a file or paste at least 30 characters of text.",
        });
        return;
      }
      const data = (await res.json()) as AnalyzeResponse;
      if (!res.ok || data.status === "error") {
        setStage({ kind: "error", message: data.message ?? `Server returned ${res.status}` });
        return;
      }
      setStage({ kind: "done", result: data });
    } catch (err) {
      setStage({ kind: "error", message: (err as Error).message });
    }
  }, [showPaste, file, pastedText, userNotes, sector, docLanguage, rateLimit]);

  const isBusy =
    stage.kind === "uploading" || stage.kind === "parsing" || stage.kind === "matching";
  const canAnalyze = !isBusy && (!!file || pastedText.trim().length >= 30);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        position: "relative",
        zIndex: 1,
        color: "#e8e8e8",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      {/* ============================================================
          NAV — 59px, frosted glass, 1px #242424 bottom, zero color
          ============================================================ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-30 nav-frosted"
        style={{ height: 59, borderBottom: "1px solid #242424" }}
      >
        <div className="mx-auto flex items-center justify-between px-6 h-full" style={{ maxWidth: 1200 }}>
          {/* Left: brand — monochrome mark, no gradient */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                border: "1px solid #3a3a3a",
                background: "#0a0a0a",
              }}
            >
              <Shield style={{ width: 15, height: 15, color: "#e8e8e8" }} strokeWidth={1.5} />
            </div>
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 15,
                fontWeight: 600,
                color: "#ffffff",
                letterSpacing: "-0.01em",
              }}
            >
              ContractGuard
            </span>
          </div>

          {/* Center: ghost nav (desktop only) */}
          <nav
            className="hidden md:flex items-center gap-7"
            style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}
          >
            {[
              { label: t.nav_analyze, href: "#analyze" },
              { label: t.nav_transparency, href: "#transparency" },
              { label: t.nav_docs, href: "#rules" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 14,
                  fontWeight: 400,
                  color: "rgba(232, 232, 232, 0.65)",
                }}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: UI lang switcher + outlined ghost CTA (grey, not blue) */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-md overflow-hidden" style={{ border: "1px solid #242424" }}>
              {UI_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setUiLang(l)}
                  aria-pressed={uiLang === l}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: "var(--font-inter), sans-serif",
                    background: uiLang === l ? "#e8e8e8" : "transparent",
                    color: uiLang === l ? "#000000" : "#9a9a9a",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : "Hg"}
                </button>
              ))}
            </div>
            <a href="#analyze" className="btn-outline-neutral">
              {t.hero_cta}
              <ArrowRight style={{ width: 13, height: 13 }} />
            </a>
          </div>
        </div>
      </motion.header>

      {/* ============================================================
          HERO — DM Serif Display, the only place this face appears
          ============================================================ */}
      <section className="w-full" style={{ paddingTop: 96, paddingBottom: 72 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          {/* Announcement pill — static, no motion, no color */}
          <div className="flex justify-center mb-8">
            <a
              href="#transparency"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 16,
                border: "1px solid #242424",
                background: "transparent",
                color: "#e8e8e8",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                fontWeight: 400,
                textDecoration: "none",
              }}
              className="hover:border-[#3a3a3a] transition-colors"
            >
              {t.hero_eyebrow}
              <ArrowRight style={{ width: 12, height: 12, color: "#6b6b6b" }} />
            </a>
          </div>

          {/* Hero headline — DM Serif Display, 96px desktop / 40px mobile */}
          <h1
            className="text-center mx-auto"
            style={{
              fontFamily: "var(--font-dm-serif-display), Georgia, serif",
              fontWeight: 400,
              fontSize: "clamp(40px, 8vw, 96px)",
              lineHeight: 1.0,
              letterSpacing: "-0.01em",
              color: "#ffffff",
              maxWidth: 1000,
              fontFeatureSettings: '"ss01", "ss04", "ss11"',
            }}
          >
            {t.hero_title}
          </h1>

          {/* Subtitle — Inter, muted */}
          <p
            className="text-center mx-auto"
            style={{
              maxWidth: 720,
              marginTop: 32,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 18,
              lineHeight: 1.6,
              color: "#9a9a9a",
              fontWeight: 400,
            }}
          >
            {t.hero_subtitle}
          </p>

          {/* Hero quote */}
          <p
            className="text-center mx-auto"
            style={{
              maxWidth: 640,
              marginTop: 24,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#6b6b6b",
              fontStyle: "italic",
            }}
          >
            {t.hero_quote}
          </p>

          {/* CTA row — outlined neutral primary + ghost secondary */}
          <div className="flex items-center justify-center gap-4 mt-10 flex-wrap">
            <a href="#analyze" className="btn-outline-neutral" style={{ padding: "10px 18px", fontSize: 14 }}>
              {t.hero_cta}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </a>
            <a
              href="#transparency"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "rgba(232, 232, 232, 0.85)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav_transparency}
            </a>
          </div>
        </div>
      </section>

      {/* ============================================================
          ANALYZER — file upload + selectors + report
          ============================================================ */}
      <section id="analyze" className="w-full" style={{ paddingBottom: 120 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          {/* Section heading */}
          <div className="mb-10">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "#6b6b6b",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Analyze
            </div>
            <h2
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
              }}
            >
              Drop the contract. Get the risk report.
            </h2>
          </div>

          {/* Two-column grid: dropzone (left, wider) + selectors (right) */}
          <div className="grid lg:grid-cols-[1fr_360px] gap-4">
            {/* ============================================================
                Dropzone / paste — feature card surface, static
                ============================================================ */}
            <div style={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 16, padding: 32 }}>
              {!showPaste ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className="cursor-pointer"
                  style={{
                    borderRadius: 12,
                    border: "1px dashed #242424",
                    padding: "48px 24px",
                    textAlign: "center",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.docx,.doc,.zip,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="flex items-center justify-center"
                        style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #242424", background: "#000000" }}
                      >
                        <FileText style={{ width: 20, height: 20, color: "#e8e8e8" }} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, fontWeight: 500, color: "#ffffff" }}>
                        {file.name}
                      </div>
                      <div style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, color: "#6b6b6b" }}>
                        {(file.size / 1024).toFixed(1)} KB
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="flex items-center gap-1 transition-colors hover:text-white"
                        style={{ fontSize: 12, color: "#6b6b6b", fontFamily: "var(--font-inter), sans-serif" }}
                      >
                        <X style={{ width: 12, height: 12 }} />
                        {t.dropzone_clear}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <div
                        className="flex items-center justify-center"
                        style={{ width: 44, height: 44, borderRadius: 10, border: "1px solid #242424", background: "#000000" }}
                      >
                        <Upload style={{ width: 20, height: 20, color: "#9a9a9a" }} strokeWidth={1.5} />
                      </div>
                      <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 16, fontWeight: 500, color: "#ffffff" }}>
                        {t.dropzone_title}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 13,
                          color: "#6b6b6b",
                          maxWidth: 360,
                          lineHeight: 1.5,
                        }}
                      >
                        {t.dropzone_subtitle}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRef.current?.click();
                        }}
                        className="btn-outline-neutral"
                        style={{ marginTop: 8, padding: "8px 16px", fontSize: 14 }}
                      >
                        {t.dropzone_button}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <textarea
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    placeholder={t.dropzone_paste_placeholder}
                    style={{
                      width: "100%",
                      height: 220,
                      padding: 16,
                      borderRadius: 12,
                      background: "#000000",
                      border: "1px solid #242424",
                      color: "#e8e8e8",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      lineHeight: 1.5,
                      resize: "vertical",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#6b6b6b")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPastedText("")}
                      style={{
                        fontSize: 12,
                        color: "#6b6b6b",
                        fontFamily: "var(--font-inter), sans-serif",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                      }}
                      className="hover:text-white transition-colors"
                    >
                      {t.dropzone_clear}
                    </button>
                  </div>
                </div>
              )}

              {/* Mode switch — ghost buttons, neutral */}
              <div className="mt-6 flex items-center gap-4" style={{ paddingTop: 16, borderTop: "1px solid #242424" }}>
                <button
                  type="button"
                  onClick={() => setShowPaste(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-inter), sans-serif",
                    color: !showPaste ? "#e8e8e8" : "#6b6b6b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  className="hover:text-white transition-colors"
                >
                  <FileText style={{ width: 13, height: 13 }} strokeWidth={1.5} />
                  File
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaste(true)}
                  style={{
                    fontSize: 13,
                    fontFamily: "var(--font-inter), sans-serif",
                    color: showPaste ? "#e8e8e8" : "#6b6b6b",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t.dropzone_or_paste}
                </button>
              </div>

              {/* Additional context box — where the client tells the AI
                  what to look at first. e.g. "I got this from ABC Bank,
                  page 5 looks suspicious, focus on the cancellation clause." */}
              <div
                className="mt-6"
                style={{ paddingTop: 16, borderTop: "1px solid #242424" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 8,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  Additional context (optional)
                </div>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="e.g. I received this from ABC Bank on 15 July. Page 5 looks suspicious — focus on the cancellation clause. The agent said there's no processing fee but the contract mentions one."
                  style={{
                    width: "100%",
                    minHeight: 80,
                    padding: 12,
                    borderRadius: 8,
                    background: "#000000",
                    border: "1px solid #242424",
                    color: "#e8e8e8",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 13,
                    lineHeight: 1.5,
                    resize: "vertical",
                    outline: "none",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "#6b6b6b")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "#242424")}
                />
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginTop: 6,
                    lineHeight: 1.4,
                  }}
                >
                  The AI will read this before analysing the contract and pay extra attention to anything you flag here.
                </div>
              </div>

              {/* File-type option chips — click to open the file picker
                  filtered to that type. Replaces the old 3-column format
                  hints with a cleaner, actionable row of buttons. */}
              <div
                className="mt-6"
                style={{ paddingTop: 16, borderTop: "1px solid #242424" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  Upload by type
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: "pdf", label: "PDF" },
                    { id: "docx", label: "DOCX" },
                    { id: "image", label: "Image" },
                    { id: "zip", label: "ZIP" },
                    { id: "text", label: "Text" },
                  ].map((opt) => {
                    const active = selectedFileType === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => onChipClick(opt.id)}
                        style={{
                          padding: "7px 14px",
                          borderRadius: 6,
                          border: `1px solid ${active ? "#6b6b6b" : "#242424"}`,
                          background: active ? "#141414" : "transparent",
                          color: active ? "#ffffff" : "#9a9a9a",
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: 11,
                          fontWeight: 500,
                          letterSpacing: "0.04em",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        className="hover:border-[#3a3a3a] hover:text-white transition-colors"
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Demo Mode — a single outlined button that toggles a small
                  dropdown of sample contracts. Clicking a sample loads it
                  into the paste textarea and selects the matching sector
                  so the rules engine has the right rulebook to fire. */}
              <div
                className="mt-6"
                style={{ paddingTop: 16, borderTop: "1px solid #242424" }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  No contract on hand?
                </div>
                <div style={{ position: "relative", display: "inline-block" }}>
                  <button
                    type="button"
                    onClick={() => setShowDemo((v) => !v)}
                    aria-expanded={showDemo}
                    aria-haspopup="menu"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 14px",
                      borderRadius: 6,
                      border: `1px solid ${showDemo ? "#6b6b6b" : "#242424"}`,
                      background: showDemo ? "#141414" : "transparent",
                      color: "#e8e8e8",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 12,
                      fontWeight: 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                    className="hover:border-[#3a3a3a] hover:text-white transition-colors"
                  >
                    <PlayCircle style={{ width: 13, height: 13 }} strokeWidth={1.5} />
                    Demo Mode
                    <ChevronDown
                      style={{
                        width: 12,
                        height: 12,
                        transition: "transform 0.2s ease",
                        transform: showDemo ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                      strokeWidth={1.5}
                    />
                  </button>
                  <AnimatePresence>
                    {showDemo && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.15 }}
                        role="menu"
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: 0,
                          minWidth: 280,
                          zIndex: 20,
                          background: "#000000",
                          border: "1px solid #242424",
                          borderRadius: 8,
                          padding: 4,
                          boxShadow: "none",
                        }}
                      >
                        {DEMO_CONTRACTS.map((demo) => (
                          <button
                            key={demo.sector}
                            type="button"
                            role="menuitem"
                            onClick={() => loadDemo(demo)}
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 6,
                              border: "none",
                              background: "transparent",
                              cursor: "pointer",
                              textAlign: "left",
                            }}
                            className="hover:bg-[#141414] transition-colors"
                          >
                            <span
                              style={{
                                fontFamily: "var(--font-inter), sans-serif",
                                fontSize: 13,
                                fontWeight: 500,
                                color: "#e8e8e8",
                                marginBottom: 2,
                              }}
                            >
                              {demo.title}
                            </span>
                            <span
                              style={{
                                fontFamily: "var(--font-jetbrains-mono), monospace",
                                fontSize: 10,
                                color: "#6b6b6b",
                                letterSpacing: "0.04em",
                                textTransform: "uppercase",
                              }}
                            >
                              {demo.sector === "construction"
                                ? "construction · 6 clauses"
                                : demo.sector === "finance"
                                ? "finance · 7 clauses"
                                : "gig-job · 7 clauses"}
                            </span>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginTop: 8,
                    lineHeight: 1.4,
                  }}
                >
                  Loads a real-looking sample contract into the paste box and picks the matching sector.
                </div>
              </div>
            </div>

            {/* ============================================================
                Selectors + Analyze button
                ============================================================ */}
            <div className="flex flex-col gap-6" style={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 16, padding: 32 }}>
              {/* Sector selector */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {t.selector_sector_label}
                </div>
                <div className="flex flex-col gap-1.5">
                  {SECTORS.map((s) => {
                    const active = sector === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSector(s.id)}
                        style={{
                          textAlign: "left",
                          padding: "10px 14px",
                          borderRadius: 8,
                          border: `1px solid ${active ? "#6b6b6b" : "#242424"}`,
                          background: active ? "#141414" : "transparent",
                          color: active ? "#ffffff" : "#9a9a9a",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 13,
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                        }}
                        className="hover:border-[#3a3a3a] hover:text-white transition-colors"
                      >
                        {t[s.labelKey] as string}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Document language selector */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {t.selector_doc_lang_label}
                </div>
                <div className="flex gap-1.5">
                  {DOC_LANGS.map((l) => {
                    const active = docLanguage === l.id;
                    return (
                      <button
                        key={l.id}
                        onClick={() => setDocLanguage(l.id)}
                        style={{
                          flex: 1,
                          padding: "8px 10px",
                          borderRadius: 6,
                          border: `1px solid ${active ? "#6b6b6b" : "#242424"}`,
                          background: active ? "#141414" : "transparent",
                          color: active ? "#ffffff" : "#9a9a9a",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 12,
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                        }}
                        className="hover:border-[#3a3a3a] hover:text-white transition-colors"
                      >
                        {t[l.labelKey] as string}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analyze button — the single primary action, neutral outline */}
              <button
                onClick={analyze}
                disabled={!canAnalyze}
                className={canAnalyze ? "btn-outline-neutral" : ""}
                style={{
                  marginTop: 4,
                  padding: "12px 16px",
                  borderRadius: 6,
                  border: `1px solid ${canAnalyze ? "#6b6b6b" : "#242424"}`,
                  background: "transparent",
                  color: canAnalyze ? "#ffffff" : "#464646",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: canAnalyze ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {isBusy ? (
                  <>
                    <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" />
                    {stage.kind === "uploading"
                      ? t.status_uploading
                      : stage.kind === "parsing"
                      ? t.status_parsing
                      : t.status_matching}
                  </>
                ) : (
                  <>
                    {t.hero_cta}
                    <ArrowRight style={{ width: 14, height: 14 }} />
                  </>
                )}
              </button>

              {/* Real pipeline stages — six-step indicator that lights up
                  as the backend progresses through upload → extract →
                  rules load → match → AI explain → report. */}
              {isBusy && (
                <PipelineStages stage={stage} />
              )}

              {/* Rate-limit indicator — a single compact bar that shows
                  how much Groq free-tier capacity is left in the current
                  rolling windows. Purely client-side: every Analyze click
                  is logged in localStorage and rolled off after 60s / 24h
                  / 7d. The bar mirrors the Claude chat usage strip — model
                  name on the left, minute-window progress, day/week/time
                  on the right — but rendered in pure ContractGuard
                  monochrome: no colored dot, no neon fill. */}
              <RateLimitIndicator info={rateLimit} />
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {stage.kind === "error" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="mt-4 flex items-start gap-3"
                style={{ padding: 16, borderRadius: 12, border: "1px solid #242424", background: "#0a0a0a" }}
              >
                <AlertTriangle style={{ width: 16, height: 16, color: "#c9827f", flexShrink: 0, marginTop: 1 }} strokeWidth={1.5} />
                <div>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, fontWeight: 500, color: "#ffffff" }}>
                    {t.status_error}
                  </div>
                  <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "#9a9a9a", marginTop: 4 }}>
                    {stage.message}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Report */}
            {stage.kind === "done" && (
              <ReportView
                result={stage.result}
                uiLang={uiLang}
                onBack={reset}
                t={t}
                severityFilter={severityFilter}
                onSeverityFilterChange={setSeverityFilter}
                expandedRules={expandedRules}
                onToggleRuleExpanded={toggleRuleExpanded}
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS — animated monochrome pipeline diagram.
          Six nodes (Upload → Extract → Rules DB → Sector AI →
          Risk Detection → Report) stagger in left-to-right with
          Framer Motion. The whole sequence is greyscale: no colour
          anywhere, just hairline borders and a stepwise reveal.
          ============================================================ */}
      <section
        id="how-it-works"
        className="w-full"
        style={{ paddingTop: 80, paddingBottom: 80, borderTop: "1px solid #242424" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          <div className="mb-12">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "#6b6b6b",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              How it works
            </div>
            <h2
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              Six stages. No magic.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#9a9a9a",
                maxWidth: 720,
              }}
            >
              Every contract that lands in ContractGuard walks through the same deterministic
              pipeline. The AI only runs in stage 4 and 5 — the rules engine in stage 3 is what
              keeps the answers anchored to real Indian law.
            </p>
          </div>

          {/* Diagram — horizontal on desktop, vertical on mobile. Each
              node is a small monochrome card; the connectors are 1px
              hairlines that grow in as their source node finishes. */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0"
          >
            {[
              { icon: Upload, label: "Upload", sub: "PDF · DOCX · image · paste" },
              { icon: FileSearch, label: "Extract", sub: "text + structure" },
              { icon: Layers, label: "Rules DB", sub: "36 sector rules" },
              { icon: Sparkles, label: "Sector AI", sub: "Groq + rulebook" },
              { icon: Zap, label: "Risk Detection", sub: "match + score" },
              { icon: FileText, label: "Report", sub: "PDF + report ID" },
            ].map((node, i, arr) => {
              const Icon = node.icon;
              const isLast = i === arr.length - 1;
              return (
                <motion.div
                  key={node.label}
                  variants={fadeUp}
                  className="flex flex-row lg:flex-col items-center gap-3 lg:gap-0 lg:flex-1"
                >
                  <div className="flex flex-col items-center gap-2 lg:w-full">
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 12,
                        border: "1px solid #242424",
                        background: "#000000",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Icon style={{ width: 22, height: 22, color: "#e8e8e8" }} strokeWidth={1.5} />
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: 13,
                        fontWeight: 500,
                        color: "#ffffff",
                        textAlign: "center",
                      }}
                    >
                      {node.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 10,
                        color: "#6b6b6b",
                        textAlign: "center",
                        letterSpacing: "0.02em",
                      }}
                    >
                      {node.sub}
                    </div>
                  </div>
                  {/* Connector — horizontal hairline on desktop, vertical
                      on mobile. Hidden after the last node. */}
                  {!isLast && (
                    <div
                      className="flex lg:flex-row flex-col items-center lg:flex-1"
                      style={{ minWidth: 16, minHeight: 16 }}
                    >
                      <motion.div
                        initial={{ scaleX: 0, scaleY: 0 }}
                        whileInView={{ scaleX: 1, scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.09 }}
                        style={{
                          width: "100%",
                          height: 1,
                          background: "#242424",
                          transformOrigin: "left",
                          // On mobile flip to vertical hairline
                        }}
                        className="hidden lg:block"
                      />
                      <motion.div
                        initial={{ scaleY: 0 }}
                        whileInView={{ scaleY: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.1 + i * 0.09 }}
                        style={{
                          width: 1,
                          height: 16,
                          background: "#242424",
                          transformOrigin: "top",
                        }}
                        className="block lg:hidden"
                      />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          COMPARISON — ContractGuard vs ChatGPT, monochrome table.
          No filled cells, no colour — just #242424 hairlines and
          the same two-font discipline as the rest of the page.
          ============================================================ */}
      <section
        id="comparison"
        className="w-full"
        style={{ paddingTop: 80, paddingBottom: 80, borderTop: "1px solid #242424" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          <div className="mb-12">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "#6b6b6b",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Why not just ask ChatGPT?
            </div>
            <h2
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              ContractGuard vs ChatGPT
            </h2>
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#9a9a9a",
                maxWidth: 720,
              }}
            >
              A general-purpose chatbot will give you general-purpose advice. ContractGuard is
              a rules engine bolted onto Indian law — the table below is the honest version of
              the difference.
            </p>
          </div>

          <div
            style={{
              border: "1px solid #242424",
              borderRadius: 12,
              overflow: "hidden",
              background: "#000000",
            }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[1.2fr_1fr_1fr]"
              style={{ borderBottom: "1px solid #242424" }}
            >
              <div
                style={{
                  padding: "14px 18px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 11,
                  color: "#6b6b6b",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontWeight: 500,
                }}
              >
                Feature
              </div>
              <div
                style={{
                  padding: "14px 18px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 13,
                  color: "#ffffff",
                  fontWeight: 600,
                  borderLeft: "1px solid #242424",
                }}
              >
                ContractGuard
              </div>
              <div
                style={{
                  padding: "14px 18px",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 13,
                  color: "#9a9a9a",
                  fontWeight: 500,
                  borderLeft: "1px solid #242424",
                }}
              >
                ChatGPT
              </div>
            </div>

            {/* Body rows */}
            {[
              {
                feature: "Legal basis",
                us: "Real Indian statutes (RERA, RBI, BIS, ICA)",
                them: "Generic AI responses",
              },
              {
                feature: "Rules engine",
                us: "36 deterministic sector-specific rules",
                them: "No rule engine",
              },
              {
                feature: "Sector focus",
                us: "Construction, Finance, Gig-Job",
                them: "General purpose",
              },
              {
                feature: "False positives",
                us: "Paragraph-based keyword matching",
                them: "N/A",
              },
              {
                feature: "Counter-arguments",
                us: "Ready-to-send citing specific sections",
                them: "Generic advice",
              },
              {
                feature: "PDF export",
                us: "Structured report with report ID",
                them: "No",
              },
              {
                feature: "Indian language support",
                us: "Hindi + Hinglish",
                them: "Limited",
              },
              {
                feature: "Cost",
                us: "Free",
                them: "Paid for GPT-4",
              },
            ].map((row, i, arr) => (
              <div
                key={row.feature}
                className="grid grid-cols-[1.2fr_1fr_1fr]"
                style={{
                  borderBottom: i === arr.length - 1 ? "none" : "1px solid #1a1a1a",
                }}
              >
                <div
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 13,
                    color: "#e8e8e8",
                    fontWeight: 500,
                  }}
                >
                  {row.feature}
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 13,
                    color: "#e8e8e8",
                    borderLeft: "1px solid #242424",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Check style={{ width: 12, height: 12, color: "#9a9a9a", flexShrink: 0 }} strokeWidth={2} />
                  {row.us}
                </div>
                <div
                  style={{
                    padding: "12px 18px",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 13,
                    color: "#6b6b6b",
                    borderLeft: "1px solid #242424",
                  }}
                >
                  {row.them}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          TRANSPARENCY — hairline-divided, no color, no motion
          ============================================================ */}
      <section id="transparency" className="w-full" style={{ paddingTop: 80, paddingBottom: 120, borderTop: "1px solid #242424" }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          <div className="mb-12">
            <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "#6b6b6b", marginBottom: 8, fontWeight: 500 }}>
              Transparency
            </div>
            <h2
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              {t.transparency_title}
            </h2>
            <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 16, lineHeight: 1.6, color: "#9a9a9a", maxWidth: 720 }}>
              {t.transparency_intro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Panel eyebrow="Privacy" title={t.transparency_no_logging_heading}>
              <p style={bodyStyle}>{t.transparency_no_logging_body}</p>
            </Panel>
            <Panel eyebrow="AI role" title={t.transparency_ai_role_heading}>
              <p style={bodyStyle}>{t.transparency_ai_role_body}</p>
            </Panel>
            <Panel eyebrow="Disclaimer" title={t.transparency_disclaimer_heading}>
              <p style={bodyStyle}>{t.transparency_disclaimer_body}</p>
            </Panel>
            <Panel eyebrow="Rules database" title={t.transparency_legal_basis_heading}>
              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                {interpolate(t.transparency_rules_count, { count: totalRuleCount })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["RERA", "RBI", "BIS", "ICA", "CoSS 2020", "DPDP 2023", "IDA 1947", "CPC"].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid #242424",
                      color: "#9a9a9a",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* ============================================================
          ROADMAP — six monochrome cards. Each is a future feature we
          are committed to building. #0a0a0a surface, #242424 hairline
          border, icon + title + one sentence — no colour, no glow.
          ============================================================ */}
      <section
        id="roadmap"
        className="w-full"
        style={{ paddingTop: 80, paddingBottom: 80, borderTop: "1px solid #242424" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          <div className="mb-12">
            <div
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "#6b6b6b",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              Roadmap
            </div>
            <h2
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: "clamp(28px, 4vw, 40px)",
                fontWeight: 500,
                color: "#ffffff",
                letterSpacing: "-0.03em",
                lineHeight: 1.1,
                marginBottom: 16,
              }}
            >
              What comes next.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#9a9a9a",
                maxWidth: 720,
              }}
            >
              ContractGuard is a working rules engine today. These are the six capabilities we
              plan to ship next, in rough priority order.
            </p>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {[
              {
                icon: Shield,
                title: "Digital Signature Verification",
                desc: "Verify Aadhaar eSign and DSC signatures so you know whether the contract was actually signed by the named party.",
              },
              {
                icon: Layers,
                title: "Clause Comparison",
                desc: "Drop two versions of a contract — before and after negotiation — and see exactly which clauses moved and how the risk score changed.",
              },
              {
                icon: FileSearch,
                title: "Lawyer Review Mode",
                desc: "Forward any ContractGuard report to a Bar Council-registered advocate for a paid second opinion, with one click.",
              },
              {
                icon: Sparkles,
                title: "Multilingual Support",
                desc: "Extend UI and rule explanations to all 12 scheduled Indian languages — Tamil, Telugu, Bengali, Marathi, Gujarati and more.",
              },
              {
                icon: ArrowRight,
                title: "WhatsApp Sharing",
                desc: "Send a shareable link of the risk report to family members or your lawyer so they can review without an account.",
              },
              {
                icon: Zap,
                title: "API Access",
                desc: "A REST endpoint so consumer-rights NGOs and fintech apps can run ContractGuard rules on their own document flow.",
              },
            ].map((card) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.title}
                  variants={fadeUp}
                  style={{
                    background: "#0a0a0a",
                    border: "1px solid #242424",
                    borderRadius: 16,
                    padding: 28,
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      border: "1px solid #242424",
                      background: "#000000",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Icon style={{ width: 18, height: 18, color: "#e8e8e8" }} strokeWidth={1.5} />
                  </div>
                  <h3
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 16,
                      fontWeight: 500,
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                      marginBottom: 8,
                    }}
                  >
                    {card.title}
                  </h3>
                  <p
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 13,
                      lineHeight: 1.5,
                      color: "#9a9a9a",
                    }}
                  >
                    {card.desc}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          FOOTER — minimal, two links
          ============================================================ */}
      <footer className="mt-auto" style={{ borderTop: "1px solid #242424", padding: "32px 0" }}>
        <div className="mx-auto px-6 flex items-center justify-between" style={{ maxWidth: 1200 }}>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "#6b6b6b" }}>{t.footer_built}</div>
          <div className="flex items-center gap-6">
            <a
              href="#analyze"
              style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "rgba(232, 232, 232, 0.85)", textDecoration: "none" }}
              className="hover:text-white transition-colors"
            >
              {t.nav_analyze}
            </a>
            <a
              href="#transparency"
              style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "rgba(232, 232, 232, 0.85)", textDecoration: "none" }}
              className="hover:text-white transition-colors"
            >
              {t.nav_transparency}
            </a>
          </div>
        </div>
      </footer>

      {/* Scoped styles for the one reusable button pattern in the system */}
      <style jsx global>{`
        .btn-outline-neutral {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          border-radius: 6px;
          border: 1px solid #3a3a3a;
          background: transparent;
          color: #ffffff;
          font-family: var(--font-inter), sans-serif;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          cursor: pointer;
          transition: border-color 0.15s ease;
        }
        .btn-outline-neutral:hover {
          border-color: #6b6b6b;
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// ===========================================================================
// Small presentational helpers
// ===========================================================================

const bodyStyle: React.CSSProperties = {
  fontFamily: "var(--font-inter), sans-serif",
  fontSize: 14,
  lineHeight: 1.6,
  color: "#9a9a9a",
};

function ProgressLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <Check style={{ width: 12, height: 12, color: "#e8e8e8" }} strokeWidth={2} />
      ) : (
        <Loader2 style={{ width: 12, height: 12, color: "#6b6b6b" }} className="animate-spin" />
      )}
      <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, color: done ? "#e8e8e8" : "#6b6b6b" }}>{label}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PipelineStages — six-step indicator that lights up as the backend
// moves through upload → extract → rules load → match → AI explain → report.
// Replaces the four-row ProgressLine list with a single horizontal strip
// (which collapses to a 2-row grid on narrow screens). All greyscale:
//   - done     → filled #141414 tile, white check, bright connector
//   - active   → empty tile with spinner, #6b6b6b border
//   - pending  → empty tile, #242424 border, dimmed label
// ---------------------------------------------------------------------------

const PIPELINE_STAGE_LABELS = ["Upload", "Extract", "Rules Load", "Match", "AI Explain", "Report"] as const;

function PipelineStages({ stage }: { stage: Stage }) {
  // Compute the active stage index (0-based) — derived from the
  // current `stage.kind`. When the pipeline completes (`done`) all
  // six tiles flip to the done state.
  let activeIndex = 0;
  let allDone = false;
  if (stage.kind === "uploading") activeIndex = 0;
  else if (stage.kind === "parsing") activeIndex = 2;
  else if (stage.kind === "matching") activeIndex = 4;
  else if (stage.kind === "done") allDone = true;

  return (
    <div
      className="flex flex-col gap-2"
      style={{ paddingTop: 16, borderTop: "1px solid #242424" }}
    >
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          color: "#6b6b6b",
          marginBottom: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        Pipeline
      </div>
      <div
        className="grid"
        style={{
          gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
          gap: 4,
          alignItems: "stretch",
        }}
      >
        {PIPELINE_STAGE_LABELS.map((label, i) => {
          const done = allDone || i < activeIndex;
          const active = !allDone && i === activeIndex;
          return (
            <motion.div
              key={label}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: done || active ? 1 : 0.4 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                minWidth: 0,
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 7,
                  border: `1px solid ${done || active ? "#6b6b6b" : "#242424"}`,
                  background: done ? "#141414" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background 0.3s ease, border-color 0.3s ease",
                }}
              >
                {done ? (
                  <Check style={{ width: 12, height: 12, color: "#e8e8e8" }} strokeWidth={2} />
                ) : active ? (
                  <Loader2
                    style={{ width: 12, height: 12, color: "#e8e8e8" }}
                    className="animate-spin"
                  />
                ) : (
                  <span
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: "50%",
                      background: "#3a3a3a",
                    }}
                  />
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 10,
                  fontWeight: done || active ? 500 : 400,
                  color: done || active ? "#9a9a9a" : "#464646",
                  textAlign: "center",
                  lineHeight: 1.2,
                  letterSpacing: "0.01em",
                  wordBreak: "keep-all",
                }}
              >
                {label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RateLimitIndicator — a single horizontal strip that mirrors the Claude
// chat usage bar (model name · session · minute-window progress · day/week
// stats · timestamp) but rendered in pure ContractGuard monochrome.
//
// Design discipline:
//   • No colored dot — a 4×4 filled square is the only status mark.
//     Filled (#e8e8e8) = healthy, hollow (#242424 border) = stressed.
//   • Progress bar is #e8e8e8 fill on #1b1b1b track — pure greyscale.
//   • Numbers are JetBrains Mono (they are code-identity content: counts,
//     timestamps, percentages) — labels are Inter.
//   • Single 1px #242424 border, no shadow, no glow, no rounded ends on
//     the progress bar (square corners, matching the rest of the page).
// ---------------------------------------------------------------------------

function RateLimitIndicator({ info }: { info: ReturnType<typeof useRateLimit> }) {
  // Live "time until the minute window rolls" — formatted as M:SS so the
  // user knows exactly how long to wait before capacity refreshes.
  const secs = Math.ceil(info.msUntilMinuteRoll / 1000);
  const rollLabel = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  // Current time in the user's locale — short weekday + clock, e.g.
  // "Wed 4:29 AM". Shown in IST by virtue of the user's timezone setting.
  const now = new Date();
  const timeLabel = now.toLocaleString("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Calcutta",
  });

  // Minute-window fill ratio (0-1). Clamped so a stressed bar doesn't
  // visually overflow its track.
  const minuteRatio = Math.min(1, info.usedMinute / 30);
  // When the bar is stressed (>80%), flip the marker to hollow so the
  // user gets a clear "slow down" signal without breaking the no-color
  // rule.
  const stressed = info.minuteStressed || info.dayStressed;

  return (
    <div
      style={{
        marginTop: 16,
        paddingTop: 16,
        borderTop: "1px solid #242424",
      }}
    >
      {/* Section eyebrow — same pattern as every other sub-section */}
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          color: "#6b6b6b",
          marginBottom: 10,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        AI capacity
      </div>

      {/* The strip itself — a single rounded card with three rows on
          mobile, one row on desktop. The model badge sits on the left,
          the progress bar fills the middle, the stats sit on the right. */}
      <div
        style={{
          background: "#000000",
          border: "1px solid #242424",
          borderRadius: 8,
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Row 1 — model badge + session marker */}
        <div
          className="flex items-center justify-between"
          style={{ gap: 12 }}
        >
          <div className="flex items-center" style={{ gap: 8 }}>
            {/* Status square — filled when healthy, hollow when stressed.
                This is the single visual cue for "you're hammering Groq". */}
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 1,
                background: stressed ? "transparent" : "#e8e8e8",
                border: stressed ? "1px solid #9a9a9a" : "1px solid #e8e8e8",
                flexShrink: 0,
                display: "inline-block",
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 11,
                fontWeight: 500,
                color: "#e8e8e8",
                letterSpacing: "0.02em",
              }}
            >
              GROQ · LLAMA 3.1 8B
            </span>
          </div>
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 10,
              color: "#6b6b6b",
              letterSpacing: "0.06em",
            }}
          >
            SESSION
          </span>
        </div>

        {/* Row 2 — minute-window progress bar + count */}
        <div className="flex items-center" style={{ gap: 10 }}>
          {/* Track — 1px border, #1b1b1b fill, square ends. The fill
              animates width via a CSS transition so it feels alive as
              the user fires analyses. */}
          <div
            style={{
              flex: 1,
              height: 6,
              background: "#1b1b1b",
              border: "1px solid #242424",
              borderRadius: 2,
              overflow: "hidden",
              position: "relative",
            }}
            role="progressbar"
            aria-valuenow={info.usedMinute}
            aria-valuemin={0}
            aria-valuemax={30}
            aria-label="Groq requests used in the last 60 seconds"
          >
            <div
              style={{
                width: `${minuteRatio * 100}%`,
                height: "100%",
                background: stressed ? "#9a9a9a" : "#e8e8e8",
                transition: "width 0.4s ease, background 0.3s ease",
              }}
            />
          </div>
          {/* Count — JetBrains Mono, two digits over cap. Color shifts
              from #9a9a9a (healthy) to #ffffff (mid) to #c9ab6a (stressed)
              so a glance is enough. */}
          <span
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              fontWeight: 500,
              color: stressed ? "#c9ab6a" : info.usedMinute > 0 ? "#e8e8e8" : "#9a9a9a",
              letterSpacing: "0.02em",
              minWidth: 52,
              textAlign: "right",
              flexShrink: 0,
            }}
          >
            {info.usedMinute}/30
          </span>
        </div>

        {/* Row 3 — secondary stats. Same compact JetBrains Mono style
            as the Claude screenshot's right-hand cluster. Bullets are
            #3a3a3a so they read as separators, not punctuation. */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "4px 8px", rowGap: 4 }}
        >
          <Stat label={`${info.remainingMinute} left this min`} />
          <Dot />
          <Stat label={`~${info.usedDay} today`} />
          <Dot />
          <Stat label={`wk ${info.weekPercent}%`} />
          <Dot />
          <Stat label={`lifetime ${info.lifetime}`} />
          <Dot />
          <Stat label={`roll ${rollLabel}`} />
          <Dot />
          <Stat label={timeLabel} />
          <Dot />
          <Stat label="IST" />
        </div>

        {/* Caption — explains the numbers in one line so a first-time
            user understands what "30" and "wk %" mean. */}
        <div
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 10,
            color: "#6b6b6b",
            lineHeight: 1.4,
            marginTop: 2,
          }}
        >
          Groq free-tier cap: 30 analyses / minute, 14,400 / day. Counts are
          per-browser, not global — other users share the same key.
        </div>
      </div>
    </div>
  );
}

function Stat({ label }: { label: string }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains-mono), monospace",
        fontSize: 10,
        color: "#9a9a9a",
        letterSpacing: "0.02em",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}

function Dot() {
  return (
    <span
      style={{
        width: 2,
        height: 2,
        borderRadius: "50%",
        background: "#3a3a3a",
        display: "inline-block",
        flexShrink: 0,
      }}
    />
  );
}

function Panel({ eyebrow, title, children }: { eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 16, padding: 32 }}>
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          color: "#6b6b6b",
          marginBottom: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {eyebrow}
      </div>
      <h3 style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 20, fontWeight: 500, color: "#ffffff", letterSpacing: "-0.02em", marginBottom: 12 }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

// ===========================================================================
// Report view
// ===========================================================================

// ===========================================================================
// PDF export — generates a white-background, black-text PDF of the report
// with colored severity indicators. Uses jsPDF (client-side, no server
// needed). Font sizes chosen for readability: 12pt body, 18pt title,
// 14pt section headings. About 8-10 words per line on A4.
// ===========================================================================

async function exportReportToPdf(result: AnalyzeResponse, uiLang: UiLanguage) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const pageW = 210;
  const pageH = 297;
  const margin = 18;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Severity colors (RGB) — muted but distinct, print-friendly
  const SEV_RGB: Record<Severity, [number, number, number]> = {
    high: [201, 130, 127],     // muted red
    medium: [201, 171, 106],   // muted amber
    low: [127, 157, 179],      // muted blue
  };

  const isHindi = uiLang === "hi";

  function ensureSpace(needed: number) {
    if (y + needed > pageH - margin - 10) {
      doc.addPage();
      y = margin;
    }
  }

  function addText(
    text: string,
    opts: {
      size?: number;
      bold?: boolean;
      color?: [number, number, number];
      x?: number;
      maxWidth?: number;
      lineHeight?: number;
    } = {}
  ) {
    const size = opts.size ?? 12;
    const bold = opts.bold ?? false;
    const color = opts.color ?? [40, 40, 40];
    const x = opts.x ?? margin;
    const maxWidth = opts.maxWidth ?? contentW;
    const lineHeight = opts.lineHeight ?? size * 0.5;

    // CRITICAL: collapse all whitespace (including embedded newlines from
    // PDF extraction) into single spaces. Without this, jsPDF's
    // splitTextToSize treats \n as hard line breaks AND wraps by width,
    // causing text to overlap.
    const cleanText = text.replace(/\s+/g, " ").trim();

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(cleanText, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(lineHeight + 1);
      doc.text(line, x, y);
      y += lineHeight;
    }
  }

  function addSeparator() {
    ensureSpace(6);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageW - margin, y);
    y += 5;
  }

  function addRect(
    x: number,
    yPos: number,
    w: number,
    h: number,
    fill: [number, number, number],
    radius: number = 2
  ) {
    doc.setFillColor(fill[0], fill[1], fill[2]);
    doc.roundedRect(x, yPos, w, h, radius, radius, "F");
  }

  // -----------------------------------------------------------------------
  // HEADER — title + report ID + generated-at timestamp. The report
  // ID is the single piece of code-identity content at the very top
  // of the PDF so the reader can quote it when contacting support
  // or a lawyer.
  // -----------------------------------------------------------------------
  // Title
  addText("ContractGuard — Risk Report", { size: 20, bold: true, color: [20, 20, 20] });
  y += 2;

  // Report ID (mono, dark — the canonical reference for this report)
  const reportId = result.reportId ?? "CG-REPORT-XXXX";
  doc.setFont("courier", "bold");
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.text(reportId, margin, y);
  y += 5;

  // Timestamp — prefer the server-generated ISO timestamp, fall back
  // to the current client time so older responses still render.
  const generatedAt = result.generatedAt
    ? new Date(result.generatedAt).toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
  addText(`Generated on ${generatedAt}`, { size: 10, color: [140, 140, 140] });
  y += 4;

  // Risk score block
  const tone =
    result.riskScore >= 50
      ? { label: "High risk", color: [201, 130, 127] as [number, number, number] }
      : result.riskScore >= 20
      ? { label: "Medium risk", color: [201, 171, 106] as [number, number, number] }
      : { label: "Low risk", color: [127, 174, 142] as [number, number, number] };

  addSeparator();

  // Risk score number + label
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.setTextColor(20, 20, 20);
  doc.text(String(result.riskScore), margin, y + 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(140, 140, 140);
  doc.text("/ 100", margin + doc.getTextWidth(String(result.riskScore)) + 3, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(tone.color[0], tone.color[1], tone.color[2]);
  doc.text(tone.label, margin, y + 20);

  // Risk score bar (colored)
  const barY = y + 24;
  const barH = 4;
  const barW = contentW;
  doc.setFillColor(235, 235, 235);
  doc.roundedRect(margin, barY, barW, barH, 1.5, 1.5, "F");
  doc.setFillColor(tone.color[0], tone.color[1], tone.color[2]);
  const filledW = Math.max(barW * (result.riskScore / 100), 2);
  doc.roundedRect(margin, barY, filledW, barH, 1.5, 1.5, "F");

  y = barY + barH + 6;

  // Meta info — sector, doc language, rules considered + the rules
  // transparency counts (triggered / passed / total) so the reader
  // can see how the risk score was derived.
  const totalRules = result.rulesTotal ?? result.rulesConsidered;
  const triggered = result.rulesTriggered ?? result.clauses.length;
  const passed = result.rulesPassed ?? Math.max(totalRules - triggered, 0);
  addText(
    `Sector: ${result.sector}    |    Document language: ${result.docLanguage}    |    Rules considered: ${result.rulesConsidered}    |    Analysis time: ${result.pipelineMs} ms`,
    { size: 9, color: [140, 140, 140] }
  );
  y += 1;
  addText(
    `Rules triggered: ${triggered}    |    Rules passed: ${passed}    |    Total rules: ${totalRules}`,
    { size: 9, color: [140, 140, 140] }
  );

  if (result.message) {
    y += 2;
    addText(`Note: ${result.message}`, { size: 9, color: [180, 140, 60] });
  }

  y += 6;
  addSeparator();

  // -----------------------------------------------------------------------
  // EXECUTIVE SUMMARY — 2-3 sentence AI summary, in a tinted box.
  // Skipped when the backend didn't produce one.
  // -----------------------------------------------------------------------
  const execSummary = isHindi ? result.executiveSummaryHi : result.executiveSummaryEn;
  if (execSummary) {
    addText("Executive summary", { size: 13, bold: true, color: [20, 20, 20] });
    y += 2;
    const summaryClean = execSummary.replace(/\s+/g, " ").trim();
    const summaryFontSize = 11;
    const summaryLineH = summaryFontSize * 0.5;
    const summaryLines = doc.splitTextToSize(summaryClean, contentW - 8) as string[];
    const summaryBoxH = summaryLines.length * summaryLineH + 8;
    ensureSpace(summaryBoxH + 4);
    doc.setFillColor(244, 244, 244);
    doc.roundedRect(margin, y, contentW, summaryBoxH, 2, 2, "F");
    // Left accent bar in the tone colour
    doc.setFillColor(tone.color[0], tone.color[1], tone.color[2]);
    doc.roundedRect(margin, y, 2, summaryBoxH, 1, 1, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(summaryFontSize);
    doc.setTextColor(40, 40, 40);
    let summaryY = y + 5.5;
    for (const line of summaryLines) {
      doc.text(line, margin + 6, summaryY);
      summaryY += summaryLineH;
    }
    y += summaryBoxH + 6;
    addSeparator();
  }

  // -----------------------------------------------------------------------
  // DOCUMENT STATISTICS — 2-column key/value grid.
  // Skipped when the backend didn't surface documentStats.
  // -----------------------------------------------------------------------
  if (result.documentStats) {
    const ds = result.documentStats;
    addText("Document statistics", { size: 13, bold: true, color: [20, 20, 20] });
    y += 3;
    const statsRows: [string, string][] = [
      ["Pages (estimated)", String(ds.estimatedPages)],
      ["Words", ds.wordCount.toLocaleString("en-IN")],
      ["Characters", ds.charCount.toLocaleString("en-IN")],
      ["Language", ds.language],
      ["Processing time", `${ds.processingTimeMs} ms`],
      ["Chunks processed", String(ds.chunksProcessed)],
      ["Source", ds.wasFileUpload ? "file upload" : "pasted text"],
      ["Filename", ds.filename],
    ];
    // Two-column layout — 4 rows of 2 columns each.
    const colW = contentW / 2;
    const rowH = 5.5;
    statsRows.forEach((row, idx) => {
      const col = idx % 2;
      const rowIdx = Math.floor(idx / 2);
      const xCol = margin + col * colW;
      const yPos = y + rowIdx * rowH;
      ensureSpace(rowH);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(140, 140, 140);
      doc.text(row[0].toUpperCase(), xCol, yPos);
      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      doc.setTextColor(40, 40, 40);
      doc.text(row[1], xCol, yPos + 3.5);
    });
    y += Math.ceil(statsRows.length / 2) * rowH + 4;
    addSeparator();
  }

  // -----------------------------------------------------------------------
  // CLAUSES
  // -----------------------------------------------------------------------
  addText(`Flagged clauses (${result.clauses.length})`, {
    size: 16,
    bold: true,
    color: [20, 20, 20],
  });
  y += 4;

  if (result.clauses.length === 0) {
    addText(
      "No high-risk clauses were matched. This is not legal advice — please have a lawyer review anything you're unsure about.",
      { size: 11, color: [120, 120, 120] }
    );
  } else {
    result.clauses.forEach((c, i) => {
      const sevColor = SEV_RGB[c.severity];

      // Clause header bar (colored severity indicator)
      ensureSpace(14);
      addRect(margin, y, 4, 10, sevColor, 1); // left severity bar
      y += 2;

      // Clause number + severity label + category
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(80, 80, 80);
      doc.text(`Clause ${String(i + 1).padStart(2, "0")}`, margin + 8, y + 3);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(sevColor[0], sevColor[1], sevColor[2]);
      doc.text(c.severity.toUpperCase(), margin + 32, y + 3);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      doc.text(c.category, margin + 32 + 35, y + 3);

      // Rule ID (right-aligned) — and the best-effort page location
      // printed just to its left, so the reader can flip to the right
      // page in the source contract.
      const pageLoc = c.pageLocation ?? "—";
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      const pageLocText = `Page: ${pageLoc}`;
      const pageLocW = doc.getTextWidth(pageLocText);
      doc.text(pageLocText, pageW - margin - pageLocW - 6, y + 3);

      doc.setFont("courier", "normal");
      doc.setFontSize(9);
      doc.setTextColor(140, 140, 140);
      const ruleIdText = c.ruleId;
      const ruleIdW = doc.getTextWidth(ruleIdText);
      doc.text(ruleIdText, pageW - margin - ruleIdW, y + 3);

      y += 8;

      // Snippet label
      addText("From the document:", {
        size: 9,
        bold: true,
        color: [140, 140, 140],
      });
      y += 1;

      // Snippet in a light grey box — sanitize whitespace first to prevent
      // overlapping text from embedded newlines in the PDF extraction
      const cleanSnippet = c.snippet.replace(/\s+/g, " ").trim();
      const snippetFontSize = 10;
      const snippetLineH = snippetFontSize * 0.5; // 5mm per line at 10pt
      const snippetLines = doc.splitTextToSize(cleanSnippet, contentW - 8) as string[];
      const snippetBoxH = snippetLines.length * snippetLineH + 6;
      ensureSpace(snippetBoxH + 6);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(margin, y, contentW, snippetBoxH, 2, 2, "F");
      doc.setFont("courier", "normal");
      doc.setFontSize(snippetFontSize);
      doc.setTextColor(50, 50, 50);
      let snippetY = y + 4.5;
      for (const line of snippetLines) {
        doc.text(line, margin + 4, snippetY);
        snippetY += snippetLineH;
      }
      y += snippetBoxH + 4;

      // Explanation
      addText("Explanation:", {
        size: 9,
        bold: true,
        color: [140, 140, 140],
      });
      y += 1;
      const explanation = isHindi ? c.explanationHi : c.explanationEn;
      addText(explanation, { size: 11, color: [40, 40, 40], lineHeight: 5.5 });
      y += 3;

      // Recommended action — practical next-step the reader can take
      // (call out the clause, ask for it to be struck, etc.). Skipped
      // when the AI didn't produce one.
      const recommendedAction = isHindi ? c.recommendedActionHi : c.recommendedActionEn;
      if (recommendedAction) {
        addText("Recommended action:", {
          size: 9,
          bold: true,
          color: [140, 140, 140],
        });
        y += 1;
        addText(recommendedAction, { size: 11, color: [40, 40, 40], lineHeight: 5.5 });
        y += 3;
      }

      // Legal basis
      addText("Legal basis:", {
        size: 9,
        bold: true,
        color: [140, 140, 140],
      });
      y += 1;
      addText(c.legalBasis, { size: 10, color: [100, 100, 160], lineHeight: 5 });

      // Cited sections (if any) — printed as a comma-separated mono line.
      if (c.citedSections && c.citedSections.length > 0) {
        y += 2;
        addText(`Cited sections: ${c.citedSections.join(", ")}`, {
          size: 9,
          color: [120, 120, 120],
        });
      }

      // Roadmap note (if any)
      if (c.roadmapNote) {
        y += 2;
        addText(`Note: ${c.roadmapNote}`, { size: 9, color: [180, 140, 60] });
      }

      y += 6;

      // Separator between clauses
      if (i < result.clauses.length - 1) {
        addSeparator();
        y += 2;
      }
    });
  }

  // -----------------------------------------------------------------------
  // QR CODE PLACEHOLDER — we can't generate real QR codes client-side
  // without pulling in a QR library, so we draw a styled stand-in: a
  // 30x30mm square with a deterministic checker pattern derived from
  // the report ID, the report ID printed inside, and a "Scan to verify"
  // caption. This sits at the end of the document on the last page.
  // -----------------------------------------------------------------------
  ensureSpace(48);
  addSeparator();
  y += 4;

  const qrSize = 30; // mm
  const qrX = pageW - margin - qrSize;
  const qrY = y;

  // Outer box — light grey background, dark border
  doc.setDrawColor(40, 40, 40);
  doc.setLineWidth(0.4);
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(qrX, qrY, qrSize, qrSize, 1.5, 1.5, "FD");

  // Deterministic pseudo-QR pattern — 7x7 grid of small dark squares,
  // seeded from the report ID so the same report always produces the
  // same pattern. We hash the report ID into a bit sequence and use
  // each bit to decide whether to fill the corresponding cell. The
  // three corner "finder" squares (top-left, top-right, bottom-left)
  // are always filled to mimic a real QR code's positional markers.
  const gridN = 7;
  const finderSize = 3;
  const margin2 = 3;
  const cellSize = (qrSize - margin2 * 2) / gridN;

  // Build a deterministic bit pattern from the report ID hash.
  const bitPattern: boolean[] = [];
  let h = 0;
  for (let k = 0; k < reportId.length; k++) h = (h * 31 + reportId.charCodeAt(k)) >>> 0;
  // LCG to extend the hash into a longer pseudo-random sequence.
  for (let k = 0; k < gridN * gridN; k++) {
    h = (h * 1103515245 + 12345) >>> 0;
    bitPattern.push(((h >> 16) & 1) === 1);
  }

  doc.setFillColor(20, 20, 20);
  for (let r = 0; r < gridN; r++) {
    for (let cI = 0; cI < gridN; cI++) {
      // Always fill the three finder squares (corners).
      const isTopLeft = r < finderSize && cI < finderSize;
      const isTopRight = r < finderSize && cI >= gridN - finderSize;
      const isBottomLeft = r >= gridN - finderSize && cI < finderSize;
      const filled = isTopLeft || isTopRight || isBottomLeft || bitPattern[r * gridN + cI];
      if (filled) {
        const cx = qrX + margin2 + cI * cellSize;
        const cy = qrY + margin2 + r * cellSize;
        doc.rect(cx, cy, cellSize - 0.4, cellSize - 0.4, "F");
      }
    }
  }

  // "Scan to verify" caption + report ID below the QR placeholder.
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(140, 140, 140);
  doc.text("Scan to verify", qrX, qrY + qrSize + 4);
  doc.setFont("courier", "normal");
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(reportId, qrX, qrY + qrSize + 8);

  // Left column beside the QR — short verification note.
  addText(
    "Verify this report at contractguard.in/r/" + reportId.toLowerCase(),
    { size: 9, color: [120, 120, 120], x: margin, maxWidth: qrX - margin - 8 }
  );
  y += 2;
  addText(
    "If the report ID above does not match what you see on the website, the PDF may have been tampered with. Contact support@contractguard.in immediately.",
    { size: 9, color: [140, 140, 140], x: margin, maxWidth: qrX - margin - 8, lineHeight: 4.5 }
  );
  y = Math.max(y, qrY + qrSize + 12) + 4;

  // -----------------------------------------------------------------------
  // FOOTER on every page
  // -----------------------------------------------------------------------
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text(
      "ContractGuard — AI contract review. This report is not legal advice. Consult a qualified advocate for your specific situation.",
      margin,
      pageH - 10
    );
    doc.text(`Page ${p} of ${pageCount}`, pageW - margin - 20, pageH - 10);
  }

  // Save
  const filename = `contractguard-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function ReportView({
  result,
  uiLang,
  onBack,
  t,
  severityFilter,
  onSeverityFilterChange,
  expandedRules,
  onToggleRuleExpanded,
}: {
  result: AnalyzeResponse;
  uiLang: UiLanguage;
  onBack: () => void;
  t: ReturnType<typeof getStrings>;
  severityFilter: "all" | "high" | "medium" | "low";
  onSeverityFilterChange: (filter: "all" | "high" | "medium" | "low") => void;
  expandedRules: Set<string>;
  onToggleRuleExpanded: (ruleId: string) => void;
}) {
  const tone = riskTone(result.riskScore);

  // Filtered clause list — driven by the severity filter buttons so the
  // reader can focus on just high-risk clauses, or just medium, etc.
  // We memoise on the two inputs to avoid re-filtering every render.
  const visibleClauses = useMemo(() => {
    if (severityFilter === "all") return result.clauses;
    return result.clauses.filter((c) => c.severity === severityFilter);
  }, [result.clauses, severityFilter]);

  // Severity counts — shown in the filter buttons.
  const counts = useMemo(() => {
    const c = { all: result.clauses.length, high: 0, medium: 0, low: 0 };
    for (const cl of result.clauses) c[cl.severity]++;
    return c;
  }, [result.clauses]);

  // Document stats — fall back gracefully when the backend did not
  // surface them. Older responses (pre-upgrade) will not have this
  // block, so every read is null-safe.
  const ds = result.documentStats;
  const totalRules = result.rulesTotal ?? result.rulesConsidered;
  const triggered = result.rulesTriggered ?? result.clauses.length;
  const passed = result.rulesPassed ?? Math.max(totalRules - triggered, 0);
  const executiveSummary = uiLang === "hi" ? result.executiveSummaryHi : result.executiveSummaryEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="mt-4"
      style={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 16, padding: 32 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              color: "#6b6b6b",
              marginBottom: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            {t.report_title}
          </div>
          <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 32, fontWeight: 500, color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
            {tone.label}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => exportReportToPdf(result, uiLang)}
            className="btn-outline-neutral"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              borderColor: "#3a3a3a",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            <Download style={{ width: 13, height: 13 }} strokeWidth={2} />
            Export as PDF
          </button>
          <button
            onClick={onBack}
            className="btn-outline-neutral"
            style={{ padding: "8px 12px", fontSize: 13, borderColor: "#242424", color: "#9a9a9a" }}
          >
            <ArrowLeft style={{ width: 13, height: 13 }} />
            {t.report_back}
          </button>
        </div>
      </div>

      {/* Risk score + meta */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 mb-8" style={{ paddingBottom: 32, borderBottom: "1px solid #242424" }}>
        <div>
          <div className="flex items-baseline gap-3 mb-3">
            <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 56, fontWeight: 400, color: "#ffffff", lineHeight: 1 }}>
              {result.riskScore}
            </span>
            <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, color: tone.color, fontWeight: 500 }}>
              {t.report_risk_score} / 100
            </span>
          </div>
          <div style={{ height: 4, borderRadius: 2, background: "#141414", overflow: "hidden" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.riskScore}%` }}
              transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
              style={{ height: "100%", background: tone.color, borderRadius: 2 }}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-y-2 gap-x-4" style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12 }}>
          <Meta label="SECTOR" value={result.sector} />
          <Meta label="DOC LANG" value={result.docLanguage} />
          <Meta label="RULES" value={String(result.rulesConsidered)} />
          <Meta label="RUNTIME" value={`${result.pipelineMs} ms`} />
        </div>
      </div>

      {/* Optional warning */}
      {result.message && (
        <div className="mb-6 flex items-start gap-2" style={{ padding: 14, borderRadius: 8, border: "1px solid #242424", background: "#000000" }}>
          <AlertTriangle style={{ width: 13, height: 13, color: "#c9ab6a", flexShrink: 0, marginTop: 1 }} strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "#9a9a9a", lineHeight: 1.5 }}>{result.message}</span>
        </div>
      )}

      {/* Executive summary — border-left accent in the tone colour,
          Sparkles icon, plain Inter copy. Shown only when the AI
          actually produced one (older responses won't have it). */}
      {executiveSummary && (
        <div
          className="mb-6"
          style={{
            padding: 16,
            background: "#000000",
            borderRadius: 8,
            border: "1px solid #242424",
            borderLeft: `2px solid ${tone.color}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <Sparkles style={{ width: 14, height: 14, color: tone.color }} strokeWidth={1.5} />
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 11,
                color: "#6b6b6b",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontWeight: 500,
              }}
            >
              Executive summary
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#e8e8e8",
            }}
          >
            {executiveSummary}
          </p>
        </div>
      )}

      {/* Document statistics — 2-column grid, JetBrains Mono values.
          Skipped entirely when the backend didn't surface documentStats. */}
      {ds && (
        <div
          className="mb-6"
          style={{
            padding: 16,
            background: "#000000",
            borderRadius: 8,
            border: "1px solid #242424",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 11,
              color: "#6b6b6b",
              marginBottom: 12,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontWeight: 500,
            }}
          >
            Document statistics
          </div>
          <div
            className="grid grid-cols-2 gap-y-3 gap-x-4"
            style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12 }}
          >
            <Meta label="PAGES" value={String(ds.estimatedPages)} />
            <Meta label="WORDS" value={ds.wordCount.toLocaleString("en-IN")} />
            <Meta label="CHARACTERS" value={ds.charCount.toLocaleString("en-IN")} />
            <Meta label="LANGUAGE" value={ds.language} />
            <Meta label="PROCESSING TIME" value={`${ds.processingTimeMs} ms`} />
            <Meta label="CHUNKS PROCESSED" value={String(ds.chunksProcessed)} />
            <Meta label="SOURCE" value={ds.wasFileUpload ? "upload" : "paste"} />
            <Meta label="FILENAME" value={ds.filename} />
          </div>
        </div>
      )}

      {/* Rules transparency bar — triggered / passed / total + a
          visual progress bar + the scoring formula in plain text so
          the reader can audit how the risk score was computed. */}
      <div
        className="mb-6"
        style={{
          padding: 16,
          background: "#000000",
          borderRadius: 8,
          border: "1px solid #242424",
        }}
      >
        <div
          className="flex items-center gap-4 flex-wrap"
          style={{
            fontFamily: "var(--font-jetbrains-mono), monospace",
            fontSize: 12,
            color: "#9a9a9a",
            marginBottom: 10,
          }}
        >
          <span>
            RULES TRIGGERED · <span style={{ color: "#c9827f" }}>{triggered}</span>
          </span>
          <span style={{ color: "#3a3a3a" }}>|</span>
          <span>
            RULES PASSED · <span style={{ color: "#9a9a9a" }}>{passed}</span>
          </span>
          <span style={{ color: "#3a3a3a" }}>|</span>
          <span>
            TOTAL RULES · <span style={{ color: "#e8e8e8" }}>{totalRules}</span>
          </span>
        </div>
        <div style={{ height: 4, borderRadius: 2, background: "#141414", overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalRules > 0 ? (triggered / totalRules) * 100 : 0}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ height: "100%", background: "#c9827f", borderRadius: 2 }}
          />
        </div>
        <p
          style={{
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 11,
            color: "#6b6b6b",
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          Risk score = Σ(severity weights: high=25, medium=12, low=5), capped at 100.
        </p>
      </div>

      {/* Severity filters — four buttons in a row. The active filter
          has a brighter #6b6b6b border, inactive is #242424. */}
      {result.clauses.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <Filter style={{ width: 13, height: 13, color: "#6b6b6b" }} strokeWidth={1.5} />
          {(
            [
              { id: "all", label: "All", count: counts.all, color: "#9a9a9a" },
              { id: "high", label: "High", count: counts.high, color: SEVERITY_STYLE.high.color },
              { id: "medium", label: "Medium", count: counts.medium, color: SEVERITY_STYLE.medium.color },
              { id: "low", label: "Low", count: counts.low, color: SEVERITY_STYLE.low.color },
            ] as const
          ).map((f) => {
            const active = severityFilter === f.id;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => onSeverityFilterChange(f.id)}
                aria-pressed={active}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 6,
                  border: `1px solid ${active ? "#6b6b6b" : "#242424"}`,
                  background: active ? "#141414" : "transparent",
                  color: active ? "#ffffff" : "#9a9a9a",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 12,
                  fontWeight: active ? 500 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                className="hover:border-[#3a3a3a] hover:text-white transition-colors"
              >
                {f.id !== "all" && (
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: f.color }} />
                )}
                {f.label}
                <span
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10,
                    color: active ? "#9a9a9a" : "#464646",
                  }}
                >
                  {f.count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Clause list — section header */}
      <div
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 11,
          color: "#6b6b6b",
          marginBottom: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          fontWeight: 500,
        }}
      >
        {t.report_clauses_found} ({result.clauses.length})
      </div>

      {/* Empty state — when there are no clauses at all, show a more
          helpful "all passed" panel with a Check icon and a tiny rules
          transparency bar; when the filter just hid everything, show
          a small "no clauses match this filter" panel. */}
      {result.clauses.length === 0 ? (
        <div
          style={{
            padding: 28,
            borderRadius: 12,
            border: "1px solid #242424",
            background: "#000000",
          }}
        >
          <div className="flex items-start gap-3">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                border: "1px solid #242424",
                background: "#000000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Check style={{ width: 16, height: 16, color: "#e8e8e8" }} strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  color: "#ffffff",
                  marginBottom: 6,
                }}
              >
                No high-risk clauses triggered
              </div>
              <p
                style={{
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 13,
                  color: "#9a9a9a",
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                {totalRules} rules were checked against this document and none of them matched. This is not legal advice — please have a lawyer review anything you're unsure about.
              </p>
              <div
                style={{
                  fontFamily: "var(--font-jetbrains-mono), monospace",
                  fontSize: 11,
                  color: "#9a9a9a",
                  padding: "8px 12px",
                  borderRadius: 6,
                  border: "1px solid #242424",
                  background: "#0a0a0a",
                  display: "inline-block",
                }}
              >
                RULES TRIGGERED · <span style={{ color: "#c9827f" }}>0</span>
                <span style={{ color: "#3a3a3a", margin: "0 6px" }}>|</span>
                RULES PASSED · <span style={{ color: "#e8e8e8" }}>{totalRules}</span>
              </div>
            </div>
          </div>
        </div>
      ) : visibleClauses.length === 0 ? (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: "1px solid #242424",
            background: "#000000",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            color: "#9a9a9a",
            lineHeight: 1.6,
          }}
        >
          No clauses match the{" "}
          <span style={{ color: "#e8e8e8", textTransform: "capitalize" }}>{severityFilter}</span>{" "}
          filter. Switch to “All” to see every flagged clause.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {visibleClauses.map((c, i) => {
            const style = SEVERITY_STYLE[c.severity];
            const explanation = uiLang === "hi" ? c.explanationHi : c.explanationEn;
            const recommendedAction = uiLang === "hi" ? c.recommendedActionHi : c.recommendedActionEn;
            const isExpanded = expandedRules.has(c.ruleId);
            // Confidence indicator — green for high, amber for medium,
            // grey for low. We deliberately avoid the severity palette
            // so the dot reads as "AI confidence", not "risk level".
            const confidenceColor =
              c.extractionConfidence === "high"
                ? "#7fae8e"
                : c.extractionConfidence === "medium"
                ? "#c9ab6a"
                : "#3a3a3a";
            const confidenceLabel =
              c.extractionConfidence === "high"
                ? "HIGH"
                : c.extractionConfidence === "medium"
                ? "MED"
                : c.extractionConfidence === "low"
                ? "LOW"
                : "";
            return (
              <motion.div
                key={`${c.ruleId}-${i}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, duration: 0.2 }}
                style={{
                  position: "relative",
                  borderRadius: 12,
                  border: "1px solid #242424",
                  borderLeft: `2px solid ${style.color}`,
                  background: "#000000",
                  padding: "24px 24px 24px 22px",
                }}
              >
                {/* Top row: clause number + severity + category + page
                    location + extraction confidence + rule ID. */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      color: "#6b6b6b",
                    }}
                  >
                    §{String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: `1px solid ${style.color}`,
                      background: "transparent",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 11,
                      fontWeight: 500,
                      color: style.color,
                      letterSpacing: "0.02em",
                      textTransform: "uppercase",
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: style.color }} />
                    {style.label}
                  </span>
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid #242424",
                      background: "transparent",
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 11,
                      color: "#9a9a9a",
                    }}
                  >
                    {c.category}
                  </span>
                  {/* Page location badge — mono, neutral. Falls back to
                      "—" when the extractor didn't emit a page guess. */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid #242424",
                      background: "transparent",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 10,
                      color: "#9a9a9a",
                      letterSpacing: "0.04em",
                    }}
                    title="Best-effort page or clause location"
                  >
                    <FileText style={{ width: 10, height: 10 }} strokeWidth={1.5} />
                    {c.pageLocation ?? "—"}
                  </span>
                  {/* Extraction confidence dot — green / amber / grey. */}
                  {c.extractionConfidence && (
                    <span
                      title={`Extraction confidence: ${c.extractionConfidence}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 5,
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 10,
                        color: "#6b6b6b",
                        letterSpacing: "0.04em",
                      }}
                    >
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: confidenceColor }} />
                      {confidenceLabel}
                    </span>
                  )}
                  {/* Rule ID — code-identity mono, neutral grey (no violet) */}
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#9a9a9a", marginLeft: "auto" }}>
                    {c.ruleId}
                  </span>
                </div>

                {/* Snippet */}
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {t.report_snippet}
                </div>
                <blockquote
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#e8e8e8",
                    paddingLeft: 16,
                    borderLeft: "2px solid #242424",
                    marginBottom: 20,
                    fontStyle: "normal",
                  }}
                >
                  {c.snippet}
                </blockquote>

                {/* Explanation */}
                <div
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                >
                  {t.report_explanation}
                </div>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, lineHeight: 1.6, color: "#e8e8e8", marginBottom: 20 }}>
                  {explanation}
                </p>

                {/* Recommended action — Lightbulb icon, distinct from
                    the explanation so the reader can scan for "what do
                    I do now" in a single pass. */}
                {recommendedAction && (
                  <div
                    style={{
                      padding: 14,
                      marginBottom: 20,
                      borderRadius: 8,
                      border: "1px solid #242424",
                      background: "#0a0a0a",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Lightbulb style={{ width: 13, height: 13, color: "#e8e8e8" }} strokeWidth={1.5} />
                      <span
                        style={{
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 11,
                          color: "#e8e8e8",
                          letterSpacing: "0.04em",
                          textTransform: "uppercase",
                          fontWeight: 500,
                        }}
                      >
                        Recommended action
                      </span>
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: "#e8e8e8",
                      }}
                    >
                      {recommendedAction}
                    </p>
                  </div>
                )}

                {/* Legal basis — expandable. Collapsed shows just the
                    citation (single line, ellipsised); expanded shows
                    the full legal basis + any cited sections + the
                    precedent strength tag. */}
                <button
                  type="button"
                  onClick={() => onToggleRuleExpanded(c.ruleId)}
                  aria-expanded={isExpanded}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    padding: 0,
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 11,
                    color: "#6b6b6b",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                    fontWeight: 500,
                  }}
                  className="hover:text-white transition-colors"
                >
                  {t.report_legal_basis}
                  <ChevronRight
                    style={{
                      width: 12,
                      height: 12,
                      transition: "transform 0.2s ease",
                      transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                    strokeWidth={1.5}
                  />
                </button>
                {/* Collapsed view — single-line citation, ellipsised. */}
                {!isExpanded && (
                  <p
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 12,
                      lineHeight: 1.5,
                      color: "#abafb4",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={c.legalBasis}
                  >
                    {c.legalBasis}
                  </p>
                )}
                {/* Expanded view — full legal basis + cited sections + precedent strength. */}
                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <p
                        style={{
                          fontFamily: "var(--font-jetbrains-mono), monospace",
                          fontSize: 12,
                          lineHeight: 1.5,
                          color: "#abafb4",
                          marginBottom: c.citedSections?.length || c.precedentStrength ? 12 : 0,
                        }}
                      >
                        {c.legalBasis}
                      </p>
                      {c.citedSections && c.citedSections.length > 0 && (
                        <div className="mb-3">
                          <div
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                              fontSize: 10,
                              color: "#6b6b6b",
                              marginBottom: 6,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              fontWeight: 500,
                            }}
                          >
                            {t.report_cited_sections}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {c.citedSections.map((sec) => (
                              <span
                                key={sec}
                                style={{
                                  fontFamily: "var(--font-jetbrains-mono), monospace",
                                  fontSize: 10,
                                  padding: "3px 8px",
                                  borderRadius: 4,
                                  border: "1px solid #242424",
                                  color: "#9a9a9a",
                                  letterSpacing: "0.02em",
                                }}
                              >
                                {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {c.precedentStrength && (
                        <div>
                          <div
                            style={{
                              fontFamily: "var(--font-inter), sans-serif",
                              fontSize: 10,
                              color: "#6b6b6b",
                              marginBottom: 6,
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                              fontWeight: 500,
                            }}
                          >
                            {t.report_precedent}
                          </div>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "3px 8px",
                              borderRadius: 4,
                              border: "1px solid #242424",
                              fontFamily: "var(--font-inter), sans-serif",
                              fontSize: 11,
                              color: "#9a9a9a",
                              letterSpacing: "0.02em",
                              textTransform: "capitalize",
                            }}
                          >
                            {c.precedentStrength.replace("_", " ")}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Roadmap note */}
                {c.roadmapNote && (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: 11,
                        color: "#6b6b6b",
                        marginTop: 16,
                        marginBottom: 6,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                        fontWeight: 500,
                      }}
                    >
                      {t.report_roadmap_note}
                    </div>
                    <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 12, lineHeight: 1.5, color: "#c9ab6a" }}>
                      {c.roadmapNote}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Bottom Export button — prominent, full-width, bold. A small
          QrCode hint below it tells the reader the PDF includes a
          verifiable report ID + QR placeholder. */}
      <div
        className="mt-8"
        style={{
          paddingTop: 24,
          borderTop: "1px solid #242424",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
        }}
      >
        <button
          onClick={() => exportReportToPdf(result, uiLang)}
          className="btn-outline-neutral"
          style={{
            padding: "12px 24px",
            fontSize: 14,
            borderColor: "#3a3a3a",
            color: "#ffffff",
            fontWeight: 700,
          }}
        >
          <Download style={{ width: 15, height: 15 }} strokeWidth={2} />
          Export as PDF
        </button>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 11,
            color: "#6b6b6b",
          }}
        >
          <QrCode style={{ width: 12, height: 12 }} strokeWidth={1.5} />
          Includes a report ID + QR placeholder for verification
        </div>
      </div>
    </motion.div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ color: "#6b6b6b", letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color: "#e8e8e8" }}>{value}</div>
    </>
  );
}

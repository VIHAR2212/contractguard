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
  Download,
  FileText,
  Image as ImageIcon,
  Loader2,
  Shield,
  Upload,
  X,
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
// Motion — one restrained vocabulary reused everywhere
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

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const reset = useCallback(() => {
    setStage({ kind: "idle" });
    setFile(null);
    setPastedText("");
    setUserNotes("");
    setSelectedFileType("");
  }, []);

  const onPickFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setShowPaste(false);
    setStage({ kind: "idle" });
  }, []);

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
    try {
      let res: Response;
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
  }, [showPaste, file, pastedText, userNotes, sector, docLanguage]);

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
          NAV
          ============================================================ */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="sticky top-0 z-30 nav-frosted"
        style={{ height: 59, borderBottom: "1px solid #242424" }}
      >
        <div className="mx-auto flex items-center justify-between px-6 h-full" style={{ maxWidth: 1200 }}>
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
          HERO
          ============================================================ */}
      <section className="w-full" style={{ paddingTop: 96, paddingBottom: 72 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
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
          ANALYZER
          ============================================================ */}
      <section id="analyze" className="w-full" style={{ paddingBottom: 120 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
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

          <div className="grid lg:grid-cols-[1fr_360px] gap-4">
            {/* Dropzone */}
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

              {/* Additional context box */}
              <div className="mt-6" style={{ paddingTop: 16, borderTop: "1px solid #242424" }}>
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
                <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "#6b6b6b", marginTop: 6, lineHeight: 1.4 }}>
                  The AI will read this before analysing the contract and pay extra attention to anything you flag here.
                </div>
              </div>

              {/* File-type option chips */}
              <div className="mt-6" style={{ paddingTop: 16, borderTop: "1px solid #242424" }}>
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
            </div>

            {/* Selectors + Analyze button */}
            <div className="flex flex-col gap-6" style={{ background: "#0a0a0a", border: "1px solid #242424", borderRadius: 16, padding: 32 }}>
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

              {isBusy && (
                <div className="flex flex-col gap-2" style={{ paddingTop: 16, borderTop: "1px solid #242424" }}>
                  <ProgressLine done={stage.kind !== "uploading"} label={t.status_uploading} />
                  <ProgressLine done={stage.kind === "matching"} label={t.status_parsing} />
                  <ProgressLine done={stage.kind === "matching"} label={t.status_matching} />
                  <ProgressLine done={false} label={t.status_explaining} />
                </div>
              )}
            </div>
          </div>

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

            {stage.kind === "done" && <ReportView result={stage.result} uiLang={uiLang} onBack={reset} t={t} />}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================
          TRANSPARENCY
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
          FOOTER
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

      {/* Scoped styles for the one reusable button pattern */}
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
// PDF export — generates a white-background, black-text PDF of the report
// with colored severity indicators. Uses jsPDF (client-side, no server
// needed). Font sizes chosen for readability: 11-12pt body, 20pt title,
// 16pt section headings. About 8-10 words per line on A4 — readable,
// not tiny T&C text, not too big.
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
    const lineHeight = opts.lineHeight ?? size * 0.45;

    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);

    const lines = doc.splitTextToSize(text, maxWidth) as string[];
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
  // HEADER
  // -----------------------------------------------------------------------
  addText("ContractGuard — Risk Report", { size: 20, bold: true, color: [20, 20, 20] });
  y += 2;

  const dateStr = new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  addText(`Generated on ${dateStr}`, { size: 10, color: [140, 140, 140] });
  y += 4;

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

  addText(
    `Sector: ${result.sector}    |    Document language: ${result.docLanguage}    |    Rules considered: ${result.rulesConsidered}    |    Analysis time: ${result.pipelineMs} ms`,
    { size: 9, color: [140, 140, 140] }
  );

  if (result.message) {
    y += 2;
    addText(`Note: ${result.message}`, { size: 9, color: [180, 140, 60] });
  }

  y += 6;
  addSeparator();

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
      addRect(margin, y, 4, 10, sevColor, 1);
      y += 2;

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

      // Snippet in a light grey box
      const snippetLines = doc.splitTextToSize(c.snippet, contentW - 6) as string[];
      const snippetBoxH = snippetLines.length * 5 + 4;
      ensureSpace(snippetBoxH + 4);
      doc.setFillColor(248, 248, 248);
      doc.roundedRect(margin, y, contentW, snippetBoxH, 1.5, 1.5, "F");
      doc.setFont("courier", "normal");
      doc.setFontSize(10);
      doc.setTextColor(50, 50, 50);
      let snippetY = y + 4;
      for (const line of snippetLines) {
        doc.text(line, margin + 3, snippetY);
        snippetY += 5;
      }
      y += snippetBoxH + 3;

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

      // Legal basis
      addText("Legal basis:", {
        size: 9,
        bold: true,
        color: [140, 140, 140],
      });
      y += 1;
      addText(c.legalBasis, { size: 10, color: [100, 100, 160], lineHeight: 5 });

      // Roadmap note
      if (c.roadmapNote) {
        y += 2;
        addText(`Note: ${c.roadmapNote}`, { size: 9, color: [180, 140, 60] });
      }

      y += 6;

      if (i < result.clauses.length - 1) {
        addSeparator();
        y += 2;
      }
    });
  }

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

  const filename = `contractguard-report-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

// ===========================================================================
// Report view
// ===========================================================================

function ReportView({
  result,
  uiLang,
  onBack,
  t,
}: {
  result: AnalyzeResponse;
  uiLang: UiLanguage;
  onBack: () => void;
  t: ReturnType<typeof getStrings>;
}) {
  const tone = riskTone(result.riskScore);

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

      {result.message && (
        <div className="mb-6 flex items-start gap-2" style={{ padding: 14, borderRadius: 8, border: "1px solid #242424", background: "#000000" }}>
          <AlertTriangle style={{ width: 13, height: 13, color: "#c9ab6a", flexShrink: 0, marginTop: 1 }} strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 13, color: "#9a9a9a", lineHeight: 1.5 }}>{result.message}</span>
        </div>
      )}

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
      {result.clauses.length === 0 ? (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: "1px solid #242424",
            background: "#000000",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 14,
            color: "#9a9a9a",
            lineHeight: 1.6,
          }}
        >
          {t.report_no_clauses}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {result.clauses.map((c, i) => {
            const style = SEVERITY_STYLE[c.severity];
            const explanation = uiLang === "hi" ? c.explanationHi : c.explanationEn;
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
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#6b6b6b" }}>
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
                  <span style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11, color: "#9a9a9a", marginLeft: "auto" }}>
                    {c.ruleId}
                  </span>
                </div>

                <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "#6b6b6b", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
                  {t.report_snippet}
                </div>
                <blockquote style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 13, lineHeight: 1.6, color: "#e8e8e8", paddingLeft: 16, borderLeft: "2px solid #242424", marginBottom: 20, fontStyle: "normal" }}>
                  {c.snippet}
                </blockquote>

                <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "#6b6b6b", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
                  {t.report_explanation}
                </div>
                <p style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 14, lineHeight: 1.6, color: "#e8e8e8", marginBottom: 20 }}>
                  {explanation}
                </p>

                <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "#6b6b6b", marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
                  {t.report_legal_basis}
                </div>
                <p style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12, lineHeight: 1.5, color: "#abafb4" }}>
                  {c.legalBasis}
                </p>

                {c.roadmapNote && (
                  <>
                    <div style={{ fontFamily: "var(--font-inter), sans-serif", fontSize: 11, color: "#6b6b6b", marginTop: 16, marginBottom: 6, letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 500 }}>
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

      {/* Bottom Export button — prominent, full-width, bold */}
      <div
        className="mt-8"
        style={{
          paddingTop: 24,
          borderTop: "1px solid #242424",
          display: "flex",
          justifyContent: "center",
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

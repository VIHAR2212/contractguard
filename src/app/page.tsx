"use client";

// ===========================================================================
// ContractGuard — Resend-inspired UI
// ---------------------------------------------------------------------------
// Pure-black canvas (#000000), 1px #292d30 hairline borders, no shadows.
// Single chromatic accent: Electric Blue #3b9eff on the primary CTA only.
// Status colors (green/red/yellow/blue/lavender) reserved strictly for the
// severity badges in the report — never decorative.
// Three-voice typography: Inter (UI), DM Serif Display (hero only),
// JetBrains Mono (code identity: rule IDs, snippets, filenames).
// ===========================================================================

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Loader2,
  Shield,
  Sparkles,
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
// Selectors data
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
// Resend status colors — used ONLY for severity chips in the report
// (Bounced Red, Complained Yellow, Opened Blue per spec vocabulary)
// ---------------------------------------------------------------------------

const SEVERITY_STYLE: Record<
  Severity,
  { color: string; label: string }
> = {
  high: { color: "#ff9592", label: "High" },     // Bounced Red
  medium: { color: "#ffca16", label: "Medium" }, // Complained Yellow
  low: { color: "#70b8ff", label: "Low" },       // Opened Blue
};

function riskTone(score: number): { label: string; color: string } {
  if (score >= 50) return { label: "High risk", color: "#ff9592" };
  if (score >= 20) return { label: "Medium risk", color: "#ffca16" };
  return { label: "Low risk", color: "#3ad389" };
}

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
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [stage, setStage] = useState<Stage>({ kind: "idle" });

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  const reset = useCallback(() => {
    setStage({ kind: "idle" });
    setFile(null);
    setPastedText("");
  }, []);

  const onPickFile = useCallback((f: File | null) => {
    if (!f) return;
    setFile(f);
    setShowPaste(false);
    setStage({ kind: "idle" });
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
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("sector", sector);
        fd.append("docLanguage", docLanguage);
        setStage({ kind: "parsing" });
        res = await fetch("/api/analyze", { method: "POST", body: fd });
      } else if (pastedText.trim().length >= 30) {
        setStage({ kind: "matching" });
        res = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pastedText, sector, docLanguage }),
        });
      } else {
        setStage({ kind: "error", message: "Please upload a file or paste at least 30 characters of text." });
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
  }, [file, pastedText, sector, docLanguage]);

  const isBusy =
    stage.kind === "uploading" ||
    stage.kind === "parsing" ||
    stage.kind === "matching";
  const canAnalyze = !isBusy && (!!file || pastedText.trim().length >= 30);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "#000000",
        color: "#f0f0f0",
        fontFamily: "var(--font-inter), system-ui, sans-serif",
      }}
    >
      {/* ============================================================
          NAV — Resend spec: 59px, frosted glass, 1px #292d30 bottom
          ============================================================ */}
      <header
        className="sticky top-0 z-30 nav-frosted"
        style={{ height: 59, borderBottom: "1px solid #292d30" }}
      >
        <div
          className="mx-auto flex items-center justify-between px-6 h-full"
          style={{ maxWidth: 1200 }}
        >
          {/* Left: brand */}
          <div className="flex items-center gap-2.5">
            <div
              className="flex items-center justify-center"
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background:
                  "linear-gradient(to right bottom in oklab, rgb(146, 129, 247) 0%, rgb(154, 84, 220) 100%)",
              }}
            >
              <Shield style={{ width: 16, height: 16, color: "#ffffff" }} strokeWidth={1.5} />
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
                  color: "rgba(240, 240, 240, 0.71)",
                }}
                className="hover:text-white transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Right: UI lang switcher + outlined CTA */}
          <div className="flex items-center gap-3">
            <div
              className="flex items-center rounded-md overflow-hidden"
              style={{ border: "1px solid #292d30" }}
            >
              {UI_LANGS.map((l) => (
                <button
                  key={l}
                  onClick={() => setUiLang(l)}
                  aria-pressed={uiLang === l}
                  style={{
                    padding: "5px 10px",
                    fontSize: 11,
                    fontWeight: 500,
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    background: uiLang === l ? "#ffffff" : "transparent",
                    color: uiLang === l ? "#000000" : "#a1a4a5",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : "Hg"}
                </button>
              ))}
            </div>
            <a
              href="#analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 6,
                border: "1px solid #3b9eff",
                background: "transparent",
                color: "#ffffff",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
              className="hover:bg-[#3b9eff]/10 transition-colors"
            >
              {t.hero_cta}
              <ArrowRight style={{ width: 13, height: 13 }} />
            </a>
          </div>
        </div>
      </header>

      {/* ============================================================
          HERO — DM Serif Display at display size, -0.01em tracking
          ============================================================ */}
      <section className="w-full" style={{ paddingTop: 96, paddingBottom: 80 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          {/* Announcement pill */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-center mb-8"
          >
            <a
              href="#transparency"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 14px",
                borderRadius: 16,
                border: "1px solid #292d30",
                background: "transparent",
                color: "#f0f0f0",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
              }}
              className="hover:border-[#464a4d] transition-colors"
            >
              <Sparkles style={{ width: 13, height: 13, color: "#9281f7" }} />
              {t.hero_eyebrow}
              <ArrowRight style={{ width: 12, height: 12, color: "#a1a4a5" }} />
            </a>
          </motion.div>

          {/* Hero headline — DM Serif Display, 96px on desktop / 56px mobile */}
          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
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
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="text-center mx-auto"
            style={{
              maxWidth: 720,
              marginTop: 32,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 18,
              lineHeight: 1.6,
              color: "#a1a4a5",
              fontWeight: 400,
            }}
          >
            {t.hero_subtitle}
          </motion.p>

          {/* Hero quote */}
          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="text-center mx-auto"
            style={{
              maxWidth: 640,
              marginTop: 24,
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 14,
              lineHeight: 1.6,
              color: "#6e727a",
              fontStyle: "italic",
            }}
          >
            {t.hero_quote}
          </motion.p>

          {/* CTA row — outlined primary + ghost secondary per spec */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.24 }}
            className="flex items-center justify-center gap-4 mt-10 flex-wrap"
          >
            <a
              href="#analyze"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "10px 18px",
                borderRadius: 6,
                border: "1px solid #3b9eff",
                background: "transparent",
                color: "#ffffff",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
              }}
              className="hover:bg-[#3b9eff]/10 transition-colors"
            >
              {t.hero_cta}
              <ArrowRight style={{ width: 14, height: 14 }} />
            </a>
            <a
              href="#transparency"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "rgba(252, 253, 255, 0.94)",
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                fontWeight: 400,
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav_transparency}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ============================================================
          ANALYZER — file upload + selectors + report
          ============================================================ */}
      <section id="analyze" className="w-full" style={{ paddingBottom: 120 }}>
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          {/* Section heading — ABCFavorit substitute: Inter at 32-40px, -0.03em tracking */}
          <div className="mb-10">
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: "#6c6c6c",
                marginBottom: 8,
                letterSpacing: "0.02em",
              }}
            >
              01 / ANALYZE
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
                Dropzone / paste — feature card surface
                ============================================================ */}
            <div
              style={{
                background: "#0b0e14",
                border: "1px solid #292d30",
                borderRadius: 16,
                padding: 32,
              }}
            >
              {!showPaste ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className="cursor-pointer transition-colors hover:bg-white/[0.015]"
                  style={{
                    borderRadius: 12,
                    border: "1px dashed #292d30",
                    padding: "48px 24px",
                    textAlign: "center",
                  }}
                >
                  <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.zip,.png,.jpg,.jpeg,.webp,.gif,.txt,.md,.csv,.json"
                    className="hidden"
                    onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
                  />
                  <AnimatePresence mode="wait">
                    {file ? (
                      <motion.div
                        key="picked"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: "1px solid #292d30",
                            background: "#000000",
                          }}
                        >
                          <FileText
                            style={{ width: 20, height: 20, color: "#f0f0f0" }}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 14,
                            fontWeight: 500,
                            color: "#ffffff",
                          }}
                        >
                          {file.name}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-jetbrains-mono), monospace",
                            fontSize: 12,
                            color: "#6c6c6c",
                          }}
                        >
                          {(file.size / 1024).toFixed(1)} KB
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFile(null);
                          }}
                          className="flex items-center gap-1 transition-colors hover:text-white"
                          style={{
                            fontSize: 12,
                            color: "#6e727a",
                            fontFamily: "var(--font-inter), sans-serif",
                          }}
                        >
                          <X style={{ width: 12, height: 12 }} />
                          {t.dropzone_clear}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col items-center gap-3"
                      >
                        <div
                          className="flex items-center justify-center"
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: "1px solid #292d30",
                            background: "#000000",
                          }}
                        >
                          <Upload
                            style={{ width: 20, height: 20, color: "#a1a4a5" }}
                            strokeWidth={1.5}
                          />
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 16,
                            fontWeight: 500,
                            color: "#ffffff",
                          }}
                        >
                          {t.dropzone_title}
                        </div>
                        <div
                          style={{
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 13,
                            color: "#6e727a",
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
                          style={{
                            marginTop: 8,
                            padding: "8px 16px",
                            borderRadius: 6,
                            border: "1px solid #3b9eff",
                            background: "transparent",
                            color: "#ffffff",
                            fontFamily: "var(--font-inter), sans-serif",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                          className="hover:bg-[#3b9eff]/10 transition-colors"
                        >
                          {t.dropzone_button}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                      border: "1px solid #292d30",
                      color: "#f0f0f0",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 13,
                      lineHeight: 1.5,
                      resize: "vertical",
                      outline: "none",
                    }}
                    onFocus={(e) => (e.currentTarget.style.borderColor = "#3b9eff")}
                    onBlur={(e) => (e.currentTarget.style.borderColor = "#292d30")}
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPastedText("")}
                      style={{
                        fontSize: 12,
                        color: "#6e727a",
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

              {/* Mode switch — ghost buttons */}
              <div
                className="mt-6 flex items-center gap-4"
                style={{
                  paddingTop: 16,
                  borderTop: "1px solid #292d30",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowPaste(false)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontFamily: "var(--font-inter), sans-serif",
                    color: !showPaste ? "#f0f0f0" : "#6e727a",
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
                    color: showPaste ? "#f0f0f0" : "#6e727a",
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

              {/* Format hints */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6"
                style={{ paddingTop: 16, borderTop: "1px solid #292d30" }}
              >
                {[
                  { icon: FileText, text: t.dropzone_pdf_hint },
                  { icon: ImageIcon, text: t.dropzone_image_hint },
                  { icon: Upload, text: t.dropzone_zip_hint },
                ].map((hint, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2"
                    style={{ fontSize: 12, color: "#6c6c6c", lineHeight: 1.5 }}
                  >
                    <hint.icon
                      style={{ width: 13, height: 13, color: "#9281f7", flexShrink: 0, marginTop: 2 }}
                      strokeWidth={1.5}
                    />
                    <span style={{ fontFamily: "var(--font-inter), sans-serif" }}>
                      {hint.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* ============================================================
                Selectors + Analyze button
                ============================================================ */}
            <div
              className="flex flex-col gap-6"
              style={{
                background: "#0b0e14",
                border: "1px solid #292d30",
                borderRadius: 16,
                padding: 32,
              }}
            >
              {/* Sector selector */}
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#6c6c6c",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
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
                          border: `1px solid ${active ? "#3b9eff" : "#292d30"}`,
                          background: active ? "rgba(59, 158, 255, 0.06)" : "transparent",
                          color: active ? "#ffffff" : "#a1a4a5",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 13,
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        className="hover:border-[#464a4d] hover:text-white"
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
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#6c6c6c",
                    marginBottom: 10,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
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
                          border: `1px solid ${active ? "#3b9eff" : "#292d30"}`,
                          background: active ? "rgba(59, 158, 255, 0.06)" : "transparent",
                          color: active ? "#ffffff" : "#a1a4a5",
                          fontFamily: "var(--font-inter), sans-serif",
                          fontSize: 12,
                          fontWeight: active ? 500 : 400,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        className="hover:border-[#464a4d] hover:text-white"
                      >
                        {t[l.labelKey] as string}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Analyze button — primary outlined CTA */}
              <button
                onClick={analyze}
                disabled={!canAnalyze}
                style={{
                  marginTop: 4,
                  padding: "12px 16px",
                  borderRadius: 6,
                  border: `1px solid ${canAnalyze ? "#3b9eff" : "#292d30"}`,
                  background: "transparent",
                  color: canAnalyze ? "#ffffff" : "#464a4d",
                  fontFamily: "var(--font-inter), sans-serif",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: canAnalyze ? "pointer" : "not-allowed",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.15s ease",
                }}
                className={canAnalyze ? "hover:bg-[#3b9eff]/10" : ""}
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

              {/* Progress lines */}
              {isBusy && (
                <div
                  className="flex flex-col gap-2"
                  style={{ paddingTop: 16, borderTop: "1px solid #292d30" }}
                >
                  <ProgressLine
                    done={stage.kind !== "uploading"}
                    label={t.status_uploading}
                  />
                  <ProgressLine
                    done={stage.kind === "matching"}
                    label={t.status_parsing}
                  />
                  <ProgressLine
                    done={stage.kind === "matching"}
                    label={t.status_matching}
                  />
                  <ProgressLine done={false} label={t.status_explaining} />
                </div>
              )}
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {stage.kind === "error" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-3"
                style={{
                  padding: 16,
                  borderRadius: 12,
                  border: "1px solid #292d30",
                  background: "#0b0e14",
                }}
              >
                <AlertTriangle
                  style={{ width: 16, height: 16, color: "#ff9592", flexShrink: 0, marginTop: 1 }}
                  strokeWidth={1.5}
                />
                <div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#ffffff",
                    }}
                  >
                    {t.status_error}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-inter), sans-serif",
                      fontSize: 13,
                      color: "#a1a4a5",
                      marginTop: 4,
                    }}
                  >
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
              />
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* ============================================================
          TRANSPARENCY — section with hairline dividers, 80-120px gap
          ============================================================ */}
      <section
        id="transparency"
        className="w-full"
        style={{ paddingTop: 80, paddingBottom: 120, borderTop: "1px solid #292d30" }}
      >
        <div className="mx-auto px-6" style={{ maxWidth: 1200 }}>
          <div className="mb-12">
            <div
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 12,
                color: "#6c6c6c",
                marginBottom: 8,
                letterSpacing: "0.02em",
              }}
            >
              02 / TRANSPARENCY
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
            <p
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 16,
                lineHeight: 1.6,
                color: "#a1a4a5",
                maxWidth: 720,
              }}
            >
              {t.transparency_intro}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Panel
              eyebrow="PRIVACY"
              title={t.transparency_no_logging_heading}
            >
              <p style={bodyStyle}>{t.transparency_no_logging_body}</p>
            </Panel>
            <Panel
              eyebrow="AI ROLE"
              title={t.transparency_ai_role_heading}
            >
              <p style={bodyStyle}>{t.transparency_ai_role_body}</p>
            </Panel>
            <Panel
              eyebrow="DISCLAIMER"
              title={t.transparency_disclaimer_heading}
            >
              <p style={bodyStyle}>{t.transparency_disclaimer_body}</p>
            </Panel>
            <Panel
              eyebrow="RULES DB"
              title={t.transparency_legal_basis_heading}
            >
              <p style={{ ...bodyStyle, marginBottom: 16 }}>
                {interpolate(t.transparency_rules_count, { count: totalRuleCount })}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {["RERA", "RBI", "BIS", "ICA", "CoSS 2020", "DPDP 2023", "IDA 1947", "CPC"].map(
                  (tag) => (
                    <span
                      key={tag}
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 11,
                        padding: "3px 8px",
                        borderRadius: 6,
                        border: "1px solid #292d30",
                        color: "#a1a4a5",
                      }}
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* ============================================================
          FOOTER — minimal, two links per Resend spec
          ============================================================ */}
      <footer
        className="mt-auto"
        style={{
          borderTop: "1px solid #292d30",
          padding: "32px 0",
        }}
      >
        <div
          className="mx-auto px-6 flex items-center justify-between"
          style={{ maxWidth: 1200 }}
        >
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 13,
              color: "#6c6c6c",
            }}
          >
            {t.footer_built}
          </div>
          <div className="flex items-center gap-6">
            <a
              href="#analyze"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "rgba(252, 253, 255, 0.94)",
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav_analyze}
            </a>
            <a
              href="#transparency"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 13,
                color: "rgba(252, 253, 255, 0.94)",
                textDecoration: "none",
              }}
              className="hover:text-white transition-colors"
            >
              {t.nav_transparency}
            </a>
          </div>
        </div>
      </footer>
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
  color: "#a1a4a5",
};

function ProgressLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2.5">
      {done ? (
        <Check
          style={{ width: 12, height: 12, color: "#3ad389" }}
          strokeWidth={2}
        />
      ) : (
        <Loader2
          style={{ width: 12, height: 12, color: "#6e727a" }}
          className="animate-spin"
        />
      )}
      <span
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 12,
          color: done ? "#f0f0f0" : "#6e727a",
        }}
      >
        {label}
      </span>
    </div>
  );
}

function Panel({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#0b0e14",
        border: "1px solid #292d30",
        borderRadius: 16,
        padding: 32,
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          color: "#6c6c6c",
          marginBottom: 8,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {eyebrow}
      </div>
      <h3
        style={{
          fontFamily: "var(--font-inter), sans-serif",
          fontSize: 20,
          fontWeight: 500,
          color: "#ffffff",
          letterSpacing: "-0.02em",
          marginBottom: 12,
        }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

// ===========================================================================
// Report view — the product UI surface where status colors appear
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mt-4"
      style={{
        background: "#0b0e14",
        border: "1px solid #292d30",
        borderRadius: 16,
        padding: 32,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <div
            style={{
              fontFamily: "var(--font-jetbrains-mono), monospace",
              fontSize: 11,
              color: "#6c6c6c",
              marginBottom: 8,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
            }}
          >
            {t.report_title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 32,
              fontWeight: 500,
              color: "#ffffff",
              letterSpacing: "-0.02em",
              lineHeight: 1.1,
            }}
          >
            {tone.label}
          </div>
        </div>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid #292d30",
            background: "transparent",
            color: "#a1a4a5",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 13,
            cursor: "pointer",
          }}
          className="hover:text-white hover:border-[#464a4d] transition-colors"
        >
          <ArrowLeft style={{ width: 13, height: 13 }} />
          {t.report_back}
        </button>
      </div>

      {/* Risk score gauge + meta */}
      <div
        className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-8 mb-8"
        style={{ paddingBottom: 32, borderBottom: "1px solid #292d30" }}
      >
        <div>
          <div className="flex items-baseline gap-3 mb-3">
            <span
              style={{
                fontFamily: "var(--font-jetbrains-mono), monospace",
                fontSize: 56,
                fontWeight: 400,
                color: "#ffffff",
                lineHeight: 1,
              }}
            >
              {result.riskScore}
            </span>
            <span
              style={{
                fontFamily: "var(--font-inter), sans-serif",
                fontSize: 14,
                color: tone.color,
                fontWeight: 500,
              }}
            >
              {t.report_risk_score} / 100
            </span>
          </div>
          <div
            style={{
              height: 4,
              borderRadius: 2,
              background: "#1b1b1b",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.riskScore}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              style={{
                height: "100%",
                background: tone.color,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
        <div
          className="grid grid-cols-2 gap-y-2 gap-x-4"
          style={{ fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 12 }}
        >
          <Meta label="SECTOR" value={result.sector} />
          <Meta label="DOC LANG" value={result.docLanguage} />
          <Meta label="RULES" value={String(result.rulesConsidered)} />
          <Meta label="RUNTIME" value={`${result.pipelineMs} ms`} />
        </div>
      </div>

      {/* Optional warning */}
      {result.message && (
        <div
          className="mb-6 flex items-start gap-2"
          style={{
            padding: 14,
            borderRadius: 8,
            border: "1px solid #292d30",
            background: "#000000",
          }}
        >
          <AlertTriangle
            style={{ width: 13, height: 13, color: "#ffca16", flexShrink: 0, marginTop: 1 }}
            strokeWidth={1.5}
          />
          <span
            style={{
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: 13,
              color: "#a1a4a5",
              lineHeight: 1.5,
            }}
          >
            {result.message}
          </span>
        </div>
      )}

      {/* Clause list */}
      <div
        style={{
          fontFamily: "var(--font-jetbrains-mono), monospace",
          fontSize: 11,
          color: "#6c6c6c",
          marginBottom: 12,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
        }}
      >
        {t.report_clauses_found} ({result.clauses.length})
      </div>
      {result.clauses.length === 0 ? (
        <div
          style={{
            padding: 24,
            borderRadius: 12,
            border: "1px solid #292d30",
            background: "#000000",
            fontFamily: "var(--font-inter), sans-serif",
            fontSize: 14,
            color: "#a1a4a5",
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
                transition={{ delay: i * 0.04 }}
                style={{
                  borderRadius: 12,
                  border: "1px solid #292d30",
                  background: "#000000",
                  padding: 24,
                }}
              >
                {/* Top row: severity + category + rule ID (code-identity violet) */}
                <div className="flex items-center gap-2 mb-4 flex-wrap">
                  {/* Severity chip — uses status color */}
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
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: style.color,
                      }}
                    />
                    {style.label}
                  </span>
                  {/* Category chip — neutral */}
                  <span
                    style={{
                      padding: "3px 8px",
                      borderRadius: 6,
                      border: "1px solid #292d30",
                      background: "transparent",
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      color: "#a1a4a5",
                    }}
                  >
                    {c.category}
                  </span>
                  {/* Rule ID — Resend Violet (code identity) */}
                  <span
                    style={{
                      fontFamily: "var(--font-jetbrains-mono), monospace",
                      fontSize: 11,
                      color: "#9281f7",
                    }}
                  >
                    {c.ruleId}
                  </span>
                </div>

                {/* Snippet — code block */}
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#6c6c6c",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.report_snippet}
                </div>
                <blockquote
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 13,
                    lineHeight: 1.6,
                    color: "#f0f0f0",
                    paddingLeft: 16,
                    borderLeft: `2px solid ${style.color}`,
                    marginBottom: 20,
                    fontStyle: "normal",
                  }}
                >
                  {c.snippet}
                </blockquote>

                {/* Explanation */}
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#6c6c6c",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.report_explanation}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-inter), sans-serif",
                    fontSize: 14,
                    lineHeight: 1.6,
                    color: "#f0f0f0",
                    marginBottom: 20,
                  }}
                >
                  {explanation}
                </p>

                {/* Legal basis */}
                <div
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 11,
                    color: "#6c6c6c",
                    marginBottom: 6,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {t.report_legal_basis}
                </div>
                <p
                  style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 12,
                    lineHeight: 1.5,
                    color: "#9281f7",  // Resend violet — code identity
                  }}
                >
                  {c.legalBasis}
                </p>

                {/* Roadmap note */}
                {c.roadmapNote && (
                  <>
                    <div
                      style={{
                        fontFamily: "var(--font-jetbrains-mono), monospace",
                        fontSize: 11,
                        color: "#6c6c6c",
                        marginTop: 16,
                        marginBottom: 6,
                        letterSpacing: "0.04em",
                        textTransform: "uppercase",
                      }}
                    >
                      {t.report_roadmap_note}
                    </div>
                    <p
                      style={{
                        fontFamily: "var(--font-inter), sans-serif",
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "#ffca16", // Complained Yellow — minor status hint
                      }}
                    >
                      {c.roadmapNote}
                    </p>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <>
      <div style={{ color: "#6c6c6c", letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </div>
      <div style={{ color: "#f0f0f0" }}>{value}</div>
    </>
  );
}

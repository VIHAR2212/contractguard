"use client";

// ===========================================================================
// ContractGuard — Demo frontend (Resend-inspired obsidian aesthetic)
// ---------------------------------------------------------------------------
// This page wires the user's selection (sector, document language) and an
// uploaded file / pasted text into the /api/analyze endpoint, then renders
// the structured response as the risk report.
// ===========================================================================

import { useCallback, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
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
// Constants
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
// Severity styling
// ---------------------------------------------------------------------------

const SEVERITY_STYLE: Record<Severity, { chip: string; ring: string; label: string }> = {
  high: {
    chip: "bg-red-500/10 text-red-400 border-red-500/30",
    ring: "border-l-red-500",
    label: "High",
  },
  medium: {
    chip: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    ring: "border-l-amber-500",
    label: "Medium",
  },
  low: {
    chip: "bg-sky-500/10 text-sky-400 border-sky-500/30",
    ring: "border-l-sky-500",
    label: "Low",
  },
};

function riskTone(score: number): { label: string; color: string; bar: string } {
  if (score >= 50) return { label: "High risk", color: "text-red-400", bar: "bg-red-500" };
  if (score >= 20) return { label: "Medium risk", color: "text-amber-400", bar: "bg-amber-500" };
  return { label: "Low risk", color: "text-emerald-400", bar: "bg-emerald-500" };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

type Stage =
  | { kind: "idle" }
  | { kind: "uploading" }
  | { kind: "parsing" }
  | { kind: "matching" }
  | { kind: "done"; result: AnalyzeResponse }
  | { kind: "error"; message: string };

export default function Home() {
  // UI language
  const [uiLang, setUiLang] = useState<UiLanguage>("en");
  const t = useMemo(() => getStrings(uiLang), [uiLang]);

  // Selections
  const [sector, setSector] = useState<Sector>("construction");
  const [docLanguage, setDocLanguage] = useState<DocLanguage>("en");

  // File / paste
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState<string>("");
  const [showPaste, setShowPaste] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Pipeline stage
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

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "#0a0a0a", color: "#e6e6e6", fontFamily: "Inter, system-ui, sans-serif" }}
    >
      {/* Top nav */}
      <header
        className="sticky top-0 z-20 backdrop-blur-md"
        style={{ background: "rgba(10,10,10,0.7)", borderBottom: "1px solid #292d30" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-400" />
            <span
              className="text-base font-semibold tracking-tight"
              style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
            >
              {t.nav_brand}
            </span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-400">
            <a href="#analyze" className="hover:text-white transition-colors">{t.nav_analyze}</a>
            <a href="#transparency" className="hover:text-white transition-colors">{t.nav_transparency}</a>
            <a href="#rules" className="hover:text-white transition-colors">{t.nav_docs}</a>
          </nav>
          <div className="flex items-center gap-1 rounded-md border border-[#292d30] p-1">
            {UI_LANGS.map((l) => (
              <button
                key={l}
                onClick={() => setUiLang(l)}
                className={`px-2 py-1 text-xs rounded ${
                  uiLang === l ? "bg-white text-black" : "text-neutral-400 hover:text-white"
                }`}
                aria-pressed={uiLang === l}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिं" : "Hg"}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12 w-full">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 text-xs text-emerald-400 mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.hero_eyebrow}</span>
          </div>
          <h1
            className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-4"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            {t.hero_title}
          </h1>
          <p className="text-neutral-400 text-base md:text-lg leading-relaxed mb-4">
            {t.hero_subtitle}
          </p>
          <p className="text-neutral-500 italic text-sm md:text-base border-l-2 border-emerald-500/50 pl-4">
            {t.hero_quote}
          </p>
        </div>
      </section>

      {/* Analyzer */}
      <section id="analyze" className="max-w-6xl mx-auto px-6 pb-16 w-full">
        <div className="grid lg:grid-cols-[1fr_320px] gap-6">
          {/* Dropzone / paste */}
          <div
            className="rounded-xl p-6"
            style={{ background: "#0f0f0f", border: "1px solid #292d30" }}
          >
            {!showPaste ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className="cursor-pointer rounded-lg p-10 text-center transition-colors hover:bg-white/[0.02]"
                style={{ border: "1px dashed #3a3f44", background: "transparent" }}
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
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-emerald-400" />
                      </div>
                      <div className="text-sm text-white font-medium">{file.name}</div>
                      <div className="text-xs text-neutral-500">{(file.size / 1024).toFixed(1)} KB</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFile(null);
                        }}
                        className="text-xs text-neutral-400 hover:text-white flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> {t.dropzone_clear}
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
                      <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-[#292d30] flex items-center justify-center">
                        <Upload className="w-6 h-6 text-neutral-400" />
                      </div>
                      <div className="text-base text-white font-medium">{t.dropzone_title}</div>
                      <div className="text-xs text-neutral-500 max-w-sm">{t.dropzone_subtitle}</div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          inputRef.current?.click();
                        }}
                        className="mt-2 px-4 py-2 text-sm rounded-md bg-white text-black font-medium hover:bg-neutral-200"
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
                  className="w-full h-48 p-4 rounded-lg text-sm bg-transparent border border-[#292d30] focus:border-emerald-500/60 outline-none resize-y text-neutral-200 placeholder:text-neutral-600"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setPastedText("")}
                    className="text-xs text-neutral-400 hover:text-white"
                  >
                    {t.dropzone_clear}
                  </button>
                </div>
              </div>
            )}

            {/* Mode switch */}
            <div className="mt-4 flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => setShowPaste(false)}
                className={`px-2 py-1 rounded ${!showPaste ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                <span className="inline-flex items-center gap-1"><FileText className="w-3 h-3" /> File</span>
              </button>
              <button
                type="button"
                onClick={() => setShowPaste(true)}
                className={`px-2 py-1 rounded ${showPaste ? "text-white" : "text-neutral-500 hover:text-neutral-300"}`}
              >
                {t.dropzone_or_paste}
              </button>
            </div>

            {/* Format hints */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-neutral-500">
              <div className="flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> {t.dropzone_pdf_hint}</div>
              <div className="flex items-center gap-2"><ImageIcon className="w-3.5 h-3.5" /> {t.dropzone_image_hint}</div>
              <div className="flex items-center gap-2"><Upload className="w-3.5 h-3.5" /> {t.dropzone_zip_hint}</div>
            </div>
          </div>

          {/* Selectors */}
          <div
            className="rounded-xl p-6 flex flex-col gap-5"
            style={{ background: "#0f0f0f", border: "1px solid #292d30" }}
          >
            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                {t.selector_sector_label}
              </div>
              <div className="flex flex-col gap-2">
                {SECTORS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setSector(s.id)}
                    className={`text-left px-3 py-2 rounded-md text-sm border transition-colors ${
                      sector === s.id
                        ? "bg-white/[0.05] border-emerald-500/50 text-white"
                        : "border-[#292d30] text-neutral-400 hover:text-white hover:border-[#3a3f44]"
                    }`}
                  >
                    {t[s.labelKey] as string}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-xs uppercase tracking-wider text-neutral-500 mb-2">
                {t.selector_doc_lang_label}
              </div>
              <div className="flex gap-2">
                {DOC_LANGS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setDocLanguage(l.id)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs border transition-colors ${
                      docLanguage === l.id
                        ? "bg-white/[0.05] border-emerald-500/50 text-white"
                        : "border-[#292d30] text-neutral-400 hover:text-white"
                    }`}
                  >
                    {t[l.labelKey] as string}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={analyze}
              disabled={
                stage.kind === "uploading" ||
                stage.kind === "parsing" ||
                stage.kind === "matching" ||
                (!file && pastedText.trim().length < 30)
              }
              className="mt-2 w-full px-4 py-3 rounded-md text-sm font-medium bg-emerald-500 text-black hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {stage.kind === "uploading" || stage.kind === "parsing" || stage.kind === "matching" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {stage.kind === "uploading" ? t.status_uploading : stage.kind === "parsing" ? t.status_parsing : t.status_matching}
                </>
              ) : (
                <>{t.hero_cta}</>
              )}
            </button>

            {(stage.kind === "uploading" || stage.kind === "parsing" || stage.kind === "matching") && (
              <div className="text-xs text-neutral-500 space-y-1.5 mt-1">
                <ProgressLine done={stage.kind !== "uploading"} label={t.status_uploading} />
                <ProgressLine done={stage.kind === "matching"} label={t.status_parsing} />
                <ProgressLine done={stage.kind === "matching"} label={t.status_matching} />
                <ProgressLine done={false} label={t.status_explaining} />
              </div>
            )}
          </div>
        </div>

        {/* Result */}
        <AnimatePresence>
          {stage.kind === "error" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-6 p-4 rounded-lg border border-red-500/30 bg-red-500/[0.05] text-red-300 text-sm flex items-start gap-2"
            >
              <AlertTriangle className="w-4 h-4 mt-0.5" />
              <div>
                <div className="font-medium">{t.status_error}</div>
                <div className="text-red-400/80 text-xs mt-1">{stage.message}</div>
              </div>
            </motion.div>
          )}
          {stage.kind === "done" && (
            <ReportView result={stage.result} uiLang={uiLang} onBack={reset} t={t} />
          )}
        </AnimatePresence>
      </section>

      {/* Transparency */}
      <section id="transparency" className="max-w-6xl mx-auto px-6 pb-16 w-full">
        <div className="grid md:grid-cols-2 gap-6">
          <Panel title={t.transparency_no_logging_heading}>
            <p className="text-sm text-neutral-400 leading-relaxed">{t.transparency_no_logging_body}</p>
          </Panel>
          <Panel title={t.transparency_ai_role_heading}>
            <p className="text-sm text-neutral-400 leading-relaxed">{t.transparency_ai_role_body}</p>
          </Panel>
          <Panel title={t.transparency_disclaimer_heading}>
            <p className="text-sm text-neutral-400 leading-relaxed">{t.transparency_disclaimer_body}</p>
          </Panel>
          <Panel title={t.transparency_legal_basis_heading}>
            <p className="text-sm text-neutral-400 leading-relaxed mb-3">
              {interpolate(t.transparency_rules_count, { count: totalRuleCount })}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {["RERA", "RBI", "BIS", "ICA", "CoSS 2020", "DPDP 2023", "IDA 1947", "CPC"].map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-1 rounded border border-[#292d30] text-neutral-400">{tag}</span>
              ))}
            </div>
          </Panel>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="mt-auto border-t py-6 text-center text-xs text-neutral-600"
        style={{ borderColor: "#292d30" }}
      >
        {t.footer_built}
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small presentational helpers
// ---------------------------------------------------------------------------

function ProgressLine({ done, label }: { done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      {done ? (
        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-neutral-500" />
      )}
      <span className={done ? "text-neutral-300" : "text-neutral-500"}>{label}</span>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ background: "#0f0f0f", border: "1px solid #292d30" }}>
      <h3
        className="text-sm font-medium text-white mb-2"
        style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
      >
        {title}
      </h3>
      {children}
    </div>
  );
}

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
      className="mt-6 rounded-xl p-6"
      style={{ background: "#0f0f0f", border: "1px solid #292d30" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{t.report_title}</div>
          <div
            className="text-2xl font-semibold"
            style={{ fontFamily: "DM Serif Display, Georgia, serif" }}
          >
            {tone.label}
          </div>
        </div>
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-md text-xs border border-[#292d30] text-neutral-300 hover:text-white hover:border-[#3a3f44] flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3 h-3" />
          {t.report_back}
        </button>
      </div>

      {/* Risk score + meta */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 mb-6">
        <div>
          <div className="flex items-baseline gap-3 mb-2">
            <span className="text-5xl font-semibold" style={{ fontFamily: "JetBrains Mono, monospace" }}>
              {result.riskScore}
            </span>
            <span className={`text-sm ${tone.color}`}>{t.report_risk_score} / 100</span>
          </div>
          <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${result.riskScore}%` }}
              transition={{ duration: 0.6 }}
              className={`h-full ${tone.bar}`}
            />
          </div>
        </div>
        <div className="text-xs text-neutral-500 space-y-1">
          <div>Sector: <span className="text-neutral-300">{result.sector}</span></div>
          <div>Document language: <span className="text-neutral-300">{result.docLanguage}</span></div>
          <div>Rules considered: <span className="text-neutral-300">{result.rulesConsidered}</span></div>
          <div>Analysis time: <span className="text-neutral-300">{result.pipelineMs} ms</span></div>
        </div>
      </div>

      {/* Optional message */}
      {result.message && (
        <div className="mb-4 p-3 rounded-md border border-amber-500/30 bg-amber-500/[0.05] text-amber-300 text-xs">
          {result.message}
        </div>
      )}

      {/* Clauses */}
      <div className="text-xs uppercase tracking-wider text-neutral-500 mb-3">
        {t.report_clauses_found} ({result.clauses.length})
      </div>
      {result.clauses.length === 0 ? (
        <div className="text-sm text-neutral-400 p-4 rounded-md border border-[#292d30]">
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
                className={`rounded-lg p-4 border-l-2 ${style.ring}`}
                style={{ background: "#0a0a0a", border: "1px solid #292d30" }}
              >
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${style.chip}`}>
                      {style.label}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded border border-[#292d30] text-neutral-400">
                      {c.category}
                    </span>
                    <span className="text-[10px] text-neutral-500" style={{ fontFamily: "JetBrains Mono, monospace" }}>
                      {c.ruleId}
                    </span>
                  </div>
                </div>

                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{t.report_snippet}</div>
                <blockquote
                  className="text-sm text-neutral-300 mb-4 pl-3 border-l-2 border-[#3a3f44] italic"
                  style={{ fontFamily: "JetBrains Mono, monospace" }}
                >
                  {c.snippet}
                </blockquote>

                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{t.report_explanation}</div>
                <p className="text-sm text-neutral-200 leading-relaxed mb-4">{explanation}</p>

                <div className="text-xs uppercase tracking-wider text-neutral-500 mb-1">{t.report_legal_basis}</div>
                <p className="text-xs text-neutral-400 leading-relaxed">{c.legalBasis}</p>

                {c.roadmapNote && (
                  <>
                    <div className="text-xs uppercase tracking-wider text-neutral-500 mt-3 mb-1">
                      {t.report_roadmap_note}
                    </div>
                    <p className="text-xs text-amber-400/80">{c.roadmapNote}</p>
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

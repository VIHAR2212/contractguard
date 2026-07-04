"use client";

// ===========================================================================
// useRateLimit — client-side Groq free-tier capacity tracker
// ---------------------------------------------------------------------------
// Groq's free tier enforces two shared rate limits:
//   • 30 requests / minute  (rolling 60-second window)
//   • 14,400 requests / day (calendar day, UTC)
//
// We can't read Groq's actual remaining-quota header from the browser
// (the API route consumes it server-side), so we approximate by logging
// every Analyze click in localStorage with a timestamp. The hook then
// rolls off entries older than the window and exposes:
//   • usedMinute / remainingMinute  (out of 30)
//   • usedDay / remainingDay        (out of 14,400)
//   • usedWeek                      (rolling 7-day count, for the % indicator)
//   • lifetime                      (total analyses ever, for the badge)
//   • recordAnalysis()              (call when the user clicks Analyze)
//
// All numbers are scoped to THIS browser — they reflect what the current
// user has consumed, not what the whole world has consumed. That's the
// most honest signal we can show without a backend quota proxy.
// ===========================================================================

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cg_rate_limit_v1";

// Groq free-tier caps (per key, shared across all users of that key)
export const GROQ_CAP_MINUTE = 30;
export const GROQ_CAP_DAY = 14_400;
// Personal weekly allowance — a sensible "you've been using this a lot"
// threshold for an individual user, not Groq's hard cap.
export const PERSONAL_WEEKLY_CAP = 1000;

interface RateLimitState {
  /** ms timestamps of every Analyze click in the last 60 seconds */
  minuteWindow: number[];
  /** ms timestamps of every Analyze click in the last 24 hours */
  dayWindow: number[];
  /** ms timestamps of every Analyze click in the last 7 days */
  weekWindow: number[];
  /** lifetime total Analyze clicks */
  lifetime: number;
}

type StoredShape = RateLimitState;

function emptyState(): RateLimitState {
  return { minuteWindow: [], dayWindow: [], weekWindow: [], lifetime: 0 };
}

function loadState(): RateLimitState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyState();
    const parsed = JSON.parse(raw) as Partial<StoredShape>;
    return {
      minuteWindow: Array.isArray(parsed.minuteWindow) ? parsed.minuteWindow : [],
      dayWindow: Array.isArray(parsed.dayWindow) ? parsed.dayWindow : [],
      weekWindow: Array.isArray(parsed.weekWindow) ? parsed.weekWindow : [],
      lifetime: typeof parsed.lifetime === "number" ? parsed.lifetime : 0,
    };
  } catch {
    return emptyState();
  }
}

function saveState(s: RateLimitState) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* quota exceeded or disabled — silently ignore */
  }
}

function prune(s: RateLimitState, now: number): RateLimitState {
  const minuteAgo = now - 60_000;
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  return {
    minuteWindow: s.minuteWindow.filter((t) => t > minuteAgo),
    dayWindow: s.dayWindow.filter((t) => t > dayAgo),
    weekWindow: s.weekWindow.filter((t) => t > weekAgo),
    lifetime: s.lifetime,
  };
}

export interface RateLimitInfo {
  /** analyses fired in the last 60 seconds */
  usedMinute: number;
  /** analyses still allowed in the current minute window */
  remainingMinute: number;
  /** analyses fired in the last 24 hours */
  usedDay: number;
  /** analyses still allowed today */
  remainingDay: number;
  /** analyses fired in the last 7 days */
  usedWeek: number;
  /** percentage of personal weekly allowance consumed (0-100, clamped) */
  weekPercent: number;
  /** lifetime total analyses from this browser */
  lifetime: number;
  /** true once the minute window is over 80% consumed */
  minuteStressed: boolean;
  /** true once the day window is over 80% consumed */
  dayStressed: boolean;
  /** call when the user actually clicks Analyze */
  recordAnalysis: () => void;
  /** ms until the next minute-window roll (used for live countdown UI) */
  msUntilMinuteRoll: number;
}

export function useRateLimit(): RateLimitInfo {
  // Lazy initializer runs once on first render. On the server (SSR)
  // `loadState()` returns `emptyState()` because `window` is undefined,
  // so the server and client agree on the initial shape. On the client
  // it reads from localStorage and prunes stale entries in the same
  // pass — no mount effect needed, no cascading renders.
  const [state, setState] = useState<RateLimitState>(() => prune(loadState(), Date.now()));
  const [now, setNow] = useState<number>(() => Date.now());

  // Persist any state changes back to localStorage. This is a pure
  // side-effect of state changing, not a "load on mount" — the rule
  // about not calling setState in effects doesn't apply here because
  // we're only writing outward.
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Tick once per second so the countdown + progress bar feel alive.
  // The setState inside the interval callback is fine — it's an async
  // callback, not a synchronous call in the effect body.
  useEffect(() => {
    const id = window.setInterval(() => {
      const t = Date.now();
      setNow(t);
      // Prune on every tick so the visible numbers stay accurate.
      setState((prev) => prune(prev, t));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const recordAnalysis = useCallback(() => {
    const t = Date.now();
    setState((prev) => {
      const pruned = prune(prev, t);
      const next: RateLimitState = {
        minuteWindow: [...pruned.minuteWindow, t],
        dayWindow: [...pruned.dayWindow, t],
        weekWindow: [...pruned.weekWindow, t],
        lifetime: pruned.lifetime + 1,
      };
      saveState(next);
      return next;
    });
  }, []);

  const usedMinute = state.minuteWindow.length;
  const usedDay = state.dayWindow.length;
  const usedWeek = state.weekWindow.length;

  const remainingMinute = Math.max(0, GROQ_CAP_MINUTE - usedMinute);
  const remainingDay = Math.max(0, GROQ_CAP_DAY - usedDay);
  const weekPercent = Math.min(100, Math.round((usedWeek / PERSONAL_WEEKLY_CAP) * 100));

  // ms until the oldest entry in the minute window rolls off — gives the
  // user a sense of "wait X seconds and you'll get capacity back."
  const oldestInMinute = state.minuteWindow[0] ?? now;
  const msUntilMinuteRoll = Math.max(0, oldestInMinute + 60_000 - now);

  return {
    usedMinute,
    remainingMinute,
    usedDay,
    remainingDay,
    usedWeek,
    weekPercent,
    lifetime: state.lifetime,
    minuteStressed: usedMinute >= GROQ_CAP_MINUTE * 0.8,
    dayStressed: usedDay >= GROQ_CAP_DAY * 0.8,
    recordAnalysis,
    msUntilMinuteRoll,
  };
}

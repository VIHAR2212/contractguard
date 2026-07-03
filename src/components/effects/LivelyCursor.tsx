"use client";

// ===========================================================================
// /components/effects/LivelyCursor.tsx
// ---------------------------------------------------------------------------
// Replaces the system cursor with a small trailing dot + ring, plus a
// folded-corner "paper" glyph riding the ring — a quiet nod to the same
// paper motif as the storm background, without competing with it.
//
// Position is driven by refs updated in a requestAnimationFrame loop and
// applied with `transform: translate3d(...)`, never React state, so
// mouse movement does not trigger 60 re-renders a second.
//
// Only activates for desktop-class pointers: `(hover: hover) and
// (pointer: fine)`. Touch devices are left completely untouched — no
// listeners are attached and the system cursor is never hidden. Also
// disabled under `prefers-reduced-motion: reduce`, matching the rest of
// the app's motion policy.
// ===========================================================================

import { useEffect, useRef } from "react";

const DOT_EASE = 0.35;
const RING_EASE = 0.14;
const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, [role="button"], [data-cursor-hover]';

export default function LivelyCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);
  const cornerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canHover =
      typeof window !== "undefined" &&
      window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reduceMotion) return; // leave native cursor completely alone

    const root = rootRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const corner = cornerRef.current;
    if (!root || !dot || !ring || !corner) return;

    const prevCursor = document.body.style.cursor;
    document.body.style.cursor = "none";

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let dotX = targetX;
    let dotY = targetY;
    let ringX = targetX;
    let ringY = targetY;
    let spin = 0;
    let hovering = false;
    let visible = false;

    function setVisible(v: boolean) {
      if (visible === v || !root) return;
      visible = v;
      root.style.opacity = v ? "1" : "0";
    }

    function onMove(e: MouseEvent) {
      targetX = e.clientX;
      targetY = e.clientY;
      setVisible(true);
    }

    function onLeave() {
      setVisible(false);
    }

    function onOver(e: MouseEvent) {
      const el = e.target as Element | null;
      hovering = !!el?.closest?.(INTERACTIVE_SELECTOR);
    }

    function onDown() {
      if (!root) return;
      const pulse = document.createElement("div");
      pulse.style.cssText = `
        position: fixed;
        left: ${ringX}px;
        top: ${ringY}px;
        width: 8px;
        height: 8px;
        margin: -4px 0 0 -4px;
        border-radius: 9999px;
        border: 1px solid #9a9a9a;
        pointer-events: none;
        z-index: 9998;
        transition: transform 480ms cubic-bezier(0.16, 1, 0.3, 1), opacity 480ms ease-out;
        transform: scale(1);
        opacity: 0.5;
      `;
      document.body.appendChild(pulse);
      requestAnimationFrame(() => {
        pulse.style.transform = "scale(5)";
        pulse.style.opacity = "0";
      });
      setTimeout(() => pulse.remove(), 520);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("mousedown", onDown);
    document.documentElement.addEventListener("mouseleave", onLeave);

    let rafId = 0;
    function step() {
      rafId = requestAnimationFrame(step);
      dotX += (targetX - dotX) * DOT_EASE;
      dotY += (targetY - dotY) * DOT_EASE;
      ringX += (targetX - ringX) * RING_EASE;
      ringY += (targetY - ringY) * RING_EASE;
      spin += 0.35 + Math.hypot(targetX - ringX, targetY - ringY) * 0.02;

      if (dot) dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0) translate(-50%, -50%)`;
      if (ring) {
        const scale = hovering ? 1.7 : 1;
        ring.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${scale})`;
      }
      if (corner) {
        corner.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) rotate(${spin}deg)`;
      }
    }
    rafId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.body.style.cursor = prevCursor;
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      style={{ opacity: 0, transition: "opacity 200ms ease" }}
    >
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 26,
          height: 26,
          borderRadius: "9999px",
          border: "1px solid #6b6b6b",
          pointerEvents: "none",
          zIndex: 9999,
          transition: "transform 60ms linear",
          willChange: "transform",
        }}
      />
      <div
        ref={cornerRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 6,
          height: 6,
          borderTop: "1px solid #9a9a9a",
          borderRight: "1px solid #9a9a9a",
          marginTop: -16,
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
        }}
      />
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          left: 0,
          top: 0,
          width: 4,
          height: 4,
          borderRadius: "9999px",
          background: "#e8e8e8",
          pointerEvents: "none",
          zIndex: 9999,
          willChange: "transform",
        }}
      />
    </div>
  );
}

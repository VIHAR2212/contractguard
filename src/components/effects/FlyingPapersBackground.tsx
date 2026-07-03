"use client";

// ===========================================================================
// /components/effects/FlyingPapersBackground.tsx
// ---------------------------------------------------------------------------
// Ambient canvas background: small paper-like rectangles blown across the
// viewport on a diagonal wind, with a slowly breathing "storm intensity"
// so the gust visibly gathers and passes rather than running at one
// constant speed forever. Every paper is always either arriving (entering
// from the up-wind edge) or leaving (exiting off the down-wind edge) —
// there is no static resting state.
//
// Design constraints carried over from page.tsx's own documented system:
//   - No color. Papers are drawn in the same neutral grey / off-white
//     values already used in globals.css (#e8e8e8, #9a9a9a, #6b6b6b).
//     Color in this app means clause severity — nothing else.
//   - Very low opacity. This is atmosphere behind the content, not a
//     second thing competing for attention with the report.
//   - `prefers-reduced-motion: reduce` disables the whole effect — no
//     canvas is even drawn to, matching the reduced-motion rule already
//     in globals.css for the rest of the app.
//   - Fully inert to input: `pointer-events: none`, so it never steals a
//     click, drag, or hover from real UI sitting above it.
// ===========================================================================

import { useEffect, useRef } from "react";

interface Paper {
  x: number;
  y: number;
  w: number;
  h: number;
  rotation: number; // radians
  rotationSpeed: number; // radians / sec
  depth: number; // 0 (far / slow / faint) .. 1 (near / fast / clearer)
  speed: number; // base px/sec at windStrength = 1
  wobbleAmp: number; // px, perpendicular to wind direction
  wobbleFreq: number; // radians / sec
  wobblePhase: number;
  opacity: number;
}

// Wind blows down-and-right, with a slow drift in the exact angle so the
// gust direction doesn't feel perfectly mechanical.
const BASE_WIND_ANGLE = (28 * Math.PI) / 180;
const ANGLE_DRIFT = (7 * Math.PI) / 180;

function countForWidth(width: number): number {
  if (width < 480) return 8;
  if (width < 900) return 12;
  return 18;
}

function makePaper(width: number, height: number, spawnEdgeOnly: boolean): Paper {
  const depth = Math.random();
  const size = 22 + depth * 26; // 22 – 48 px
  const diag = Math.hypot(width, height);

  // Spawn along the up-wind edge (a band that runs off the top-left,
  // roughly perpendicular to the wind angle) with generous jitter so
  // papers don't all enter in a single visible line.
  let x: number;
  let y: number;
  if (spawnEdgeOnly) {
    const along = Math.random() * diag - diag * 0.15;
    x = -size - along * Math.sin(BASE_WIND_ANGLE) * 0.4 - Math.random() * width * 0.3;
    y = -size + along * Math.cos(BASE_WIND_ANGLE) * 0.4 - Math.random() * height * 0.3;
  } else {
    // Initial population: scatter across the whole viewport so the storm
    // is already mid-flight on first paint instead of empty for a beat.
    x = Math.random() * (width + diag * 0.4) - diag * 0.2;
    y = Math.random() * (height + diag * 0.4) - diag * 0.2;
  }

  return {
    x,
    y,
    w: size,
    h: size * 1.3,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() * 2 - 1) * (0.35 + depth * 0.55),
    depth,
    speed: 16 + depth * 34,
    wobbleAmp: 5 + depth * 14,
    wobbleFreq: 0.25 + Math.random() * 0.35,
    wobblePhase: Math.random() * Math.PI * 2,
    opacity: 0.045 + depth * 0.12,
  };
}

function drawPaper(ctx: CanvasRenderingContext2D, p: Paper, windStrength: number) {
  const alpha = p.opacity * (0.7 + windStrength * 0.3);
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  // Body
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#e8e8e8";
  ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);

  // Hairline border, slightly stronger than the fill so the silhouette
  // reads even at very low opacity — matches the app's own hairline
  // border language (#242424 / #3a3a3a) rather than a glow or shadow.
  ctx.globalAlpha = Math.min(1, alpha * 1.8);
  ctx.strokeStyle = "#9a9a9a";
  ctx.lineWidth = 1;
  ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);

  // Folded corner — a small triangle cut, the one recognizable "this is
  // a piece of paper, not a card" cue.
  const fold = p.w * 0.32;
  ctx.beginPath();
  ctx.moveTo(p.w / 2 - fold, -p.h / 2);
  ctx.lineTo(p.w / 2, -p.h / 2);
  ctx.lineTo(p.w / 2, -p.h / 2 + fold);
  ctx.closePath();
  ctx.globalAlpha = Math.min(1, alpha * 2.2);
  ctx.fillStyle = "#000000";
  ctx.fill();
  ctx.stroke();

  // A few faint text lines — implies a printed contract without ever
  // drawing (or claiming to draw) real text.
  ctx.globalAlpha = Math.min(1, alpha * 1.3);
  ctx.strokeStyle = "#6b6b6b";
  ctx.lineWidth = 1;
  const lineCount = 3;
  for (let i = 0; i < lineCount; i++) {
    const ly = -p.h / 2 + p.h * (0.32 + i * 0.2);
    const lw = p.w * (0.5 + (i % 2) * 0.14);
    ctx.beginPath();
    ctx.moveTo(-p.w / 2 + p.w * 0.14, ly);
    ctx.lineTo(-p.w / 2 + p.w * 0.14 + lw, ly);
    ctx.stroke();
  }

  ctx.restore();
}

export default function FlyingPapersBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return; // effect fully disabled — see file header

    const canvas = canvasRef.current;
    if (!canvas) return;
    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    const ctx: CanvasRenderingContext2D = maybeCtx; // fresh, non-null binding so nested
    // closures below don't need to re-check — TS doesn't narrow `const` through
    // function boundaries, even when it structurally can't be reassigned.

    let width = window.innerWidth;
    let height = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let papers: Paper[] = [];

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (!canvas) return;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);

      const target = countForWidth(width);
      if (papers.length === 0) {
        papers = Array.from({ length: target }, () => makePaper(width, height, false));
      } else if (papers.length < target) {
        papers.push(
          ...Array.from({ length: target - papers.length }, () => makePaper(width, height, true))
        );
      } else if (papers.length > target) {
        papers.length = target;
      }
    }

    resize();
    window.addEventListener("resize", resize);

    let rafId = 0;
    let last = performance.now();
    let elapsed = 0; // drives the storm-intensity breathing, paused while hidden

    function step(now: number) {
      rafId = requestAnimationFrame(step);
      const dt = Math.min((now - last) / 1000, 0.05); // clamp so tab-switch gaps don't jump papers
      last = now;
      elapsed += dt;

      // Storm intensity: two out-of-phase sine waves so the gust gathers
      // and eases rather than pulsing on a single obvious beat.
      const windStrength =
        0.4 +
        0.35 * (0.5 + 0.5 * Math.sin(elapsed / 9.5)) +
        0.25 * (0.5 + 0.5 * Math.sin(elapsed / 23 + 1.7));
      const windAngle = BASE_WIND_ANGLE + Math.sin(elapsed / 31) * ANGLE_DRIFT;
      const dx = Math.cos(windAngle);
      const dy = Math.sin(windAngle);
      const px = -dy; // perpendicular, for wobble
      const py = dx;

      ctx.clearRect(0, 0, width, height);

      for (const p of papers) {
        const v = p.speed * windStrength;
        p.x += dx * v * dt;
        p.y += dy * v * dt;
        p.rotation += p.rotationSpeed * windStrength * dt;

        const wobble = Math.sin(elapsed * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        const drawX = p.x + px * wobble;
        const drawY = p.y + py * wobble;

        const margin = Math.max(p.w, p.h) + 40;
        if (drawX > width + margin || drawY > height + margin) {
          Object.assign(p, makePaper(width, height, true));
          continue;
        }

        drawPaper(ctx, { ...p, x: drawX, y: drawY }, windStrength);
      }
    }

    function handleVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(rafId);
      } else {
        last = performance.now();
        rafId = requestAnimationFrame(step);
      }
    }

    rafId = requestAnimationFrame(step);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

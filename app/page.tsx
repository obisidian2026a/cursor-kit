"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { CURSORS, TAG_COLORS, TAG_TEXT } from "@/lib/cursors";
import type { CursorMeta } from "@/lib/cursors";

gsap.registerPlugin(useGSAP, ScrollTrigger);

// ─── Shared RAF ticker ─────────────────────────────────────────────────────────
// Single global frame counter — all canvases read from it.
// Prevents 40 separate requestAnimationFrame loops competing.
let globalFrame   = 0;
const subscribers = new Set<() => void>();
let globalRaf: number | null = null;

function globalTick() {
  globalFrame++;
  subscribers.forEach((fn) => fn());
  globalRaf = requestAnimationFrame(globalTick);
}

function subscribeCanvas(fn: () => void) {
  if (subscribers.size === 0) {
    globalRaf = requestAnimationFrame(globalTick);
  }
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0 && globalRaf !== null) {
      cancelAnimationFrame(globalRaf);
      globalRaf = null;
    }
  };
}

// ─── Mini animated canvas preview ─────────────────────────────────────────────
// Only runs draw() when the canvas is visible in the viewport.
function MiniPreview({ id }: { id: number }) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    const W   = canvas.width  = 320;
    const H   = canvas.height = 160;
    const v   = id % 5;

    // ── IntersectionObserver: only animate when visible ──────────────────────
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0.1 }
    );
    observer.observe(canvas);

    // ── Draw function (called by shared ticker) ───────────────────────────────
    function draw() {
      if (!visibleRef.current) return; // skip if off-screen

      const t  = globalFrame / 60;
      const cx = W / 2 + Math.sin(t * 1.1) * 65;
      const cy = H / 2 + Math.cos(t * 0.85) * 24;

      ctx.clearRect(0, 0, W, H);

      switch (v) {
        case 0: {
          for (let i = 0; i < 10; i++) {
            const ti = t - i * 0.1;
            const x  = W / 2 + Math.sin(ti * 1.1) * 65;
            const y  = H / 2 + Math.cos(ti * 0.85) * 24;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, 5 - i * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${(1 - i / 10) * 0.85})`;
            ctx.fill();
          }
          break;
        }
        case 1: {
          for (let r = 1; r <= 3; r++) {
            const p = ((t * 0.5 + r * 0.33) % 1);
            ctx.beginPath();
            ctx.arc(cx, cy, p * 38, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(99,210,255,${(1 - p) * 0.7})`;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
          break;
        }
        case 2: {
          const hue = (globalFrame * 2) % 360;
          ctx.save();
          ctx.shadowColor = `hsl(${hue},100%,60%)`;
          ctx.shadowBlur  = 14;
          ctx.strokeStyle = `hsl(${hue},100%,75%)`;
          ctx.lineWidth   = 2;
          ctx.lineCap     = "round";
          ctx.beginPath();
          for (let i = 0; i < 50; i++) {
            const ti = t - i * 0.035;
            const x  = W / 2 + Math.sin(ti * 1.1) * 65;
            const y  = H / 2 + Math.cos(ti * 0.85) * 24;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke();
          ctx.restore();
          break;
        }
        case 3: {
          const C = ["#e2ff00", "#ff6b35", "#00d4ff", "#ff3cac", "#a0ff82"];
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2 + t;
            const d = 18 + Math.sin(t * 2 + i) * 8;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3, 0, Math.PI * 2);
            ctx.fillStyle = C[i % 5];
            ctx.fill();
          }
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
          break;
        }
        case 4: {
          const pts = Array.from({ length: 5 }, (_, i) => ({
            x: W / 2 + Math.sin(t * 0.4 + i * 1.3) * 65,
            y: H / 2 + Math.cos(t * 0.55 + i * 1.1) * 24,
          }));
          pts.forEach((a, i) => pts.forEach((b, j) => {
            if (j <= i) return;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 85) {
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 85) * 0.45})`;
              ctx.lineWidth   = 0.8; ctx.stroke();
            }
          }));
          pts.forEach((p) => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
          });
          break;
        }
      }
    }

    const unsubscribe = subscribeCanvas(draw);

    return () => {
      unsubscribe();
      observer.disconnect();
    };
  }, [id]);

  return (
    <canvas
      ref={canvasRef}
      width={320}
      height={160}
      className="w-full h-full"
    />
  );
}

// ─── Cursor Card ──────────────────────────────────────────────────────────────
// Cards are always visible (opacity:1) by default.
// CSS handles the reveal animation via animation-delay — no GSAP opacity risk.
function Card({ cursor, index }: { cursor: CursorMeta; index: number }) {
  return (
    <Link
      href={`/cursor/${cursor.slug}`}
      className="ck-card group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
      style={{
        // CSS keyframe reveal — always ends at opacity:1 so it never gets stuck
        animationDelay: `${index * 35}ms`,
      }}
    >
      {/* Preview */}
      <div className="relative overflow-hidden bg-black/40" style={{ aspectRatio: "2/1" }}>
        <MiniPreview id={cursor.id} />
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            Preview <span className="text-lg leading-none">→</span>
          </span>
        </div>
        <div className="absolute left-3 top-3 flex h-5 w-7 items-center justify-center rounded-md bg-black/60 text-[10px] font-medium text-white/40 backdrop-blur-sm">
          {String(cursor.id).padStart(2, "0")}
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-snug text-white">{cursor.name}</h3>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
            style={{ background: TAG_COLORS[cursor.tag], color: TAG_TEXT[cursor.tag] }}
          >
            {cursor.tag}
          </span>
        </div>
        <p className="text-xs leading-relaxed text-white/35">{cursor.desc}</p>
      </div>
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const [copied,  setCopied]  = useState(false);
  const [filter,  setFilter]  = useState<"All" | "DOM" | "Canvas" | "CSS">("All");

  // Stable filtered list — index resets on filter change so CSS delays restart
  const filtered = filter === "All" ? CURSORS : CURSORS.filter(c => c.tag === filter);

  function copyInstall() {
    navigator.clipboard.writeText("npm install cursor-kit");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Hero entrance (GSAP only for hero elements, not cards) ────────────────
  useGSAP(() => {
    gsap.timeline({ defaults: { ease: "power4.out" } })
      .from(".hero-eyebrow", { y: 20, opacity: 0, duration: 0.7 })
      .from(".hero-title",   { y: 60, opacity: 0, duration: 1.0, stagger: 0.08 }, "-=0.4")
      .from(".hero-sub",     { y: 30, opacity: 0, duration: 0.8 }, "-=0.5")
      .from(".hero-actions", { y: 20, opacity: 0, duration: 0.6 }, "-=0.5")
      .from(".hero-stat",    { y: 20, opacity: 0, duration: 0.5, stagger: 0.07 }, "-=0.4")
      .from(".hero-marquee", { opacity: 0, duration: 0.8 }, "-=0.3");
  }, { scope: heroRef });

  const MARQUEE_ITEMS = [...CURSORS.map(c => c.name), ...CURSORS.map(c => c.name)];

  return (
    <div
      className="min-h-screen overflow-x-hidden bg-[#080808] text-white"
      style={{ fontFamily: "var(--font-mulish), sans-serif" }}
    >
      <style>{`
        :root {
          --accent:  #e2ff6b;
          --accent2: #63d2ff;
          --border:  rgba(255,255,255,0.07);
          --surface: rgba(255,255,255,0.03);
        }

        ::selection { background: var(--accent); color: #080808; }

        /* ── Card CSS reveal animation ──
           Cards always START visible (forwards fill keeps final opacity:1).
           This avoids GSAP ScrollTrigger not firing for in-viewport cards. */
        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        .ck-card {
          opacity: 0;
          animation: cardReveal 0.5s ease forwards;
        }

        /* Marquee */
        @keyframes marquee { from { transform: translateX(0) } to { transform: translateX(-50%) } }
        .marquee-inner { animation: marquee 28s linear infinite; display: flex; gap: 0; width: max-content; }
        .marquee-inner:hover { animation-play-state: paused; }

        /* Grain */
        .grain::after {
          content: '';
          position: fixed; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
          pointer-events: none; z-index: 100; opacity: 0.5;
        }

        .orb { position: fixed; border-radius: 50%; filter: blur(130px); pointer-events: none; z-index: 0; }

        .install-box {
          background: rgba(255,255,255,0.04);
          border: 1px solid var(--border);
          border-radius: 14px;
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }
        .install-box:hover { border-color: rgba(255,255,255,0.18); background: rgba(255,255,255,0.06); }

        .code-block {
          background: rgba(255,255,255,0.02);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
          font-family: 'Fira Code', 'JetBrains Mono', monospace;
          font-size: 0.82rem;
          line-height: 1.7;
        }
        .code-block pre { padding: 1.5rem; overflow-x: auto; color: rgba(255,255,255,0.72); }
        .code-kw  { color: #63d2ff; }
        .code-str { color: #e2ff6b; }
        .code-fn  { color: #ffa064; }

        .filter-pill {
          border: 1px solid var(--border);
          border-radius: 100px;
          padding: 5px 16px;
          font-size: 0.78rem;
          cursor: pointer;
          transition: all 0.15s;
          color: rgba(255,255,255,0.4);
          background: transparent;
        }
        .filter-pill:hover { color: white; border-color: rgba(255,255,255,0.18); }
        .filter-pill.active { background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.28); color: white; }

        .sec-label {
          font-size: 0.7rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.28);
        }
      `}</style>

      <div className="grain" />
      <div className="orb" style={{ width:700,height:700,top:-280,left:-250,background:"radial-gradient(circle,rgba(226,255,107,0.055) 0%,transparent 70%)" }} />
      <div className="orb" style={{ width:600,height:600,top:300,right:-200,background:"radial-gradient(circle,rgba(99,210,255,0.06) 0%,transparent 70%)" }} />
      <div className="orb" style={{ width:500,height:500,bottom:0,left:"30%",background:"radial-gradient(circle,rgba(255,100,160,0.04) 0%,transparent 70%)" }} />

      {/* ── NAV ── */}
      <nav className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-6 py-5 md:px-10">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold text-[#080808]"
            style={{ background: "var(--accent)" }}>✦</div>
          <span className="text-base font-semibold tracking-tight">cursor-kit</span>
        </div>
        <div className="hidden items-center gap-8 text-sm text-white/40 md:flex">
          <a href="#cursors" className="transition-colors hover:text-white">Cursors</a>
          <a href="#install" className="transition-colors hover:text-white">Install</a>
          <a href="#usage"   className="transition-colors hover:text-white">Docs</a>
        </div>
        <div className="flex items-center gap-2">
          <a href="https://www.npmjs.com/package/cursor-kit" target="_blank" rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-lg border border-white/[0.07] px-3.5 py-2 text-xs text-white/50 transition-all hover:border-white/20 hover:text-white sm:flex">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M0 0v24h24V0H0zm19.2 19.2H4.8V4.8h14.4v14.4z"/></svg>
            npm
          </a>
          <a href="https://github.com/imran-binhasan/cursor-kit" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.07] px-3.5 py-2 text-xs text-white/50 transition-all hover:border-white/20 hover:text-white">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section ref={heroRef} className="relative z-10 mx-auto max-w-7xl px-6 pb-0 pt-16 md:px-10 md:pt-20">
        <div className="hero-eyebrow mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-white/50 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: "var(--accent)" }} />
          40 cursor effects · React + GSAP · MIT License
        </div>

        <div className="mb-6 overflow-hidden">
          <h1 className="hero-title text-[clamp(3.2rem,9vw,8.5rem)] font-semibold leading-[0.95] tracking-[-0.03em]">
            <span className="block text-white/90">Cursors</span>
            <span className="block" style={{ color: "var(--accent)", fontStyle: "italic" }}>that feel</span>
            <span className="block text-white/90">alive.</span>
          </h1>
        </div>

        <p className="hero-sub mb-10 max-w-lg text-base leading-relaxed text-white/40 md:text-lg" style={{ fontWeight: 300 }}>
          A curated collection of 40 production-ready cursor experiments.
          Drop any one into your React or Next.js project with a single import.
        </p>

        <div className="hero-actions mb-14 flex flex-wrap items-center gap-3">
          <a href="#cursors"
            className="rounded-xl px-6 py-3 text-sm font-semibold text-[#080808] transition-all hover:-translate-y-0.5 hover:opacity-90"
            style={{ background: "var(--accent)" }}>
            Browse 40 effects →
          </a>
          <a href="https://github.com/imran-binhasan/cursor-kit" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-6 py-3 text-sm text-white/60 transition-all hover:border-white/20 hover:text-white">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>
            Star on GitHub
          </a>
        </div>

        <div className="mb-16 flex flex-wrap gap-10 border-t border-white/[0.06] pt-8">
          {[{ v:"40",l:"Cursor effects"},{ v:"3",l:"Render modes"},{ v:"~4kb",l:"Per cursor"},{ v:"MIT",l:"License"}].map(s=>(
            <div key={s.l} className="hero-stat">
              <div className="text-2xl font-bold tracking-tight" style={{ color:"var(--accent)" }}>{s.v}</div>
              <div className="mt-0.5 text-xs text-white/35">{s.l}</div>
            </div>
          ))}
        </div>

        <div className="hero-marquee relative -mx-6 overflow-hidden border-y border-white/[0.06] py-3 md:-mx-10">
          <div className="marquee-inner select-none">
            {MARQUEE_ITEMS.map((name, i) => (
              <span key={i} className="inline-flex items-center gap-3 px-5 text-xs font-medium uppercase tracking-widest text-white/20">
                <span className="h-1 w-1 rounded-full" style={{ background:"var(--accent)",opacity:0.5 }} />
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── INSTALL ── */}
      <section id="install" className="relative z-10 border-y border-white/[0.06] py-16">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 md:flex-row md:items-center md:px-10">
          <div className="flex-1">
            <p className="sec-label mb-3">Get started</p>
            <h2 className="mb-2 text-2xl font-semibold tracking-tight">One install. Forty effects.</h2>
            <p className="text-sm text-white/40">Works with Next.js App Router, Vite, and any React 18+ project.</p>
          </div>
          <div className="flex-1">
            <div className="install-box flex items-center justify-between px-5 py-4" onClick={copyInstall}>
              <span className="text-white/60">
                <span style={{ color:"var(--accent2)",opacity:0.6 }}>$ </span>
                npm install cursor-kit
              </span>
              <span className="rounded-md px-3 py-1 text-xs transition-all"
                style={{ background:copied?"rgba(226,255,107,0.12)":"rgba(255,255,255,0.05)", color:copied?"var(--accent)":"rgba(255,255,255,0.35)", border:`1px solid ${copied?"rgba(226,255,107,0.25)":"transparent"}` }}>
                {copied ? "Copied!" : "Copy"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── USAGE ── */}
      <section id="usage" className="relative z-10 mx-auto max-w-7xl px-6 py-16 md:px-10">
        <p className="sec-label mb-3">Usage</p>
        <h2 className="mb-8 text-2xl font-semibold tracking-tight">Drop in, done.</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="code-block">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-5 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/50" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/50" />
              <span className="h-3 w-3 rounded-full bg-green-500/50" />
              <span className="ml-3 text-xs text-white/25">page.tsx</span>
            </div>
            <pre dangerouslySetInnerHTML={{ __html:
              `<span class="code-kw">import</span> { ConstellationCursor } <span class="code-kw">from</span> <span class="code-str">'cursor-kit'</span>;\n\n<span class="code-kw">export default function</span> <span class="code-fn">Page</span>() {\n  <span class="code-kw">return</span> (\n    &lt;&gt;\n      &lt;<span class="code-fn">ConstellationCursor</span> /&gt;\n      &lt;h1&gt;Your page content&lt;/h1&gt;\n    &lt;/&gt;\n  );\n}`
            }} />
          </div>
          <div className="flex flex-col justify-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-6">
            {[
              { icon:"⚡", title:"Zero config",        desc:"Import and use. No setup, no providers." },
              { icon:"🌲", title:"Tree-shakeable",     desc:"Only the cursors you import ship to users." },
              { icon:"🧹", title:"Auto cleanup",       desc:"All event listeners removed on unmount." },
              { icon:"🎨", title:"Fully customisable", desc:"Every constant is exposed at the top of each file." },
            ].map(f=>(
              <div key={f.title} className="flex items-start gap-3">
                <span className="mt-0.5 text-lg leading-none">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-white/40">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CURSOR GRID ── */}
      <section id="cursors" className="relative z-10 mx-auto max-w-7xl px-6 pb-32 md:px-10">
        <div className="mb-8 flex flex-col gap-5 border-t border-white/[0.06] pt-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="sec-label mb-2">The collection</p>
            <h2 className="text-3xl font-semibold tracking-tight">All {CURSORS.length} cursors</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(["All","DOM","Canvas","CSS"] as const).map(tag=>(
              <button key={tag} onClick={()=>setFilter(tag)} className={`filter-pill ${filter===tag?"active":""}`}>
                {tag}
                {tag!=="All" && (
                  <span className="ml-1.5 opacity-40">
                    {CURSORS.filter(c=>c.tag===tag).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6 flex flex-wrap gap-3">
          {(["DOM","Canvas","CSS"] as const).map(tag=>(
            <span key={tag} className="rounded-full px-3 py-1 text-xs font-medium"
              style={{ background:TAG_COLORS[tag],color:TAG_TEXT[tag],border:`1px solid ${TAG_TEXT[tag]}20` }}>
              {tag}
            </span>
          ))}
        </div>

        {/*
          key={filter} forces a full remount of the grid when filter changes.
          This resets all animation delays and clears stale canvas state.
        */}
        <div key={filter} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((cursor, i) => (
            <Card key={cursor.slug} cursor={cursor} index={i} />
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-16 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <h2 className="mb-2 text-3xl font-semibold tracking-tight leading-tight">
              Make your cursor<br />
              <span style={{ color:"var(--accent)",fontStyle:"italic" }}>unforgettable.</span>
            </h2>
            <p className="text-sm text-white/35">MIT licensed · Built for portfolios that demand attention.</p>
          </div>
          <div className="flex min-w-[200px] flex-col gap-3">
            <a href="https://github.com/imran-binhasan/cursor-kit" target="_blank" rel="noopener noreferrer"
              className="rounded-xl px-6 py-3 text-center text-sm font-semibold text-[#080808] transition-all hover:-translate-y-0.5 hover:opacity-90"
              style={{ background:"var(--accent)" }}>
              ✦ Star on GitHub
            </a>
            <a href="https://www.npmjs.com/package/cursor-kit" target="_blank" rel="noopener noreferrer"
              className="rounded-xl border border-white/[0.08] px-6 py-3 text-center text-sm text-white/50 transition-all hover:border-white/20 hover:text-white">
              View on npm
            </a>
          </div>
        </div>
        <div className="border-t border-white/[0.05] px-6 py-5 md:px-10">
          <div className="mx-auto flex max-w-7xl items-center justify-between text-xs text-white/20">
            <span>© 2025 cursor-kit by{" "}
              <a href="https://github.com/imran-binhasan" className="transition-colors hover:text-white/50">imran-binhasan</a>
              {" "}— MIT License
            </span>
            <span className="hidden sm:block">Built with Next.js · GSAP · ♥</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
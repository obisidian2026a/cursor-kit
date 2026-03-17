"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import type { CursorMeta } from "@/lib/cursors";
import { TAG_COLORS, TAG_TEXT } from "@/lib/cursors";

// ─── Mini canvas preview (loops silently on the card) ─────────────────────────
function MiniPreview({ id }: { id: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx    = canvas.getContext("2d")!;
    const W = canvas.width  = 280;
    const H = canvas.height = 140;
    let frame = 0;
    let raf: number;

    const variant = id % 5;

    function draw() {
      frame++;
      ctx.clearRect(0, 0, W, H);
      const t  = frame / 60;
      const cx = W / 2 + Math.sin(t * 1.1) * 60;
      const cy = H / 2 + Math.cos(t * 0.85) * 22;

      switch (variant) {
        case 0: { // dot chain
          for (let i = 0; i < 10; i++) {
            const ti   = t - i * 0.1;
            const x    = W / 2 + Math.sin(ti * 1.1) * 60;
            const y    = H / 2 + Math.cos(ti * 0.85) * 22;
            ctx.beginPath();
            ctx.arc(x, y, Math.max(1, 5 - i * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${(1 - i / 10) * 0.85})`;
            ctx.fill();
          }
          break;
        }
        case 1: { // ripple rings
          for (let r = 1; r <= 3; r++) {
            const p = ((t * 0.5 + r * 0.33) % 1);
            ctx.beginPath();
            ctx.arc(cx, cy, p * 35, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(99,210,255,${(1 - p) * 0.7})`;
            ctx.lineWidth   = 1.5;
            ctx.stroke();
          }
          ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
          break;
        }
        case 2: { // neon sweep
          ctx.save();
          ctx.shadowColor = `hsl(${frame * 2 % 360},100%,60%)`;
          ctx.shadowBlur  = 14;
          ctx.strokeStyle = `hsl(${frame * 2 % 360},100%,75%)`;
          ctx.lineWidth   = 2; ctx.lineCap = "round";
          ctx.beginPath();
          for (let i = 0; i < 50; i++) {
            const ti = t - i * 0.035;
            const x  = W / 2 + Math.sin(ti * 1.1) * 60;
            const y  = H / 2 + Math.cos(ti * 0.85) * 22;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
          }
          ctx.stroke(); ctx.restore();
          break;
        }
        case 3: { // particle orbit
          const COLS = ["#e2ff00","#ff6b35","#00d4ff","#ff3cac","#a0ff82"];
          for (let i = 0; i < 6; i++) {
            const a  = (i / 6) * Math.PI * 2 + t;
            const d  = 18 + Math.sin(t * 2 + i) * 8;
            ctx.beginPath();
            ctx.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 3, 0, Math.PI * 2);
            ctx.fillStyle = COLS[i % COLS.length]; ctx.fill();
          }
          ctx.beginPath(); ctx.arc(cx, cy, 4, 0, Math.PI * 2);
          ctx.fillStyle = "white"; ctx.fill();
          break;
        }
        case 4: { // constellation
          const pts = Array.from({ length: 5 }, (_, i) => ({
            x: W / 2 + Math.sin(t * 0.4 + i * 1.3) * 60,
            y: H / 2 + Math.cos(t * 0.55 + i * 1.1) * 22,
          }));
          pts.forEach((a, i) => pts.forEach((b, j) => {
            if (j <= i) return;
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 80) {
              ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y);
              ctx.strokeStyle = `rgba(255,255,255,${(1 - d / 80) * 0.45})`; ctx.lineWidth = 0.8; ctx.stroke();
            }
          }));
          pts.forEach((p) => {
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fill();
          });
          break;
        }
      }
      raf = requestAnimationFrame(draw);
    }

    draw();
    return () => cancelAnimationFrame(raf);
  }, [id]);

  return <canvas ref={ref} width={280} height={140} className="w-full h-full" />;
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface Props { cursor: CursorMeta; }

export default function CursorCard({ cursor }: Props) {
  return (
    <Link
      href={`/cursor/${cursor.slug}`}
      className="cursor-card group block rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        background:   "rgba(255,255,255,0.03)",
        borderColor:  "rgba(255,255,255,0.07)",
      }}
    >
      {/* Preview */}
      <div
        className="w-full overflow-hidden relative"
        style={{ aspectRatio: "2/1", background: "rgba(0,0,0,0.5)" }}
      >
        <MiniPreview id={cursor.id} />

        {/* hover overlay arrow */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: "rgba(0,0,0,0.45)" }}>
          <span className="text-white text-sm font-medium tracking-wide flex items-center gap-2">
            Preview <span className="text-lg">→</span>
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <h3 className="text-sm font-medium leading-snug text-white">{cursor.name}</h3>
          <span
            className="shrink-0 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{
              background: TAG_COLORS[cursor.tag],
              color:      TAG_TEXT[cursor.tag],
            }}
          >
            {cursor.tag}
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>
          {cursor.desc}
        </p>
      </div>
    </Link>
  );
}

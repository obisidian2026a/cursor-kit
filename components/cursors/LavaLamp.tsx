"use client";
import { useRef, useEffect } from "react";

// Metaball / lava lamp using canvas marching-squares-lite approach:
// We keep a pool of circular blobs, render them via radial gradients with
// screen blend mode to create the merging effect.

const BLOB_COUNT  = 12;
const COLORS      = ["#ff6b6b","#ffa94d","#ff6bff","#da77f2","#ff8787"];

function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

interface Blob {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  attracted: boolean;
}

export default function LavaLamp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; init(); }

    let blobs: Blob[] = [];
    function init() {
      blobs = Array.from({ length: BLOB_COUNT }, () => ({
        x:        rnd(100, canvas.width  - 100),
        y:        rnd(100, canvas.height - 100),
        vx:       rnd(-0.4, 0.4),
        vy:       rnd(-0.6, -0.1), // slight upward drift
        r:        rnd(40, 80),
        color:    COLORS[Math.floor(Math.random() * COLORS.length)],
        attracted: false,
      }));
    }

    resize();
    window.addEventListener("resize", resize);

    let mouse = { x: canvas.width / 2, y: canvas.height / 2 };
    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    let rafId: number;

    function draw() {
      ctx.fillStyle = "#1a0a1a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Use screen blend for merging effect
      ctx.globalCompositeOperation = "screen";

      blobs.forEach((b) => {
        // Drift toward mouse slightly
        const dx   = mouse.x - b.x;
        const dy   = mouse.y - b.y;
        const dist = Math.hypot(dx, dy);
        b.vx += (dx / (dist || 1)) * 0.012;
        b.vy += (dy / (dist || 1)) * 0.012 - 0.015; // constant upward buoyancy

        // Soft bounce off walls
        if (b.x < b.r || b.x > canvas.width  - b.r) b.vx *= -0.7;
        if (b.y < b.r || b.y > canvas.height - b.r) b.vy *= -0.7;

        b.vx *= 0.97; b.vy *= 0.97;
        b.x  += b.vx; b.y  += b.vy;

        b.x = Math.max(b.r, Math.min(canvas.width  - b.r, b.x));
        b.y = Math.max(b.r, Math.min(canvas.height - b.r, b.y));

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0,   b.color.replace(")", ",0.9)").replace("rgb","rgba").replace("#", "").slice(0));
        grad.addColorStop(0.5, b.color);
        grad.addColorStop(1,   "transparent");

        // Simpler: just use fillStyle with shadow for glow merge
        ctx.save();
        ctx.shadowColor = b.color;
        ctx.shadowBlur  = b.r * 0.8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.6, 0, Math.PI * 2);
        ctx.fillStyle = b.color;
        ctx.fill();
        ctx.restore();
      });

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

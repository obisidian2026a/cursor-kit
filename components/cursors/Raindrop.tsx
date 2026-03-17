"use client";
import { useRef, useEffect } from "react";

const TRAIL_GAP   = 30;
const GRAVITY     = 0.18;
const FLOOR_Y     = () => window.innerHeight - 40;
const RIPPLE_MAX  = 55;

interface Drop  { x: number; y: number; vy: number; done: boolean; }
interface Ripple{ x: number; y: number; r: number; alpha: number; }

export default function Raindrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const drops:   Drop[]   = [];
    const ripples: Ripple[] = [];

    let mouse   = { x: -999, y: -999 };
    let lastPos = { x: -999, y: -999 };
    let isFirst = true;
    let rafId: number;

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (isFirst) { lastPos = { ...mouse }; isFirst = false; }
    });

    function draw() {
      ctx.fillStyle = "rgba(8,14,28,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Spawn drops along trail
      if (!isFirst && Math.hypot(mouse.x - lastPos.x, mouse.y - lastPos.y) > TRAIL_GAP) {
        drops.push({ x: mouse.x + (Math.random() - 0.5) * 20, y: mouse.y, vy: Math.random() * 2 + 1, done: false });
        lastPos = { ...mouse };
      }

      // Update & draw drops
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i];
        d.vy += GRAVITY;
        d.y  += d.vy;

        if (d.y >= FLOOR_Y()) {
          ripples.push({ x: d.x, y: FLOOR_Y(), r: 2, alpha: 0.7 });
          drops.splice(i, 1);
          continue;
        }

        // Teardrop shape
        ctx.save();
        ctx.translate(d.x, d.y);
        ctx.beginPath();
        ctx.moveTo(0, -6);
        ctx.bezierCurveTo(4, -2, 4, 4, 0, 6);
        ctx.bezierCurveTo(-4, 4, -4, -2, 0, -6);
        ctx.fillStyle = "rgba(130,190,255,0.75)";
        ctx.fill();
        ctx.restore();
      }

      // Update & draw ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const rp = ripples[i];
        rp.r     += 1.5;
        rp.alpha -= 0.015;
        if (rp.alpha <= 0) { ripples.splice(i, 1); continue; }

        ctx.beginPath();
        ctx.ellipse(rp.x, rp.y, rp.r, rp.r * 0.35, 0, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(130,190,255,${rp.alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

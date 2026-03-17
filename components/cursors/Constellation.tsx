"use client";

import { useRef, useEffect } from "react";

const DOT_LIMIT    = 80;
const TRAIL_GAP    = 28;
const DOT_LIFETIME = 3500;
const LINE_DIST    = 120;
const BG           = "#0d0d0d";

interface Dot { x: number; y: number; born: number; }

export default function Constellation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const dots: Dot[] = [];
    let lastPos = { x: -999, y: -999 };
    let mousePos = { x: -999, y: -999 };
    let isFirstMove = true;

    window.addEventListener("mousemove", (e) => {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) { lastPos = { ...mousePos }; isFirstMove = false; }
    });

    let rafId: number;
    function draw() {
      const now = performance.now();
      if (!isFirstMove && Math.hypot(mousePos.x - lastPos.x, mousePos.y - lastPos.y) > TRAIL_GAP) {
        dots.push({ x: mousePos.x, y: mousePos.y, born: now });
        if (dots.length > DOT_LIMIT) dots.shift();
        lastPos = { ...mousePos };
      }
      for (let i = dots.length - 1; i >= 0; i--) { if (now - dots[i].born > DOT_LIFETIME) dots.splice(i, 1); }

      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const d = Math.hypot(dots[i].x - dots[j].x, dots[i].y - dots[j].y);
          if (d > LINE_DIST) continue;
          const alpha = (1 - d / LINE_DIST) * Math.min(1 - (now - dots[i].born) / DOT_LIFETIME, 1 - (now - dots[j].born) / DOT_LIFETIME) * 0.5;
          ctx.beginPath(); ctx.moveTo(dots[i].x, dots[i].y); ctx.lineTo(dots[j].x, dots[j].y);
          ctx.strokeStyle = `rgba(255,255,255,${alpha})`; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }

      dots.forEach((dot) => {
        const alpha = Math.max(0, 1 - (now - dot.born) / DOT_LIFETIME);
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${alpha})`; ctx.fill();
      });

      if (!isFirstMove) {
        ctx.beginPath(); ctx.arc(mousePos.x, mousePos.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "white"; ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

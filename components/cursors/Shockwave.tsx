"use client";
import { useRef, useEffect } from "react";

const PARTICLE_COUNT = 120;
const REPEL_RADIUS   = 100;
const REPEL_STRENGTH = 6;
const RETURN_SPEED   = 0.08;

interface P { ox:number;oy:number;x:number;y:number;vx:number;vy:number; }

export default function Shockwave() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    let particles: P[] = [];

    function resize() {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
      const cols = Math.ceil(Math.sqrt(PARTICLE_COUNT * (canvas.width / canvas.height)));
      const rows = Math.ceil(PARTICLE_COUNT / cols);
      particles = [];
      for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
        const ox = (canvas.width  / cols) * c + (canvas.width  / cols) / 2;
        const oy = (canvas.height / rows) * r + (canvas.height / rows) / 2;
        particles.push({ ox, oy, x: ox, y: oy, vx: 0, vy: 0 });
      }
    }
    resize();
    window.addEventListener("resize", resize);

    let mouse = { x: -999, y: -999 };
    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    let rafId: number;
    function draw() {
      ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < REPEL_RADIUS) {
          const f = (REPEL_RADIUS - dist) / REPEL_RADIUS;
          p.vx -= (dx / dist) * f * REPEL_STRENGTH;
          p.vy -= (dy / dist) * f * REPEL_STRENGTH;
        }
        p.vx += (p.ox - p.x) * RETURN_SPEED; p.vy += (p.oy - p.y) * RETURN_SPEED;
        p.vx *= 0.85; p.vy *= 0.85; p.x += p.vx; p.y += p.vy;
        const displaced = Math.hypot(p.x - p.ox, p.y - p.oy);
        ctx.beginPath(); ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + Math.min(1, displaced / 20) * 0.7})`; ctx.fill();
      });
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

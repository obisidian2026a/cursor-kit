"use client";
import { useRef, useEffect } from "react";

export default function Hologram() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    let mouse  = { x: -999, y: -999 };
    let frame  = 0;
    let rafId: number;

    // Ring state: each ring expands from where mouse was
    interface Ring { x:number; y:number; r:number; alpha:number; type:"ring"|"scan"; }
    const rings: Ring[] = [];
    let lastSpawn = { x: -999, y: -999 };

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (Math.hypot(mouse.x - lastSpawn.x, mouse.y - lastSpawn.y) > 40) {
        rings.push({ x: mouse.x, y: mouse.y, r: 5, alpha: 0.8, type: "ring" });
        lastSpawn = { ...mouse };
        if (rings.length > 30) rings.shift();
      }
    });

    function draw() {
      frame++;
      ctx.fillStyle = "rgba(0,8,20,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw expanding rings
      for (let i = rings.length - 1; i >= 0; i--) {
        const ring  = rings[i];
        ring.r     += 2.5;
        ring.alpha -= 0.012;
        if (ring.alpha <= 0) { rings.splice(i, 1); continue; }

        ctx.save();
        ctx.shadowColor = "#00cfff";
        ctx.shadowBlur  = 10;

        // Outer interference ring
        ctx.beginPath();
        ctx.arc(ring.x, ring.y, ring.r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0,207,255,${ring.alpha})`;
        ctx.lineWidth   = 1;
        ctx.stroke();

        // Inner harmonic ring (half radius, different color)
        if (ring.r > 20) {
          ctx.beginPath();
          ctx.arc(ring.x, ring.y, ring.r * 0.5, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(180,0,255,${ring.alpha * 0.5})`;
          ctx.lineWidth   = 0.7;
          ctx.stroke();
        }

        ctx.restore();
      }

      // Scanline sweep across cursor position
      if (mouse.x > 0) {
        const scanY = mouse.y + Math.sin(frame * 0.08) * 40;
        const grad  = ctx.createLinearGradient(mouse.x - 120, 0, mouse.x + 120, 0);
        grad.addColorStop(0,   "transparent");
        grad.addColorStop(0.4, "rgba(0,207,255,0.08)");
        grad.addColorStop(0.5, "rgba(0,207,255,0.18)");
        grad.addColorStop(0.6, "rgba(0,207,255,0.08)");
        grad.addColorStop(1,   "transparent");

        ctx.fillStyle = grad;
        ctx.fillRect(mouse.x - 120, scanY - 1, 240, 2);

        // Cursor dot
        ctx.save();
        ctx.shadowColor = "#00cfff"; ctx.shadowBlur = 20;
        ctx.beginPath(); ctx.arc(mouse.x, mouse.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0,207,255,0.9)"; ctx.fill();
        ctx.restore();
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

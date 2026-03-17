"use client";
import { useRef, useEffect } from "react";

// Void: cursor burns a dark hole that slowly heals
// Uses destination-out compositing to erase, then redraws BG gradually

export default function Void() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      // Fill with white initially
      ctx.fillStyle = "#f5f0e8";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let mouse = { x: -999, y: -999 };
    let rafId: number;

    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    function draw() {
      // Slowly heal — fill with semi-transparent white to gradually restore
      ctx.globalCompositeOperation = "source-over";
      ctx.fillStyle = "rgba(245,240,232,0.018)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Burn void at cursor
      if (mouse.x > 0) {
        ctx.globalCompositeOperation = "destination-out";
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 55);
        grad.addColorStop(0,   "rgba(0,0,0,0.9)");
        grad.addColorStop(0.6, "rgba(0,0,0,0.4)");
        grad.addColorStop(1,   "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 55, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Jagged edge detail — extra small void dabs slightly offset
        for (let i = 0; i < 4; i++) {
          const angle = (i / 4) * Math.PI * 2;
          const ox    = Math.cos(angle) * 30;
          const oy    = Math.sin(angle) * 30;
          const g2    = ctx.createRadialGradient(mouse.x + ox, mouse.y + oy, 0, mouse.x + ox, mouse.y + oy, 20);
          g2.addColorStop(0, "rgba(0,0,0,0.5)");
          g2.addColorStop(1, "rgba(0,0,0,0)");
          ctx.beginPath();
          ctx.arc(mouse.x + ox, mouse.y + oy, 20, 0, Math.PI * 2);
          ctx.fillStyle = g2;
          ctx.fill();
        }
      }

      ctx.globalCompositeOperation = "source-over";
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return (
    <div className="absolute inset-0" style={{ background: "#0a0a0a" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}

"use client";
import { useRef, useEffect } from "react";

// Comet: bright head + long fading tail using position history + lerp
const TAIL_LENGTH = 50;
const LERP        = 0.14;

interface Point { x: number; y: number; }

export default function Comet() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const tail: Point[] = [];
    let smooth = { x: -200, y: -200 };
    let mouse  = { x: -200, y: -200 };
    let hue    = 40; // starts warm white-gold
    let rafId: number;

    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    function draw() {
      hue = (hue + 0.5) % 360;

      smooth.x += (mouse.x - smooth.x) * LERP;
      smooth.y += (mouse.y - smooth.y) * LERP;

      tail.push({ x: smooth.x, y: smooth.y });
      if (tail.length > TAIL_LENGTH) tail.shift();

      ctx.fillStyle = "rgba(5,5,15,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (tail.length < 2) { requestAnimationFrame(draw); return; }

      // Draw tail segments
      for (let i = 1; i < tail.length; i++) {
        const progress = i / tail.length; // 0=old, 1=head
        const alpha    = progress * 0.85;
        const width    = progress * 4;

        ctx.save();
        ctx.shadowColor = `hsl(${hue},100%,80%)`;
        ctx.shadowBlur  = 10 * progress;
        ctx.beginPath();
        ctx.moveTo(tail[i - 1].x, tail[i - 1].y);
        ctx.lineTo(tail[i].x,     tail[i].y);
        ctx.strokeStyle = `hsla(${hue},100%,${60 + progress * 35}%,${alpha})`;
        ctx.lineWidth   = width;
        ctx.lineCap     = "round";
        ctx.stroke();
        ctx.restore();
      }

      // Bright comet head
      const head = tail[tail.length - 1];
      ctx.save();
      ctx.shadowColor = "white"; ctx.shadowBlur = 20;
      const grad = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 10);
      grad.addColorStop(0, "rgba(255,255,255,1)");
      grad.addColorStop(0.4, `hsla(${hue},100%,80%,0.8)`);
      grad.addColorStop(1, "transparent");
      ctx.beginPath(); ctx.arc(head.x, head.y, 10, 0, Math.PI * 2);
      ctx.fillStyle = grad; ctx.fill();
      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

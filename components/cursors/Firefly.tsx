"use client";
import { useRef, useEffect } from "react";

const COUNT = 40;
const ATTRACT_RADIUS  = 160;
const ATTRACT_STRENGTH = 0.04;
const FLOAT_STRENGTH   = 0.6;

interface Fly {
  x: number; y: number;
  vx: number; vy: number;
  phase: number;     // unique phase offset for organic float
  size: number;
  hue: number;       // 50–90 = warm yellow-green glow
  brightness: number;// pulse
  pulseSpeed: number;
}

export default function Firefly() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    // Scatter fireflies across the screen initially
    const flies: Fly[] = Array.from({ length: COUNT }, () => ({
      x:          Math.random() * window.innerWidth,
      y:          Math.random() * window.innerHeight,
      vx:         (Math.random() - 0.5) * 0.4,
      vy:         (Math.random() - 0.5) * 0.4,
      phase:      Math.random() * Math.PI * 2,
      size:       Math.random() * 2.5 + 1.5,
      hue:        Math.random() * 40 + 55,   // warm yellow-green
      brightness: Math.random(),
      pulseSpeed: Math.random() * 0.03 + 0.01,
    }));

    let mouse    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let frame    = 0;
    let rafId: number;

    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    function draw() {
      frame++;
      // Dark fade — preserve previous glows slightly for trail effect
      ctx.fillStyle = "rgba(5,10,5,0.25)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      flies.forEach((fly) => {
        // Pulse brightness
        fly.brightness = 0.5 + 0.5 * Math.sin(frame * fly.pulseSpeed + fly.phase);

        // Drift toward mouse loosely
        const dx   = mouse.x - fly.x;
        const dy   = mouse.y - fly.y;
        const dist = Math.hypot(dx, dy);

        if (dist < ATTRACT_RADIUS) {
          fly.vx += (dx / dist) * ATTRACT_STRENGTH;
          fly.vy += (dy / dist) * ATTRACT_STRENGTH;
        }

        // Organic float noise
        fly.vx += Math.sin(frame * 0.012 + fly.phase)       * FLOAT_STRENGTH * 0.04;
        fly.vy += Math.cos(frame * 0.009 + fly.phase * 1.3) * FLOAT_STRENGTH * 0.04;

        // Speed cap
        const speed = Math.hypot(fly.vx, fly.vy);
        if (speed > 1.8) { fly.vx = (fly.vx / speed) * 1.8; fly.vy = (fly.vy / speed) * 1.8; }

        fly.vx *= 0.97;
        fly.vy *= 0.97;
        fly.x  += fly.vx;
        fly.y  += fly.vy;

        // Wrap around edges
        if (fly.x < 0) fly.x = canvas.width;
        if (fly.x > canvas.width)  fly.x = 0;
        if (fly.y < 0) fly.y = canvas.height;
        if (fly.y > canvas.height) fly.y = 0;

        // Draw glow
        const alpha = fly.brightness * 0.9;
        const r     = fly.size * (1 + fly.brightness * 0.5);

        const grad = ctx.createRadialGradient(fly.x, fly.y, 0, fly.x, fly.y, r * 8);
        grad.addColorStop(0,   `hsla(${fly.hue},100%,90%,${alpha})`);
        grad.addColorStop(0.3, `hsla(${fly.hue},100%,65%,${alpha * 0.6})`);
        grad.addColorStop(1,   `hsla(${fly.hue},100%,40%,0)`);

        ctx.beginPath();
        ctx.arc(fly.x, fly.y, r * 8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Bright core
        ctx.beginPath();
        ctx.arc(fly.x, fly.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${fly.hue},100%,95%,${alpha})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

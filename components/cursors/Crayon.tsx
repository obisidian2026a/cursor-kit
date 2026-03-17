"use client";
import { useRef, useEffect } from "react";

// Crayon: thick waxy strokes with texture noise and soft smudge edges
const COLORS  = ["#e63946","#f4a261","#2a9d8f","#457b9d","#e9c46a","#264653"];
const BG      = "#fdf6e3";

function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function Crayon() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const colorIndex = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.fillStyle = BG;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    resize();
    window.addEventListener("resize", resize);

    let isDrawing = false;
    let lastX = 0, lastY = 0;
    let distSinceColorSwap = 0;
    const COLOR_SWAP_DIST  = 300;

    function drawStroke(x: number, y: number) {
      const dist = Math.hypot(x - lastX, y - lastY);
      distSinceColorSwap += dist;
      if (distSinceColorSwap > COLOR_SWAP_DIST) {
        colorIndex.current = (colorIndex.current + 1) % COLORS.length;
        distSinceColorSwap = 0;
      }

      const color = COLORS[colorIndex.current];
      const speed = Math.max(1, dist);
      // Thicker when moving slowly (more pressure)
      const width = Math.max(6, 22 - speed * 0.3);

      // Draw multiple semi-transparent passes to simulate waxy texture
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(lastX + rnd(-1, 1), lastY + rnd(-1, 1));
        ctx.lineTo(x    + rnd(-1, 1), y    + rnd(-1, 1));
        ctx.strokeStyle = `${color}${Math.floor(rnd(55, 120)).toString(16).padStart(2,"0")}`;
        ctx.lineWidth   = width + rnd(-3, 3);
        ctx.lineCap     = "round";
        ctx.lineJoin    = "round";
        ctx.stroke();
      }

      // Soft smudge pass
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = `${color}22`;
      ctx.lineWidth   = width * 2.2;
      ctx.lineCap     = "round";
      ctx.filter      = "blur(3px)";
      ctx.stroke();
      ctx.filter      = "none";

      lastX = x; lastY = y;
    }

    function onMove(e: MouseEvent)  { if (isDrawing) drawStroke(e.clientX, e.clientY); else { lastX = e.clientX; lastY = e.clientY; } }
    function onDown(e: MouseEvent)  { isDrawing = true; lastX = e.clientX; lastY = e.clientY; }
    function onUp()                 { isDrawing = false; }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    return () => {
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

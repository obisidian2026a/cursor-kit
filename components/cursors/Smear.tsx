"use client";

import { useRef, useEffect } from "react";

function hexToRgb(hex: string) {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? `${parseInt(r[1],16)},${parseInt(r[2],16)},${parseInt(r[3],16)}` : "245,240,232";
}

const BG    = "#111111";
const COLOR = "rgba(255,255,255,1)";
const FADE  = 0.035;

export default function Smear() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let rafId: number;
    function fadeLoop() {
      ctx.fillStyle = `rgba(${hexToRgb(BG)},${FADE})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      rafId = requestAnimationFrame(fadeLoop);
    }
    fadeLoop();

    function draw(x: number, y: number, active: boolean) {
      if (!active) { lastX = x; lastY = y; return; }
      const speed    = Math.hypot(x - lastX, y - lastY);
      const pressure = Math.max(2, 18 - speed * 0.4);
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = COLOR;
      ctx.lineWidth   = pressure;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";
      ctx.globalAlpha = Math.min(1, 0.6 + (pressure / 18) * 0.4);
      ctx.stroke();
      ctx.globalAlpha = 1;
      lastX = x; lastY = y;
    }

    function onMove(e: MouseEvent)  { draw(e.clientX, e.clientY, isDrawing); }
    function onDown(e: MouseEvent)  { isDrawing = true;  lastX = e.clientX; lastY = e.clientY; }
    function onUp()                 { isDrawing = false; }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize",    resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

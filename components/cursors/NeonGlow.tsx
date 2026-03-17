"use client";
import { useRef, useEffect } from "react";

const NEON_HUES = [180,300,60,120,0];

export default function NeonGlow() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;
    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; ctx.fillStyle="#050505"; ctx.fillRect(0,0,canvas.width,canvas.height); }
    resize();
    window.addEventListener("resize", resize);

    let isDrawing = false, lastX = 0, lastY = 0;
    let hueIndex = 0, currentHue = NEON_HUES[0], distTravelled = 0;

    let rafId: number;
    function fade() { ctx.fillStyle="rgba(5,5,5,0.04)"; ctx.fillRect(0,0,canvas.width,canvas.height); rafId = requestAnimationFrame(fade); }
    fade();

    function drawSeg(x: number, y: number) {
      distTravelled += Math.hypot(x-lastX, y-lastY);
      if (distTravelled > 200) { hueIndex=(hueIndex+1)%NEON_HUES.length; currentHue=NEON_HUES[hueIndex]; distTravelled=0; }
      ctx.save();
      ctx.shadowColor=`hsl(${currentHue},100%,60%)`; ctx.shadowBlur=18;
      ctx.strokeStyle=`hsl(${currentHue},100%,75%)`; ctx.lineWidth=3; ctx.lineCap="round";
      ctx.beginPath(); ctx.moveTo(lastX,lastY); ctx.lineTo(x,y); ctx.stroke();
      ctx.shadowBlur=4; ctx.strokeStyle=`hsl(${currentHue},100%,95%)`; ctx.lineWidth=1; ctx.stroke();
      ctx.restore(); lastX=x; lastY=y;
    }

    function onMove(e: MouseEvent) { if(isDrawing) drawSeg(e.clientX,e.clientY); else { lastX=e.clientX; lastY=e.clientY; } }
    function onDown(e: MouseEvent) { isDrawing=true; lastX=e.clientX; lastY=e.clientY; }
    function onUp() { isDrawing=false; }

    window.addEventListener("mousemove",onMove); window.addEventListener("mousedown",onDown); window.addEventListener("mouseup",onUp);
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize",resize); window.removeEventListener("mousemove",onMove); window.removeEventListener("mousedown",onDown); window.removeEventListener("mouseup",onUp); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

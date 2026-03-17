"use client";
import { useRef, useEffect } from "react";

// Circuit trace: cursor draws PCB-style right-angle lines with glowing nodes

const FADE_SPEED = 0.025;
const LINE_COLOR = "#00ff9f";
const BG         = "#050f0a";

interface Segment { x1:number; y1:number; x2:number; y2:number; age:number; }
interface Node    { x:number; y:number; age:number; }

export default function CircuitTrace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; ctx.fillStyle = BG; ctx.fillRect(0,0,canvas.width,canvas.height); }
    resize();
    window.addEventListener("resize", resize);

    const segments: Segment[] = [];
    const nodes:    Node[]    = [];
    let lastPos  = { x: -999, y: -999 };
    let mouse    = { x: -999, y: -999 };
    let isFirst  = true;
    let useHoriz = true; // alternate horizontal/vertical traces
    let rafId: number;

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (isFirst) { lastPos = { x: Math.round(e.clientX / 20)*20, y: Math.round(e.clientY / 20)*20 }; isFirst = false; }
    });

    const STEP = 40;

    function tick() {
      if (isFirst) return;
      // Snap to grid
      const snapped = { x: Math.round(mouse.x / 20) * 20, y: Math.round(mouse.y / 20) * 20 };
      const dist    = Math.hypot(snapped.x - lastPos.x, snapped.y - lastPos.y);

      if (dist >= STEP) {
        // Draw right-angle: first horizontal OR vertical, then the other
        const midX = useHoriz ? snapped.x : lastPos.x;
        const midY = useHoriz ? lastPos.y  : snapped.y;

        segments.push({ x1: lastPos.x, y1: lastPos.y, x2: midX,     y2: midY,     age: 0 });
        segments.push({ x1: midX,      y1: midY,      x2: snapped.x, y2: snapped.y, age: 0 });
        nodes.push({ x: midX, y: midY, age: 0 });
        nodes.push({ x: snapped.x, y: snapped.y, age: 0 });

        useHoriz = !useHoriz;
        lastPos  = snapped;

        if (segments.length > 80) { segments.splice(0, 2); }
        if (nodes.length    > 40) { nodes.splice(0, 2); }
      }
    }

    function draw() {
      ctx.fillStyle = `rgba(5,15,10,${FADE_SPEED * 3})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      segments.forEach((s) => {
        s.age += 0.004;
        const alpha = Math.max(0, 1 - s.age);
        ctx.save();
        ctx.shadowColor = LINE_COLOR; ctx.shadowBlur = 8;
        ctx.strokeStyle = `rgba(0,255,159,${alpha})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(s.x1, s.y1); ctx.lineTo(s.x2, s.y2); ctx.stroke();
        ctx.restore();
      });

      nodes.forEach((n) => {
        n.age += 0.004;
        const alpha = Math.max(0, 1 - n.age);
        ctx.save();
        ctx.shadowColor = LINE_COLOR; ctx.shadowBlur = 10;
        ctx.fillStyle   = `rgba(0,255,159,${alpha})`;
        ctx.beginPath(); ctx.arc(n.x, n.y, 3, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });

      tick();
      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

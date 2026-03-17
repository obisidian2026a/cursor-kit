"use client";
import { useRef, useEffect } from "react";

// Lightning: electric arcs jump between recent cursor positions
const HISTORY_SIZE = 8;
const BOLT_STEPS   = 12;
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

interface Arc { x1:number; y1:number; x2:number; y2:number; alpha:number; pts:{x:number;y:number}[]; }

export default function Lightning() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const history: { x: number; y: number }[] = [];
    const arcs: Arc[] = [];
    let mouse    = { x: -999, y: -999 };
    let lastPos  = { x: -999, y: -999 };
    let isFirst  = true;
    let rafId: number;
    let frame    = 0;

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (isFirst) { lastPos = { ...mouse }; isFirst = false; }

      if (Math.hypot(mouse.x - lastPos.x, mouse.y - lastPos.y) > 25) {
        history.push({ ...mouse });
        if (history.length > HISTORY_SIZE) history.shift();
        lastPos = { ...mouse };

        // Spark arc between two random history points
        if (history.length >= 2) {
          const ai = Math.floor(Math.random() * history.length);
          let   bi = Math.floor(Math.random() * history.length);
          while (bi === ai) bi = Math.floor(Math.random() * history.length);

          const pts = buildBolt(history[ai], history[bi]);
          arcs.push({ x1: history[ai].x, y1: history[ai].y, x2: history[bi].x, y2: history[bi].y, alpha: 1, pts });
          if (arcs.length > 20) arcs.shift();
        }
      }
    });

    function buildBolt(a: {x:number;y:number}, b: {x:number;y:number}) {
      const pts = [{ ...a }];
      for (let i = 1; i < BOLT_STEPS - 1; i++) {
        const t   = i / BOLT_STEPS;
        const mx  = a.x + (b.x - a.x) * t + rnd(-30, 30);
        const my  = a.y + (b.y - a.y) * t + rnd(-30, 30);
        pts.push({ x: mx, y: my });
      }
      pts.push({ ...b });
      return pts;
    }

    function draw() {
      frame++;
      ctx.fillStyle = "rgba(5,5,20,0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (let i = arcs.length - 1; i >= 0; i--) {
        const arc = arcs[i];
        arc.alpha -= 0.04;
        if (arc.alpha <= 0) { arcs.splice(i, 1); continue; }

        // Outer glow
        ctx.save();
        ctx.shadowColor = "#88aaff";
        ctx.shadowBlur  = 12;
        ctx.beginPath();
        ctx.moveTo(arc.pts[0].x, arc.pts[0].y);
        arc.pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = `rgba(100,140,255,${arc.alpha * 0.4})`;
        ctx.lineWidth   = 4;
        ctx.lineCap     = "round";
        ctx.stroke();

        // Core bolt
        ctx.beginPath();
        ctx.moveTo(arc.pts[0].x, arc.pts[0].y);
        arc.pts.slice(1).forEach((p) => ctx.lineTo(p.x, p.y));
        ctx.strokeStyle = `rgba(200,220,255,${arc.alpha})`;
        ctx.lineWidth   = 1.5;
        ctx.stroke();
        ctx.restore();

        // Node sparks at endpoints
        [arc.pts[0], arc.pts[arc.pts.length - 1]].forEach((pt) => {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${arc.alpha})`;
          ctx.fill();
        });
      }

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

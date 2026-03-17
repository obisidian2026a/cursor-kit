"use client";
import { useRef, useEffect } from "react";

const MAX_POINTS  = 120;
const TRAIL_GAP   = 10;
const LEAF_CHANCE = 0.18; // probability per new point

interface Point { x: number; y: number; age: number; }
interface Leaf  { x: number; y: number; angle: number; size: number; age: number; side: number; }

function lerp(a: number, b: number, t: number) { return a + (b - a) * t; }

export default function Vine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    const points: Point[] = [];
    const leaves: Leaf[]  = [];

    let mouse    = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    let lastPos  = { x: -999, y: -999 };
    let isFirst  = true;
    let rafId: number;
    let frame    = 0;

    window.addEventListener("mousemove", (e) => {
      mouse = { x: e.clientX, y: e.clientY };
      if (isFirst) { lastPos = { ...mouse }; isFirst = false; }
    });

    function addPoint(x: number, y: number) {
      points.push({ x, y, age: 0 });
      if (points.length > MAX_POINTS) points.shift();

      if (Math.random() < LEAF_CHANCE && points.length > 2) {
        const prev  = points[points.length - 2];
        const dx    = x - prev.x;
        const dy    = y - prev.y;
        const angle = Math.atan2(dy, dx);
        const side  = Math.random() > 0.5 ? 1 : -1;
        leaves.push({ x, y, angle: angle + side * (Math.PI / 4 + Math.random() * 0.4), size: Math.random() * 8 + 5, age: 0, side });
      }
      if (leaves.length > 60) leaves.shift();
    }

    function drawLeaf(lx: number, ly: number, angle: number, size: number, alpha: number) {
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * 0.5, -size * 0.4, size, -size * 0.3, size, 0);
      ctx.bezierCurveTo(size, size * 0.3, size * 0.5, size * 0.4, 0, 0);
      ctx.fillStyle = `rgba(60,160,60,${alpha})`;
      ctx.fill();
      ctx.restore();
    }

    function draw() {
      frame++;
      ctx.fillStyle = "rgba(5,15,5,0.35)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!isFirst) {
        const dist = Math.hypot(mouse.x - lastPos.x, mouse.y - lastPos.y);
        if (dist > TRAIL_GAP) { addPoint(mouse.x, mouse.y); lastPos = { ...mouse }; }
      }

      // Age all points and leaves
      points.forEach((p) => { p.age += 0.008; });
      leaves.forEach((l) => { l.age += 0.006; });

      // Draw vine stem (catmull-rom-like smooth line)
      if (points.length > 2) {
        for (let i = 1; i < points.length; i++) {
          const alpha = Math.max(0, 1 - points[i].age) * (i / points.length);
          const thick = lerp(1, 3, i / points.length) * (1 - points[i].age * 0.5);
          ctx.beginPath();
          ctx.moveTo(points[i - 1].x, points[i - 1].y);
          ctx.lineTo(points[i].x,     points[i].y);
          ctx.strokeStyle = `rgba(40,130,40,${alpha})`;
          ctx.lineWidth   = Math.max(0.5, thick);
          ctx.lineCap     = "round";
          ctx.stroke();
        }
      }

      // Draw leaves
      leaves.forEach((l) => {
        const alpha = Math.max(0, 1 - l.age);
        if (alpha > 0) drawLeaf(l.x, l.y, l.angle, l.size, alpha);
      });

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

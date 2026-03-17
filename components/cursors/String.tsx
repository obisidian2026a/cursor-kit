"use client";
import { useRef, useEffect } from "react";

// Verlet-integrated string that hangs from cursor with gravity
const SEGMENT_COUNT = 30;
const GRAVITY       = 0.4;
const DAMPING       = 0.98;
const ITERATIONS    = 8; // constraint solver passes
const SEG_LENGTH    = 12;
const STRING_COLOR  = "#e2ff6b";

interface Node { x: number; y: number; px: number; py: number; pinned: boolean; }

export default function StringCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx    = canvas.getContext("2d")!;

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);

    // Build string nodes hanging straight down initially
    const nodes: Node[] = Array.from({ length: SEGMENT_COUNT }, (_, i) => ({
      x: window.innerWidth / 2, y: window.innerHeight / 2 + i * SEG_LENGTH,
      px: window.innerWidth / 2, py: window.innerHeight / 2 + i * SEG_LENGTH,
      pinned: i === 0,
    }));

    let mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    window.addEventListener("mousemove", (e) => { mouse = { x: e.clientX, y: e.clientY }; });

    let rafId: number;

    function simulate() {
      // Pin head to mouse
      nodes[0].x = mouse.x;
      nodes[0].y = mouse.y;

      // Verlet integration
      nodes.forEach((n) => {
        if (n.pinned) return;
        const vx = (n.x - n.px) * DAMPING;
        const vy = (n.y - n.py) * DAMPING;
        n.px = n.x;
        n.py = n.y;
        n.x += vx;
        n.y += vy + GRAVITY;
      });

      // Distance constraints
      for (let iter = 0; iter < ITERATIONS; iter++) {
        for (let i = 0; i < nodes.length - 1; i++) {
          const a  = nodes[i];
          const b  = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 0.001;
          const diff = (dist - SEG_LENGTH) / dist * 0.5;
          const ox = dx * diff;
          const oy = dy * diff;
          if (!a.pinned) { a.x += ox; a.y += oy; }
          if (!b.pinned) { b.x -= ox; b.y -= oy; }
        }
      }
    }

    function draw() {
      ctx.fillStyle = "rgba(8,8,8,0.4)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      simulate();

      // Draw string as gradient line
      ctx.save();
      ctx.shadowColor = STRING_COLOR;
      ctx.shadowBlur  = 8;
      ctx.lineCap     = "round";
      ctx.lineJoin    = "round";

      for (let i = 0; i < nodes.length - 1; i++) {
        const alpha = 1 - i / nodes.length;
        ctx.beginPath();
        ctx.moveTo(nodes[i].x, nodes[i].y);
        ctx.lineTo(nodes[i + 1].x, nodes[i + 1].y);
        ctx.strokeStyle = `rgba(226,255,107,${alpha * 0.85})`;
        ctx.lineWidth   = Math.max(0.5, 2 * (1 - i / nodes.length));
        ctx.stroke();
      }

      // End node (small glowing bead)
      const tail = nodes[nodes.length - 1];
      ctx.beginPath();
      ctx.arc(tail.x, tail.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = STRING_COLOR;
      ctx.fill();

      ctx.restore();

      rafId = requestAnimationFrame(draw);
    }
    draw();

    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

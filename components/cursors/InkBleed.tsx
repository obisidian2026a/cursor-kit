"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE  = 24;
const TRAIL_GAP  = 40;
const INK_COLORS = ["#0a0a0a","#1a1a2e","#16213e","#0f3460","#1a1a1a"];

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }
function randomBlobRadius() {
  const v = () => Math.floor(rnd(30, 70));
  return `${v()}% ${v()}% ${v()}% ${v()}% / ${v()}% ${v()}% ${v()}% ${v()}%`;
}

export default function InkBleed() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".ink-blob");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index       = 0;
    let mousePos     = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let isFirstMove  = true;

    function splat() {
      const blob  = pool[wrapIndex(index)];
      const size  = rnd(20, 70);
      const color = INK_COLORS[Math.floor(Math.random() * INK_COLORS.length)];
      gsap.killTweensOf(blob);
      gsap.set(blob, { clearProps: "all" });
      gsap.set(blob, {
        left: mousePos.x, top: mousePos.y, xPercent: -50, yPercent: -50,
        width: 0, height: 0, opacity: 1, background: color,
        borderRadius: randomBlobRadius(),
        x: rnd(-12, 12), y: rnd(-12, 12),
      });
      gsap.timeline()
        .to(blob, { width: size, height: size, duration: 0.12, ease: "power3.out" })
        .to(blob, { opacity: 0, scale: rnd(1.2, 2), duration: rnd(0.6, 1.2), ease: "power1.in" });
      index++;
    }

    function tick() {
      if (Math.hypot(lastMousePos.x - mousePos.x, lastMousePos.y - mousePos.y) > TRAIL_GAP) {
        splat(); lastMousePos = { ...mousePos };
      }
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) { lastMousePos = { ...mousePos }; isFirstMove = false; }
    }

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tick);
    return () => { window.removeEventListener("mousemove", handleMouseMove); gsap.ticker.remove(tick); };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div key={i} className="ink-blob fixed opacity-0 w-0 h-0" />
      ))}
    </div>
  );
}

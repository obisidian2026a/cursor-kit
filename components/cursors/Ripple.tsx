"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE       = 20;
const RINGS_PER_CLICK = 3;
const MAX_SIZE        = 300;
const MOVE_GAP        = 80;

export default function Ripple() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".ripple-ring");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index       = 0;

    function spawnRipple(x: number, y: number, count = RINGS_PER_CLICK, maxSize = MAX_SIZE, baseOpacity = 0.8) {
      for (let i = 0; i < count; i++) {
        const ring = pool[wrapIndex(index)];
        gsap.killTweensOf(ring);
        gsap.set(ring, { clearProps: "all" });
        gsap.set(ring, { left: x, top: y, xPercent: -50, yPercent: -50, width: 0, height: 0, opacity: baseOpacity, borderRadius: "50%", border: "1.5px solid currentColor" });
        gsap.to(ring, { width: maxSize, height: maxSize, opacity: 0, duration: 1 + i * 0.15, delay: i * 0.1, ease: "power2.out" });
        index++;
      }
    }

    let lastMovePos = { x: 0, y: 0 };
    let isFirstMove = true;

    function handleClick(e: MouseEvent) { spawnRipple(e.clientX, e.clientY); }

    function handleMouseMove(e: MouseEvent) {
      const pos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) { lastMovePos = pos; isFirstMove = false; return; }
      if (Math.hypot(pos.x - lastMovePos.x, pos.y - lastMovePos.y) > MOVE_GAP) {
        spawnRipple(pos.x, pos.y, 1, 80, 0.25);
        lastMovePos = pos;
      }
    }

    window.addEventListener("click", handleClick);
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none text-white">
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div key={i} className="ripple-ring fixed opacity-0 w-0 h-0" />
      ))}
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const GHOST_COUNT = 12;
const LERP_STEP   = 0.18;

export default function GhostTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const ghosts = gsap.utils.toArray<HTMLElement>(".ghost");
    const positions = Array.from({ length: GHOST_COUNT }, () => ({ x: -200, y: -200 }));
    let mousePos    = { x: -200, y: -200 };
    let isFirstMove = true;

    function tick() {
      positions[0].x = gsap.utils.interpolate(positions[0].x, mousePos.x, LERP_STEP);
      positions[0].y = gsap.utils.interpolate(positions[0].y, mousePos.y, LERP_STEP);
      for (let i = 1; i < GHOST_COUNT; i++) {
        positions[i].x = gsap.utils.interpolate(positions[i].x, positions[i - 1].x, LERP_STEP);
        positions[i].y = gsap.utils.interpolate(positions[i].y, positions[i - 1].y, LERP_STEP);
      }
      ghosts.forEach((ghost, i) => {
        const progress = 1 - i / GHOST_COUNT;
        gsap.set(ghost, {
          x:       positions[i].x,
          y:       positions[i].y,
          scale:   gsap.utils.interpolate(0.15, 1, progress),
          opacity: gsap.utils.interpolate(0.05, 0.9, progress),
        });
      });
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) {
        positions.forEach((p) => { p.x = mousePos.x; p.y = mousePos.y; });
        isFirstMove = false;
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tick);
    return () => { window.removeEventListener("mousemove", handleMouseMove); gsap.ticker.remove(tick); };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {Array.from({ length: GHOST_COUNT }).map((_, i) => (
        <div key={i} className="ghost fixed w-5 h-5 rounded-full bg-white opacity-0"
          style={{ marginLeft: -10, marginTop: -10 }} />
      ))}
    </div>
  );
}

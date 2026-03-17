"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const PARTICLES_PER_BURST = 8;
const POOL_SIZE  = 80;
const TRAIL_GAP  = 30;
const SPREAD     = 60;
const COLORS     = ["#e2ff00","#ff6b35","#ffffff","#00d4ff","#ff3cac"];

function rnd(min: number, max: number) { return Math.random() * (max - min) + min; }

export default function ParticleBurst() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".particle");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index       = 0;
    let mousePos     = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let velocity     = { x: 0, y: 0 };
    let prevPos      = { x: 0, y: 0 };
    let isFirstMove  = true;

    function burst() {
      for (let i = 0; i < PARTICLES_PER_BURST; i++) {
        const p     = pool[wrapIndex(index)];
        const color = COLORS[Math.floor(Math.random() * COLORS.length)];
        const size  = rnd(3, 9);
        const base  = Math.atan2(velocity.y, velocity.x);
        const angle = base + rnd(-Math.PI * 0.6, Math.PI * 0.6);
        const dist  = rnd(SPREAD * 0.3, SPREAD);

        gsap.killTweensOf(p);
        gsap.set(p, { clearProps: "all" });
        gsap.set(p, { left: mousePos.x, top: mousePos.y, xPercent: -50, yPercent: -50, width: size, height: size, background: color, borderRadius: "50%", opacity: 1, x: 0, y: 0 });
        gsap.timeline()
          .to(p, { x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: rnd(0.2, 1), duration: rnd(0.4, 0.8), ease: "power3.out" })
          .to(p, { opacity: 0, duration: rnd(0.2, 0.5), ease: "power1.in" }, "-=0.2");
        index++;
      }
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        burst(); lastMousePos = { ...mousePos };
      }
    }

    function handleMouseMove(e: MouseEvent) {
      velocity = { x: e.clientX - prevPos.x, y: e.clientY - prevPos.y };
      prevPos  = { x: e.clientX, y: e.clientY };
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
        <div key={i} className="particle fixed opacity-0 rounded-full w-0 h-0" />
      ))}
    </div>
  );
}

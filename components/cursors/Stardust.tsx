"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 80;
const TRAIL_GAP = 12;
const METALS    = ["#ffd700","#fffacd","#c0c0c0","#e8e8e8","#fff5b1","#f5f5f5"];
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function Stardust() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".stardust");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, isFirstMove = true;

    function spawn() {
      const count = Math.floor(rnd(2, 5));
      for (let i = 0; i < count; i++) {
        const el    = pool[wrapIndex(index)];
        const size  = rnd(1.5, 5);
        const color = METALS[Math.floor(Math.random() * METALS.length)];
        const isStar = Math.random() > 0.5;

        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "all" });
        gsap.set(el, {
          left:         mousePos.x + rnd(-12, 12),
          top:          mousePos.y + rnd(-12, 12),
          xPercent:     -50, yPercent: -50,
          width:        size, height: size,
          borderRadius: isStar ? "0" : "50%",
          rotation:     isStar ? 45 : 0,
          background:   color,
          opacity:      rnd(0.6, 1),
          boxShadow:    `0 0 ${size * 2}px ${size}px ${color}`,
        });

        gsap.timeline()
          .to(el, {
            x:        rnd(-40, 40),
            y:        rnd(-60, 20),
            rotation: rnd(-180, 180),
            scale:    rnd(0.1, 0.5),
            opacity:  0,
            duration: rnd(0.8, 1.8),
            ease:     "power2.out",
          });
        index++;
      }
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        spawn(); lastMousePos = { ...mousePos };
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
        <div key={i} className="stardust fixed opacity-0 rounded-full w-0 h-0" />
      ))}
    </div>
  );
}

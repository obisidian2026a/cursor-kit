"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE       = 120;
const PIECES_PER_CLICK = 18;
const COLORS = ["#ff4757","#ffa502","#2ed573","#1e90ff","#ff6b81","#eccc68","#a29bfe","#fd79a8","#ffffff"];
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }
function choose<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

export default function Confetti() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".confetti-piece");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0;

    function burst(x: number, y: number) {
      for (let i = 0; i < PIECES_PER_CLICK; i++) {
        const el     = pool[wrapIndex(index)];
        const color  = choose(COLORS);
        const isRect = Math.random() > 0.5;
        const size   = rnd(6, 14);
        const angle  = rnd(0, 360);
        const dist   = rnd(60, 200);
        const rad    = (rnd(0, 360) * Math.PI) / 180;

        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "all" });
        gsap.set(el, {
          left:         x, top: y,
          xPercent:     -50, yPercent: -50,
          width:        isRect ? size : size * 0.6,
          height:       isRect ? size * 0.4 : size,
          borderRadius: isRect ? 2 : "50%",
          background:   color,
          opacity:      1, rotation: angle, x: 0, y: 0,
        });

        gsap.timeline()
          .to(el, {
            x:        Math.cos(rad) * dist,
            y:        Math.sin(rad) * dist - rnd(30, 80),
            rotation: angle + rnd(-360, 360),
            duration: rnd(0.5, 0.9),
            ease:     "power3.out",
          })
          .to(el, {
            y:        `+=${rnd(100, 250)}`, // gravity fall
            opacity:  0,
            duration: rnd(0.5, 1),
            ease:     "power2.in",
          }, "-=0.2");

        index++;
      }
    }

    window.addEventListener("click", (e) => burst(e.clientX, e.clientY));
    return () => window.removeEventListener("click", (e) => burst(e.clientX, e.clientY));
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <div key={i} className="confetti-piece fixed opacity-0" />
      ))}
    </div>
  );
}

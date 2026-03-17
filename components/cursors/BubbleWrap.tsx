"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 50;
const TRAIL_GAP = 28;
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function BubbleWrap() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".bubble");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, isFirstMove = true;

    function spawnBubble() {
      const el   = pool[wrapIndex(index)];
      const size = rnd(20, 55);

      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
      gsap.set(el, {
        left:         mousePos.x + rnd(-20, 20),
        top:          mousePos.y + rnd(-20, 20),
        xPercent:     -50, yPercent: -50,
        width:        0, height: 0,
        borderRadius: "50%",
        border:       "1.5px solid rgba(200,240,255,0.6)",
        background:   "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), rgba(200,230,255,0.05))",
        opacity:      1,
        boxShadow:    "inset 0 0 8px rgba(255,255,255,0.2)",
      });

      gsap.timeline()
        // Inflate
        .to(el, { width: size, height: size, duration: 0.15, ease: "back.out(2)" })
        // Wobble
        .to(el, { scaleX: 1.1, scaleY: 0.92, duration: 0.08 })
        .to(el, { scaleX: 0.95, scaleY: 1.05, duration: 0.08 })
        .to(el, { scaleX: 1, scaleY: 1, duration: 0.06 })
        // Pop!
        .to(el, {
          scale:   1.4,
          opacity: 0,
          duration: 0.12,
          ease:    "power2.out",
        }, `+=0.4`);

      index++;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        spawnBubble(); lastMousePos = { ...mousePos };
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
        <div key={i} className="bubble fixed opacity-0 w-0 h-0" />
      ))}
    </div>
  );
}

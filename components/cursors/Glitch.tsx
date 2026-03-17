"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 30;
const TRAIL_GAP = 28;
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function Glitch() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".glitch-artifact");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, isFirstMove = true;

    function spawnArtifact() {
      // Spawn 3 per position: R, G, B offset layers
      ["rgba(255,0,80,0.7)", "rgba(0,255,200,0.7)", "rgba(255,255,255,0.5)"].forEach((color, ci) => {
        const el = pool[wrapIndex(index + ci)];
        const w  = rnd(20, 120);
        const h  = rnd(2, 12);
        const ox = rnd(-30, 30) + (ci === 0 ? -4 : ci === 1 ? 4 : 0); // RGB split
        const oy = rnd(-20, 20);

        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "all" });
        gsap.set(el, {
          left: mousePos.x + ox, top: mousePos.y + oy,
          width: w, height: h,
          background: color,
          opacity: 1, skewX: rnd(-15, 15),
          xPercent: -50, yPercent: -50,
        });

        gsap.timeline()
          .to(el, { scaleX: rnd(0.2, 1.5), duration: 0.05, ease: "steps(2)" })
          .to(el, { opacity: 0, x: rnd(-40, 40), duration: rnd(0.1, 0.3), ease: "steps(3)" });
      });
      index += 3;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        spawnArtifact(); lastMousePos = { ...mousePos };
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
        <div key={i} className="glitch-artifact fixed opacity-0" />
      ))}
    </div>
  );
}

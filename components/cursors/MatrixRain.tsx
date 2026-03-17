"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE  = 60;
const TRAIL_GAP  = 20;
const CHARS      = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789ABCDEF";
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function MatrixRain() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".matrix-char");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, isFirstMove = true;

    function spawn() {
      // Spawn a column of 4-8 chars falling down
      const count = Math.floor(rnd(4, 9));
      for (let i = 0; i < count; i++) {
        const el = pool[wrapIndex(index + i)];
        const brightness = 1 - i / count;
        gsap.killTweensOf(el);
        gsap.set(el, { clearProps: "all" });
        el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
        gsap.set(el, {
          left:    mousePos.x + rnd(-10, 10),
          top:     mousePos.y,
          xPercent: -50, yPercent: -50,
          opacity: brightness,
          y:       i * 18,
          color:   i === 0 ? "#ffffff" : `rgba(0,255,70,${brightness})`,
          scale:   1,
        });
        gsap.timeline()
          .to(el, {
            y:       `+=${rnd(80, 200)}`,
            opacity: 0,
            duration: rnd(0.6, 1.2) + i * 0.05,
            ease:    "power1.in",
          });
      }
      index += count;
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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none font-mono">
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <span key={i} className="matrix-char fixed opacity-0 text-sm font-bold" style={{ color: "#00ff46" }} />
      ))}
    </div>
  );
}

"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 50;
const TRAIL_GAP = 22;
const PASTELS   = ["#ffb3c6","#ffd6a5","#fdffb6","#caffbf","#a0c4ff","#bdb2ff","#ffc6ff"];
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function Pollen() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".pollen-dot");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 }, prevPos = { x: 0, y: 0 }, isFirstMove = true;

    function spawn() {
      const el    = pool[wrapIndex(index)];
      const size  = rnd(4, 14);
      const color = PASTELS[Math.floor(Math.random() * PASTELS.length)];
      // Wind drift — biased by cursor velocity
      const windX = velocity.x * rnd(0.1, 0.4) + rnd(-30, 30);
      const windY = velocity.y * rnd(0.1, 0.3) + rnd(-60, -20); // float upward

      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
      gsap.set(el, {
        left: mousePos.x + rnd(-15, 15), top: mousePos.y + rnd(-15, 15),
        xPercent: -50, yPercent: -50,
        width: size, height: size,
        borderRadius: "50%",
        background: color,
        opacity: rnd(0.5, 0.9),
        scale: 1,
        boxShadow: `0 0 ${size}px ${color}`,
      });

      gsap.timeline()
        .to(el, { x: windX, y: windY, scale: rnd(0.3, 0.7), opacity: 0, duration: rnd(1.5, 3), ease: "power1.out" });

      index++;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        spawn(); lastMousePos = { ...mousePos };
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
        <div key={i} className="pollen-dot fixed opacity-0 rounded-full w-0 h-0" />
      ))}
    </div>
  );
}

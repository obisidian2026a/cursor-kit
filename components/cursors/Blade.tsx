"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 20;
const TRAIL_GAP = 35;
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function Blade() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".blade-slash");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0;
    let mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 };
    let velocity = { x: 0, y: 0 }, prevPos = { x: 0, y: 0 };
    let isFirstMove = true;

    function slash() {
      const el    = pool[wrapIndex(index)];
      const speed = Math.hypot(velocity.x, velocity.y);
      const len   = Math.max(40, Math.min(200, speed * 4));
      const angle = Math.atan2(velocity.y, velocity.x) * (180 / Math.PI);

      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
      gsap.set(el, {
        left:      mousePos.x, top: mousePos.y,
        xPercent:  -50, yPercent: -50,
        width:     len, height: 2,
        rotation:  angle,
        scaleX:    1,
        opacity:   1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)",
        boxShadow: "0 0 6px 1px rgba(255,255,255,0.5)",
      });

      gsap.timeline()
        .to(el, { scaleX: 0.1, opacity: 0, duration: 0.35, ease: "power3.in", transformOrigin: "right center" });

      index++;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        slash(); lastMousePos = { ...mousePos };
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
        <div key={i} className="blade-slash fixed opacity-0" />
      ))}
    </div>
  );
}

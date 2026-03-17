"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const MAGNETIC_STRENGTH = 0.4;
const CURSOR_LERP       = 0.12;

export default function MagneticCursor() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const dot  = containerRef.current!.querySelector<HTMLElement>(".cursor-dot")!;
    const ring = containerRef.current!.querySelector<HTMLElement>(".cursor-ring")!;

    document.body.style.cursor = "none";

    let mousePos    = { x: -200, y: -200 };
    let ringPos     = { x: -200, y: -200 };
    let isFirstMove = true;

    function tick() {
      ringPos.x = gsap.utils.interpolate(ringPos.x, mousePos.x, CURSOR_LERP);
      ringPos.y = gsap.utils.interpolate(ringPos.y, mousePos.y, CURSOR_LERP);
      gsap.set(ring, { x: ringPos.x, y: ringPos.y });
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) { ringPos = { ...mousePos }; isFirstMove = false; }
      gsap.set(dot, { x: mousePos.x, y: mousePos.y });
    }

    function handleMagneticEnter(e: Event) {
      const target = e.currentTarget as HTMLElement;
      const rect   = target.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;

      gsap.to(ring, { width: rect.width * 1.3, height: rect.height * 1.3, borderRadius: "12px", duration: 0.3, ease: "power2.out" });

      function magnetMove(ev: MouseEvent) {
        const dx = (ev.clientX - centerX) * MAGNETIC_STRENGTH;
        const dy = (ev.clientY - centerY) * MAGNETIC_STRENGTH;
        gsap.to(target, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
        mousePos = { x: centerX + dx, y: centerY + dy };
      }
      target.addEventListener("mousemove", magnetMove);
      (target as HTMLElement & { _magnetMove?: (ev: MouseEvent) => void })._magnetMove = magnetMove;
    }

    function handleMagneticLeave(e: Event) {
      const target = e.currentTarget as HTMLElement & { _magnetMove?: (ev: MouseEvent) => void };
      if (target._magnetMove) { target.removeEventListener("mousemove", target._magnetMove); delete target._magnetMove; }
      gsap.to(target, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
      gsap.to(ring, { width: 36, height: 36, borderRadius: "50%", duration: 0.3, ease: "power2.out" });
    }

    const magneticEls = document.querySelectorAll<HTMLElement>("[data-magnetic]");
    magneticEls.forEach((el) => {
      el.style.cursor = "none";
      el.addEventListener("mouseenter", handleMagneticEnter);
      el.addEventListener("mouseleave", handleMagneticLeave);
    });

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tick);
      document.body.style.cursor = "";
      magneticEls.forEach((el) => {
        el.removeEventListener("mouseenter", handleMagneticEnter);
        el.removeEventListener("mouseleave", handleMagneticLeave);
      });
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div className="cursor-dot fixed top-0 left-0 w-2 h-2 rounded-full bg-white z-[9999]"
        style={{ transform: "translate(-50%,-50%)" }} />
      <div className="cursor-ring fixed top-0 left-0 w-9 h-9 rounded-full border border-white z-[9998]"
        style={{ transform: "translate(-50%,-50%)" }} />
    </div>
  );
}

"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const SPOTLIGHT_SIZE = 320;
const LERP           = 0.1;

export default function Spotlight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const maskRef      = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mask = maskRef.current!;
    let mousePos    = { x: -999, y: -999 };
    let maskPos     = { x: -999, y: -999 };
    let isFirstMove = true;

    function updateMask(x: number, y: number) {
      const m = `radial-gradient(circle ${SPOTLIGHT_SIZE / 2}px at ${x}px ${y}px, transparent 60%, black 100%)`;
      mask.style.maskImage = m;
      mask.style.webkitMaskImage = m;
    }

    function tick() {
      maskPos.x = gsap.utils.interpolate(maskPos.x, mousePos.x, LERP);
      maskPos.y = gsap.utils.interpolate(maskPos.y, mousePos.y, LERP);
      updateMask(maskPos.x, maskPos.y);
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) { maskPos = { ...mousePos }; isFirstMove = false; }
    }

    updateMask(-999, -999);
    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tick);
    return () => { window.removeEventListener("mousemove", handleMouseMove); gsap.ticker.remove(tick); };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      <div
        ref={maskRef}
        className="absolute inset-0 bg-black"
        style={{
          maskImage: "radial-gradient(circle 0px at -999px -999px, transparent 60%, black 100%)",
          WebkitMaskImage: "radial-gradient(circle 0px at -999px -999px, transparent 60%, black 100%)",
        }}
      />
    </div>
  );
}

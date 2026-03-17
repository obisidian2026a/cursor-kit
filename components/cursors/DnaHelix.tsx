"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE  = 40;
const TRAIL_GAP  = 12;
const AMPLITUDE  = 18;
const WAVELENGTH = 60;
const COLOR_A    = "#00d4ff";
const COLOR_B    = "#ff3cac";

export default function DnaHelix() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const strandA = gsap.utils.toArray<HTMLElement>(".dna-a");
    const strandB = gsap.utils.toArray<HTMLElement>(".dna-b");
    const wrapA   = gsap.utils.wrap(0, strandA.length);
    const wrapB   = gsap.utils.wrap(0, strandB.length);
    let iA = 0, iB = 0, step = 0;
    let mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 };
    let isFirstMove = true;

    function spawn(pool: HTMLElement[], wrap: (n:number)=>number, idx: number, phase: number, color: string) {
      const el     = pool[wrap(idx)];
      const offset = Math.sin((step / WAVELENGTH) * Math.PI * 2 + phase) * AMPLITUDE;
      const dx     = mousePos.x - lastMousePos.x;
      const dy     = mousePos.y - lastMousePos.y;
      const len    = Math.hypot(dx, dy) || 1;
      gsap.killTweensOf(el); gsap.set(el, { clearProps: "all" });
      gsap.set(el, {
        left: mousePos.x + (-dy/len)*offset, top: mousePos.y + (dx/len)*offset,
        xPercent: -50, yPercent: -50, opacity: 1,
        background: color, width: 6, height: 6, borderRadius: "50%",
        boxShadow: `0 0 6px 2px ${color}`,
      });
      gsap.to(el, { opacity: 0, scale: 0, duration: 0.8, ease: "power2.in" });
    }

    function tick() {
      const dist = Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y);
      if (dist > TRAIL_GAP) {
        spawn(strandA, wrapA, iA, 0,       COLOR_A);
        spawn(strandB, wrapB, iB, Math.PI, COLOR_B);
        iA++; iB++; step += dist; lastMousePos = { ...mousePos };
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
      {Array.from({ length: POOL_SIZE }).map((_, i) => <div key={`a${i}`} className="dna-a fixed opacity-0 w-0 h-0" />)}
      {Array.from({ length: POOL_SIZE }).map((_, i) => <div key={`b${i}`} className="dna-b fixed opacity-0 w-0 h-0" />)}
    </div>
  );
}

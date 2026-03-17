"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 30;
const TRAIL_GAP = 38;
const WORDS     = ["design","code","motion","craft","build","create","ship","think","make","develop","pixel","type","layout","ui","ux"];

export default function TextTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".text-particle");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    const wrapWord  = gsap.utils.wrap(0, WORDS.length);
    let index = 0, wordIndex = 0;
    let mousePos     = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let velocity     = { x: 0, y: 0 };
    let prevPos      = { x: 0, y: 0 };
    let isFirstMove  = true;

    function dropWord() {
      const el       = pool[wrapIndex(index)];
      el.textContent = WORDS[wrapWord(wordIndex)];
      const rotation = gsap.utils.clamp(-25, 25, velocity.x * 1.5);
      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
      gsap.set(el, { left: mousePos.x, top: mousePos.y, xPercent: -50, yPercent: -50, opacity: 1, scale: 1, rotation, y: 0 });
      gsap.timeline()
        .from(el, { scale: 1.4, duration: 0.08, ease: "power3.out" })
        .to(el,   { y: -30, opacity: 0, scale: 0.7, duration: 0.9, ease: "power2.out" }, "+=0.2");
      index++; wordIndex++;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        dropWord(); lastMousePos = { ...mousePos };
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
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      {Array.from({ length: POOL_SIZE }).map((_, i) => (
        <span key={i} className="text-particle fixed opacity-0 text-sm font-medium uppercase tracking-widest text-white" />
      ))}
    </div>
  );
}

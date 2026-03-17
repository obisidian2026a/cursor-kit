"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE  = 60;
const TRAIL_GAP  = 18;
const PIXEL_SIZE = 14; // snapped to grid
const PALETTE    = ["#ff004d","#ff77a8","#ffa300","#ffec27","#00e436","#29adff","#7e2553","#ffffff"];
function rnd(a: number, b: number) { return Math.random() * (b - a) + a; }

export default function PixelTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool      = gsap.utils.toArray<HTMLElement>(".pixel-stamp");
    const wrapIndex = gsap.utils.wrap(0, pool.length);
    let index = 0, mousePos = { x: 0, y: 0 }, lastMousePos = { x: 0, y: 0 }, isFirstMove = true;

    function spawnPixel() {
      // Snap to pixel grid
      const gx    = Math.round(mousePos.x / PIXEL_SIZE) * PIXEL_SIZE;
      const gy    = Math.round(mousePos.y / PIXEL_SIZE) * PIXEL_SIZE;
      const color = PALETTE[Math.floor(Math.random() * PALETTE.length)];
      const el    = pool[wrapIndex(index)];

      gsap.killTweensOf(el);
      gsap.set(el, { clearProps: "all" });
      gsap.set(el, {
        left:       gx, top: gy,
        width:      PIXEL_SIZE, height: PIXEL_SIZE,
        background: color,
        opacity:    1, scale: 1,
        imageRendering: "pixelated",
        borderRadius: 0,
      });

      // Stamp in, hold, dissolve
      gsap.timeline()
        .from(el, { scale: 2, duration: 0.06, ease: "steps(1)" })
        .to(el,   { opacity: 0, scale: rnd(0.2, 0.8), duration: rnd(0.4, 0.9), ease: "steps(4)" }, "+=0.1");

      index++;
    }

    function tick() {
      if (Math.hypot(mousePos.x - lastMousePos.x, mousePos.y - lastMousePos.y) > TRAIL_GAP) {
        spawnPixel(); lastMousePos = { ...mousePos };
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
        <div key={i} className="pixel-stamp fixed opacity-0" style={{ imageRendering: "pixelated" }} />
      ))}
    </div>
  );
}

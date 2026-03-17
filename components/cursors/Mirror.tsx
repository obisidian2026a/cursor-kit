"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

// Mirror: a reflected ghost cursor moves inversely across the center point of the screen

const LERP = 0.1;

export default function Mirror() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const real   = containerRef.current!.querySelector<HTMLElement>(".cursor-real")!;
    const mirror = containerRef.current!.querySelector<HTMLElement>(".cursor-mirror")!;
    const line   = containerRef.current!.querySelector<HTMLElement>(".mirror-line")!;

    document.body.style.cursor = "none";

    let mousePos    = { x: -200, y: -200 };
    let mirrorPos   = { x: -200, y: -200 };
    let isFirstMove = true;

    function tick() {
      const cx = window.innerWidth  / 2;
      const cy = window.innerHeight / 2;

      // Mirror position = reflected across center
      const targetMX = cx * 2 - mousePos.x;
      const targetMY = cy * 2 - mousePos.y;

      mirrorPos.x = gsap.utils.interpolate(mirrorPos.x, targetMX, LERP);
      mirrorPos.y = gsap.utils.interpolate(mirrorPos.y, targetMY, LERP);

      gsap.set(real,   { x: mousePos.x,  y: mousePos.y  });
      gsap.set(mirror, { x: mirrorPos.x, y: mirrorPos.y });

      // Draw a faint line between them
      const dx   = mirrorPos.x - mousePos.x;
      const dy   = mirrorPos.y - mousePos.y;
      const dist = Math.hypot(dx, dy);
      const ang  = Math.atan2(dy, dx) * (180 / Math.PI);

      gsap.set(line, {
        x:         mousePos.x,
        y:         mousePos.y,
        width:     dist,
        rotation:  ang,
        opacity:   0.12,
      });
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) {
        mirrorPos   = { x: window.innerWidth - e.clientX, y: window.innerHeight - e.clientY };
        isFirstMove = false;
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(tick);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(tick);
      document.body.style.cursor = "";
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {/* Connecting line */}
      <div
        className="mirror-line fixed top-0 left-0 h-px bg-white opacity-0"
        style={{ transformOrigin: "left center" }}
      />

      {/* Real cursor — solid white */}
      <div
        className="cursor-real fixed top-0 left-0 w-3 h-3 rounded-full bg-white z-[9999]"
        style={{ marginLeft: -6, marginTop: -6 }}
      />

      {/* Mirror cursor — outlined, slightly dimmer */}
      <div
        className="cursor-mirror fixed top-0 left-0 w-3 h-3 rounded-full z-[9998]"
        style={{
          marginLeft:  -6,
          marginTop:   -6,
          border:      "1.5px solid rgba(255,255,255,0.55)",
          background:  "rgba(255,255,255,0.08)",
        }}
      />

      {/* Center crosshair mark */}
      <div
        className="fixed"
        style={{
          left:      "50%",
          top:       "50%",
          transform: "translate(-50%,-50%)",
          width:     8,
          height:    8,
          borderRadius: "50%",
          border:    "1px solid rgba(255,255,255,0.2)",
        }}
      />
    </div>
  );
}

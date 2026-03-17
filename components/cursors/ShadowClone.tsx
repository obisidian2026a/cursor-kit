"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const FORMATION = [
  { dx:  0,  dy:  0,  lerp: 0.14, scale: 1,    opacity: 1    },
  { dx: -28, dy: 20,  lerp: 0.10, scale: 0.85, opacity: 0.75 },
  { dx:  28, dy: 20,  lerp: 0.10, scale: 0.85, opacity: 0.75 },
  { dx: -52, dy: 44,  lerp: 0.07, scale: 0.7,  opacity: 0.5  },
  { dx:  52, dy: 44,  lerp: 0.07, scale: 0.7,  opacity: 0.5  },
];

export default function ShadowClone() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const cursors   = gsap.utils.toArray<HTMLElement>(".clone-cursor");
    const positions = FORMATION.map(() => ({ x: -200, y: -200 }));
    const targets   = FORMATION.map(() => ({ x: -200, y: -200 }));
    let mousePos    = { x: -200, y: -200 };
    let isFirstMove = true;

    document.body.style.cursor = "none";

    function tick() {
      targets[0].x = mousePos.x;
      targets[0].y = mousePos.y;
      FORMATION.forEach((f, i) => {
        if (i === 0) return;
        targets[i].x = targets[0].x + f.dx;
        targets[i].y = targets[0].y + f.dy;
      });
      FORMATION.forEach((f, i) => {
        positions[i].x = gsap.utils.interpolate(positions[i].x, targets[i].x, f.lerp);
        positions[i].y = gsap.utils.interpolate(positions[i].y, targets[i].y, f.lerp);
        gsap.set(cursors[i], { x: positions[i].x, y: positions[i].y });
      });
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) {
        positions.forEach((p) => { p.x = mousePos.x; p.y = mousePos.y; });
        targets.forEach((t)   => { t.x = mousePos.x; t.y = mousePos.y; });
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
      {FORMATION.map((f, i) => (
        <div
          key={i}
          className="clone-cursor fixed top-0 left-0 rounded-full"
          style={{
            width: 12, height: 12,
            marginLeft: -6, marginTop: -6,
            background: i === 0 ? "white" : `hsl(${220 + i * 20},80%,${70 - i * 5}%)`,
            opacity: f.opacity,
            transform: `scale(${f.scale})`,
            boxShadow: `0 0 ${6 + i * 2}px ${i === 0 ? "white" : `hsl(${220 + i * 20},80%,70%)`}`,
          }}
        />
      ))}
    </div>
  );
}

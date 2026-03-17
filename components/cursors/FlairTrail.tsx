"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const FLAIR_SRCS = [
  "https://assets.codepen.io/16327/Revised+Flair.png",
  "https://assets.codepen.io/16327/Revised+Flair-1.png",
  "https://assets.codepen.io/16327/Revised+Flair-2.png",
  "https://assets.codepen.io/16327/Revised+Flair-3.png",
  "https://assets.codepen.io/16327/Revised+Flair-4.png",
  "https://assets.codepen.io/16327/Revised+Flair-5.png",
  "https://assets.codepen.io/16327/Revised+Flair-6.png",
  "https://assets.codepen.io/16327/Revised+Flair-7.png",
  "https://assets.codepen.io/16327/Revised+Flair-8.png",
];

const POOL_REPEAT = 2;
const FLAIR_POOL  = Array.from({ length: POOL_REPEAT }, () => FLAIR_SRCS).flat();
const TRAIL_GAP   = 100;

function playAnimation(shape: HTMLElement) {
  gsap.timeline()
    .from(shape, { opacity: 0, scale: 0, ease: "elastic.out(1,0.3)" })
    .to(shape,   { rotation: "random([-360, 360])" }, "<")
    .to(shape,   { y: "120vh", ease: "back.in(.4)", duration: 1 }, 0);
}

export default function FlairTrail() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const flair      = gsap.utils.toArray<HTMLElement>(".flair-img");
    const wrapIndex  = gsap.utils.wrap(0, flair.length);
    let index        = 0;
    gsap.defaults({ duration: 1 });

    let isFirstMove  = true;
    let mousePos     = { x: 0, y: 0 };
    let lastMousePos = { x: 0, y: 0 };
    let cachedMousePos = { x: 0, y: 0 };

    function animateImage() {
      const img = flair[wrapIndex(index)];
      gsap.killTweensOf(img);
      gsap.set(img, { clearProps: "all" });
      gsap.set(img, { opacity: 1, left: mousePos.x, top: mousePos.y, xPercent: -50, yPercent: -50 });
      playAnimation(img);
      index++;
    }

    function imageTrail() {
      const dist = Math.hypot(lastMousePos.x - mousePos.x, lastMousePos.y - mousePos.y);
      cachedMousePos.x = gsap.utils.interpolate(cachedMousePos.x, mousePos.x, 0.1);
      cachedMousePos.y = gsap.utils.interpolate(cachedMousePos.y, mousePos.y, 0.1);
      if (dist > TRAIL_GAP) { animateImage(); lastMousePos = { ...mousePos }; }
    }

    function handleMouseMove(e: MouseEvent) {
      mousePos = { x: e.clientX, y: e.clientY };
      if (isFirstMove) {
        lastMousePos   = { ...mousePos };
        cachedMousePos = { ...mousePos };
        isFirstMove    = false;
      }
    }

    window.addEventListener("mousemove", handleMouseMove);
    gsap.ticker.add(imageTrail);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      gsap.ticker.remove(imageTrail);
    };
  }, { scope: containerRef });

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      <div className="pointer-events-none">
        {FLAIR_POOL.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={i} src={src} alt="" className="flair-img fixed opacity-0 w-[50px]" />
        ))}
      </div>
    </div>
  );
}

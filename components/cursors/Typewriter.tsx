"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 40;
const TRAIL_GAP = 32;
const CHARS     = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&?";

export default function Typewriter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool=gsap.utils.toArray<HTMLElement>(".tw-char");
    const wrapIndex=gsap.utils.wrap(0,pool.length);
    let index=0, mousePos={x:0,y:0}, lastMousePos={x:0,y:0}, isFirstMove=true;

    function spawn() {
      const el=pool[wrapIndex(index)];
      el.textContent=CHARS[Math.floor(Math.random()*CHARS.length)];
      gsap.killTweensOf(el); gsap.set(el,{clearProps:"all"});
      gsap.set(el,{left:mousePos.x,top:mousePos.y,xPercent:-50,yPercent:-50,opacity:1,scale:1,y:0,color:`hsl(${Math.random()*360},80%,70%)`});
      gsap.timeline()
        .from(el,{scale:1.6,duration:0.08,ease:"power3.out"})
        .to(el,{opacity:0,y:-20,scale:0.7,duration:0.7,ease:"power2.in"},"+=0.2");
      index++;
    }

    function tick() {
      if(Math.hypot(mousePos.x-lastMousePos.x,mousePos.y-lastMousePos.y)>TRAIL_GAP){spawn();lastMousePos={...mousePos};}
    }

    function handleMouseMove(e:MouseEvent) {
      mousePos={x:e.clientX,y:e.clientY};
      if(isFirstMove){lastMousePos={...mousePos};isFirstMove=false;}
    }

    window.addEventListener("mousemove",handleMouseMove); gsap.ticker.add(tick);
    return ()=>{window.removeEventListener("mousemove",handleMouseMove);gsap.ticker.remove(tick);};
  },{scope:containerRef});

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none select-none font-mono">
      {Array.from({length:POOL_SIZE}).map((_,i)=><span key={i} className="tw-char fixed opacity-0 text-base font-bold"/>)}
    </div>
  );
}

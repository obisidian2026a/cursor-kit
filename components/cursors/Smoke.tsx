"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const POOL_SIZE = 40;
const TRAIL_GAP = 20;
function rnd(a:number,b:number){return Math.random()*(b-a)+a;}

export default function Smoke() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool=gsap.utils.toArray<HTMLElement>(".smoke-puff");
    const wrapIndex=gsap.utils.wrap(0,pool.length);
    let index=0, mousePos={x:0,y:0}, lastMousePos={x:0,y:0};
    let velocity={x:0,y:0}, prevPos={x:0,y:0}, isFirstMove=true;

    function spawnPuff() {
      const el=pool[wrapIndex(index)];
      const size=rnd(30,80);
      gsap.killTweensOf(el); gsap.set(el,{clearProps:"all"});
      gsap.set(el,{ left:mousePos.x, top:mousePos.y, xPercent:-50, yPercent:-50,
        width:size, height:size, borderRadius:"50%", opacity:rnd(0.25,0.45), scale:0.3,
        filter:`blur(${rnd(6,14)}px)`, background:`hsl(0,0%,${Math.floor(rnd(70,95))}%)` });
      gsap.timeline().to(el,{ scale:rnd(1.5,2.5), x:velocity.x*0.5+rnd(-20,20), y:-rnd(40,100), opacity:0, duration:rnd(1.2,2), ease:"power1.out" });
      index++;
    }

    function tick() {
      if(Math.hypot(mousePos.x-lastMousePos.x,mousePos.y-lastMousePos.y)>TRAIL_GAP){ spawnPuff(); lastMousePos={...mousePos}; }
    }

    function handleMouseMove(e:MouseEvent) {
      velocity={x:e.clientX-prevPos.x,y:e.clientY-prevPos.y};
      prevPos={x:e.clientX,y:e.clientY}; mousePos={x:e.clientX,y:e.clientY};
      if(isFirstMove){lastMousePos={...mousePos};isFirstMove=false;}
    }

    window.addEventListener("mousemove",handleMouseMove); gsap.ticker.add(tick);
    return ()=>{window.removeEventListener("mousemove",handleMouseMove);gsap.ticker.remove(tick);};
  },{scope:containerRef});

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({length:POOL_SIZE}).map((_,i)=><div key={i} className="smoke-puff fixed opacity-0 rounded-full"/>)}
    </div>
  );
}

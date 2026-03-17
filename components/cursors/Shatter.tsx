"use client";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

gsap.registerPlugin(useGSAP);

const SHARD_COUNT = 14;
const POOL_SIZE   = SHARD_COUNT * 6;
function rnd(a:number,b:number){return Math.random()*(b-a)+a;}
function shardPath(){return `polygon(${Array.from({length:3},()=>`${rnd(0,100)}% ${rnd(0,100)}%`).join(",")})`;}

export default function Shatter() {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const pool=gsap.utils.toArray<HTMLElement>(".shard");
    const wrapIndex=gsap.utils.wrap(0,pool.length);
    let index=0;

    function shatter(x:number,y:number) {
      for(let i=0;i<SHARD_COUNT;i++){
        const el=pool[wrapIndex(index)];
        const size=rnd(20,70), angle=rnd(0,360), dist=rnd(40,160);
        const rad=(angle*Math.PI)/180;
        gsap.killTweensOf(el); gsap.set(el,{clearProps:"all"});
        gsap.set(el,{left:x,top:y,xPercent:-50,yPercent:-50,width:size,height:size*rnd(0.4,1.2),
          clipPath:shardPath(),background:`rgba(255,255,255,${rnd(0.4,0.9)})`,opacity:1,scale:1,rotation:rnd(-30,30),x:0,y:0,
          boxShadow:"0 0 8px rgba(255,255,255,0.5)"});
        gsap.timeline()
          .to(el,{x:Math.cos(rad)*dist,y:Math.sin(rad)*dist+rnd(50,150),rotation:rnd(-180,180),duration:rnd(0.5,1),ease:"power2.out"})
          .to(el,{opacity:0,y:`+=${rnd(50,150)}`,duration:rnd(0.3,0.6),ease:"power1.in"},"-=0.2");
        index++;
      }
    }

    window.addEventListener("click",(e)=>shatter(e.clientX,e.clientY));
    return ()=>window.removeEventListener("click",(e)=>shatter(e.clientX,e.clientY));
  },{scope:containerRef});

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({length:POOL_SIZE}).map((_,i)=><div key={i} className="shard fixed opacity-0"/>)}
    </div>
  );
}

"use client";
import { useRef, useEffect } from "react";

interface Blob{x:number;y:number;vx:number;vy:number;r:number;life:number;}

export default function LiquidMercury() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!;
    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
    resize(); window.addEventListener("resize",resize);

    const blobs:Blob[]=[];
    let lastPos={x:-999,y:-999}, mousePos={x:-999,y:-999}, isFirstMove=true;
    window.addEventListener("mousemove",(e)=>{
      mousePos={x:e.clientX,y:e.clientY};
      if(isFirstMove){lastPos={...mousePos};isFirstMove=false;}
    });

    let rafId:number;
    function draw() {
      if(!isFirstMove&&Math.hypot(mousePos.x-lastPos.x,mousePos.y-lastPos.y)>18){
        const vx=mousePos.x-lastPos.x, vy=mousePos.y-lastPos.y;
        if(blobs.length>=30) blobs.shift();
        blobs.push({x:mousePos.x,y:mousePos.y,vx:vx*0.3+(Math.random()-0.5)*2,vy:vy*0.3+(Math.random()-0.5)*2,r:Math.random()*14+8,life:1});
        lastPos={...mousePos};
      }
      blobs.forEach((b)=>{b.x+=b.vx;b.y+=b.vy;b.vx*=0.95;b.vy*=0.95;b.life-=0.008;});
      for(let i=blobs.length-1;i>=0;i--){if(blobs[i].life<=0)blobs.splice(i,1);}

      ctx.fillStyle="#111"; ctx.fillRect(0,0,canvas.width,canvas.height);
      blobs.forEach((b)=>{
        const a=Math.max(0,b.life);
        const g=ctx.createRadialGradient(b.x,b.y,0,b.x,b.y,b.r);
        g.addColorStop(0,  `rgba(210,215,220,${a})`);
        g.addColorStop(0.5,`rgba(160,168,175,${a*0.9})`);
        g.addColorStop(0.8,`rgba(100,110,120,${a*0.5})`);
        g.addColorStop(1,  `rgba(80,90,100,0)`);
        ctx.save(); ctx.shadowColor=`rgba(200,210,220,${a*0.6})`; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.arc(b.x,b.y,b.r,0,Math.PI*2); ctx.fillStyle=g; ctx.fill(); ctx.restore();
      });
      rafId=requestAnimationFrame(draw);
    }
    draw();

    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener("resize",resize);};
  },[]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>;
}

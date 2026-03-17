"use client";
import { useRef, useEffect } from "react";

const PARTICLE_COUNT = 100;
const SUCK_RADIUS    = 140;
const SUCK_STRENGTH  = 3.5;
const SPIN_STRENGTH  = 2.5;

interface P{ox:number;oy:number;x:number;y:number;vx:number;vy:number;size:number;hue:number;}

export default function Wormhole() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!;
    let particles:P[]=[];

    function resize() {
      canvas.width=window.innerWidth; canvas.height=window.innerHeight;
      particles=Array.from({length:PARTICLE_COUNT},()=>{
        const x=Math.random()*canvas.width, y=Math.random()*canvas.height;
        return{ox:x,oy:y,x,y,vx:0,vy:0,size:Math.random()*2.5+1,hue:Math.random()*60+240};
      });
    }
    resize(); window.addEventListener("resize",resize);

    let mouse={x:-999,y:-999}, isActive=false;
    window.addEventListener("mousemove",(e)=>{mouse={x:e.clientX,y:e.clientY};isActive=true;});

    let rafId:number;
    function draw() {
      ctx.fillStyle="#05050f"; ctx.fillRect(0,0,canvas.width,canvas.height);
      if(isActive){
        for(let r=1;r<=3;r++){
          ctx.beginPath(); ctx.arc(mouse.x,mouse.y,SUCK_RADIUS*(r/3),0,Math.PI*2);
          ctx.strokeStyle=`hsla(260,80%,70%,${0.08*(4-r)})`; ctx.lineWidth=1; ctx.stroke();
        }
      }
      particles.forEach((p)=>{
        const dx=mouse.x-p.x, dy=mouse.y-p.y, dist=Math.hypot(dx,dy);
        if(dist<SUCK_RADIUS&&isActive){
          const pull=(SUCK_RADIUS-dist)/SUCK_RADIUS;
          p.vx+=(dx/dist)*pull*SUCK_STRENGTH; p.vy+=(dy/dist)*pull*SUCK_STRENGTH;
          p.vx+=(-dy/dist)*pull*SPIN_STRENGTH; p.vy+=(dx/dist)*pull*SPIN_STRENGTH;
          if(dist<8){p.x=Math.random()*canvas.width;p.y=Math.random()*canvas.height;p.vx=0;p.vy=0;}
        } else { p.vx+=(p.ox-p.x)*0.03; p.vy+=(p.oy-p.y)*0.03; }
        p.vx*=0.88; p.vy*=0.88; p.x+=p.vx; p.y+=p.vy;
        const speed=Math.hypot(p.vx,p.vy);
        ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`hsla(${p.hue},80%,70%,${Math.min(1,0.3+speed*0.1)})`; ctx.fill();
      });
      rafId=requestAnimationFrame(draw);
    }
    draw();

    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener("resize",resize);};
  },[]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>;
}

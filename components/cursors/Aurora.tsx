"use client";
import { useRef, useEffect } from "react";

interface Point{x:number;y:number;}
function lerp(a:number,b:number,t:number){return a+(b-a)*t;}

export default function Aurora() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas=canvasRef.current!; const ctx=canvas.getContext("2d")!;
    function resize(){canvas.width=window.innerWidth;canvas.height=window.innerHeight;}
    resize(); window.addEventListener("resize",resize);

    const history:Point[]=[];
    let smooth={x:window.innerWidth/2,y:window.innerHeight/2};
    let mouse={...smooth}, hue=150;

    window.addEventListener("mousemove",(e)=>{mouse={x:e.clientX,y:e.clientY};});

    let rafId:number;
    function draw() {
      hue=(hue+0.3)%360;
      smooth.x=lerp(smooth.x,mouse.x,0.08); smooth.y=lerp(smooth.y,mouse.y,0.08);
      history.push({...smooth}); if(history.length>60) history.shift();

      ctx.fillStyle="rgba(2,8,24,0.18)"; ctx.fillRect(0,0,canvas.width,canvas.height);
      if(history.length<4){rafId=requestAnimationFrame(draw);return;}

      const upper:Point[]=[], lower:Point[]=[];
      history.forEach((pt,i)=>{
        const prev=history[Math.max(0,i-1)], next=history[Math.min(history.length-1,i+1)];
        const dx=next.x-prev.x, dy=next.y-prev.y, len=Math.hypot(dx,dy)||1;
        const w=40*(1-i/history.length);
        upper.push({x:pt.x+(-dy/len)*w,y:pt.y+(dx/len)*w});
        lower.push({x:pt.x+(dy/len)*w,y:pt.y+(-dx/len)*w});
      });

      ctx.beginPath();
      ctx.moveTo(upper[0].x,upper[0].y);
      upper.forEach((p)=>ctx.lineTo(p.x,p.y));
      lower.slice().reverse().forEach((p)=>ctx.lineTo(p.x,p.y));
      ctx.closePath();

      const g=ctx.createLinearGradient(history[0].x,history[0].y,history[history.length-1].x,history[history.length-1].y);
      g.addColorStop(0,   `hsla(${hue},100%,70%,0)`);
      g.addColorStop(0.4, `hsla(${hue},100%,70%,0.35)`);
      g.addColorStop(0.7, `hsla(${(hue+60)%360},100%,65%,0.5)`);
      g.addColorStop(1,   `hsla(${(hue+120)%360},100%,60%,0.6)`);

      ctx.save();
      ctx.shadowColor=`hsl(${hue},100%,70%)`; ctx.shadowBlur=30;
      ctx.fillStyle=g; ctx.fill(); ctx.restore();

      rafId=requestAnimationFrame(draw);
    }
    draw();

    return ()=>{cancelAnimationFrame(rafId);window.removeEventListener("resize",resize);};
  },[]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full"/>;
}

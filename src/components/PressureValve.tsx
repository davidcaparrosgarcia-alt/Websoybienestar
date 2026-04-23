import React from 'react';
import { motion } from 'motion/react';

interface PressureValveProps {
  degrees: number;
}

export default function PressureValve({ degrees }: PressureValveProps) {
  // degrees range: 0 to 180
  // CSS rotation mapping: 0 -> -90deg (pointing left), 180 -> 90deg (pointing right)
  const rotation = degrees - 90;

  // Generate ticks for 180 degrees
  const ticks = Array.from({ length: 37 }).map((_, i) => {
    // 36 gaps means each gap is 5 degrees. 
    const angle = i * 5; 
    const rad = angle * (Math.PI / 180);
    // Every 4th tick is major (20 degrees)
    const isMajor = i % 4 === 0;
    const isMedium = i % 2 === 0 && !isMajor;

    const R_inner = isMajor ? 62 : isMedium ? 68 : 74;
    const R_outer = 80;
    
    // For SVG: 0 degrees is left (x=20, y=100) -> so -cos and -sin
    const x1 = 100 - R_inner * Math.cos(rad);
    const y1 = 100 - R_inner * Math.sin(rad);
    const x2 = 100 - R_outer * Math.cos(rad);
    const y2 = 100 - R_outer * Math.sin(rad);

    return (
      <line 
        key={i} 
        x1={x1} y1={y1} x2={x2} y2={y2} 
        stroke="rgba(255,255,255,0.4)" 
        strokeWidth={isMajor ? 2.5 : 1} 
        strokeLinecap="round"
      />
    );
  });

  return (
    <div className="relative w-80 h-40 mx-auto overflow-hidden flex flex-col items-center justify-end">
      {/* Outer Brass Ring */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full border-[18px] border-[#c59c5d] shadow-[0_10px_30px_rgba(0,0,0,0.8),inset_0_10px_30px_rgba(0,0,0,0.9)] bg-[radial-gradient(circle_at_center,#2a3238_0%,#0f1418_100%)]">
        {/* Inner subtle metallic bezel */}
        <div className="absolute inset-0 rounded-full border-[3px] border-[#e6c888]/20 pointer-events-none"></div>
      </div>
      
      {/* Gauge Zones & Ticks (SVG) */}
      <svg className="absolute top-0 left-0 w-80 h-80 drop-shadow-lg" viewBox="0 0 200 200">
        
        {/* Glow behind colored zones */}
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Thicker color bands on the extreme outer edge */}
        <g strokeWidth="6" fill="none" opacity="0.8" filter="url(#glow)">
          {/* Green: 0 to 40 deg */}
          <path d="M 12 100 A 88 88 0 0 1 32.58 43.43" stroke="#22c55e" />
          
          {/* Yellow: 40 to 80 deg */}
          <path d="M 32.58 43.43 A 88 88 0 0 1 84.72 13.34" stroke="#eab308" />
          
          {/* Orange: 80 to 130 deg */}
          <path d="M 84.72 13.34 A 88 88 0 0 1 156.56 32.58" stroke="#f97316" />
          
          {/* Red: 130 to 180 deg */}
          <path d="M 156.56 32.58 A 88 88 0 0 1 188 100" stroke="#ef4444" />
        </g>

        {/* Ticks rendered on top */}
        {ticks}

        {/* Central decorative arc */}
        <path d="M 40 100 A 60 60 0 0 1 160 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      </svg>

      {/* Glass Reflection */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-gradient-to-br from-white/10 via-white/5 to-transparent pointer-events-none z-20"></div>

      {/* Needle */}
      <div className="absolute bottom-0 left-1/2 w-4 h-[135px] -translate-x-1/2 z-10" style={{ transformOrigin: 'bottom center' }}>
        <motion.div 
          className="w-full h-full relative"
          style={{ transformOrigin: 'bottom center' }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1 }}
        >
          {/* Visual Needle Base */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-full bg-[#ff3333] rounded-t-full shadow-2xl">
            {/* Glowing inner core */}
            <div className="absolute inset-x-[2px] top-4 bottom-2 bg-white/40 rounded-full blur-[1px]"></div>
          </div>
        </motion.div>
      </div>

      {/* Pivot Nut */}
      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-br from-[#ffd68a] via-[#c59c5d] to-[#6b5231] shadow-[0_0_15px_rgba(0,0,0,1)] z-30 flex justify-center items-center overflow-hidden border border-[#e6b866]">
        <div className="w-5 h-5 rounded-full border border-black/50 bg-[#1a1714] shadow-[inset_0_4px_4px_rgba(0,0,0,0.8)]"></div>
      </div>
      
      {/* Central Dial Value */}
      <div className="absolute bottom-7 flex flex-col items-center z-0">
        <span className="text-[#c59c5d] font-headline text-[10px] tracking-widest opacity-80 uppercase">Presión</span>
        <span className="text-white font-mono text-lg font-bold tracking-widest tabular-nums leading-none">
          {degrees}°
        </span>
      </div>
    </div>
  );
}

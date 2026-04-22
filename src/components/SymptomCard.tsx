import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

interface SymptomCardProps {
  id: string;
  title: string;
  description: string;
  actionText: string;
  icon: string;
  onClick: () => void;
  colSpanClass: string;
  bgColorClass: string;
  isDarkText?: boolean;
}

function TypewriterChar({
  char,
  index,
  total,
  progress,
}: {
  char: string;
  index: number;
  total: number;
  progress: any;
}) {
  // Ajuste de timing: terminamos de escribir toda la frase al 75% del scroll
  const start = (index / total) * 0.75;
  const end = start + 0.15; // Pegada rápida y contundente

  const opacity = useTransform(progress, [start, end], [0, 1]);
  // Efecto "stamp" antiguo: cae con fuerza pero termina en su espacio natural (1x) sin pisotear a las demás
  const scale = useTransform(progress, [start, end], [3, 1]);
  // Desenfoque cinético durante la caída
  const filter = useTransform(progress, [start, end], ["blur(4px)", "blur(0px)"]);

  // Ligera rotación seudo-aleatoria mucho más contenida para no romper palabras
  const rot = Math.sin(index * 4.321) * 2;

  if (char === " ") {
    return <span className="inline-block w-[0.5em]">&nbsp;</span>;
  }

  return (
    <motion.span
      className="relative z-10 inline-block font-bold"
      style={{
        opacity,
        scale,
        filter,
        rotate: `${rot}deg`,
        originY: 1,
        originX: 0.5,
        fontFamily: '"Special Elite", serif',
        textTransform: "uppercase", 
        letterSpacing: "0.05em",
        fontSize: "1em" // Relative to parent
      }}
    >
      {char}
    </motion.span>
  );
}

export default function SymptomCard({
  id,
  title,
  description,
  actionText,
  icon,
  onClick,
  colSpanClass,
  bgColorClass,
  isDarkText = false,
}: SymptomCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 90%", "end 55%"],
  });

  // La línea inferior se revela gradualmente acompañando el trazo de la escritura
  const borderClipPath = useTransform(
    scrollYProgress,
    [0, 0.9],
    ["inset(0 100% 0 0)", "inset(0 0% 0 0)"]
  );

  const textColorClass = isDarkText ? "text-primary" : "text-white";
  const iconColorClass = isDarkText ? "text-primary/80" : "text-white/90";
  const descColorClass = isDarkText
    ? "text-on-surface-variant"
    : "text-white/90";
  const borderMutedClass = isDarkText
    ? "border-primary/20"
    : "border-white/20";

  const isLarge = colSpanClass.includes("col-span-8");

  return (
    <motion.div
      ref={containerRef}
      layoutId={`card-${id}`}
      onClick={onClick}
      className={`cursor-pointer ${colSpanClass} ${bgColorClass} rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between min-h-[380px] shadow-xl hover:-translate-y-3 hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500 group ${textColorClass} relative overflow-hidden`}
    >
      {/* Luxury Leather Texture Overlay - Visibilidad y textura real garantizadas */}
      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.25] mix-blend-multiply">
        <svg
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <filter id={`leather-${id}`}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.04"
              numOctaves="3"
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0,
                      0 0 0 0 0,
                      0 0 0 0 0,
                      1 0 0 0 0"
            />
          </filter>
          <rect width="100%" height="100%" filter={`url(#leather-${id})`} />
        </svg>
      </div>

      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-white/10 to-transparent"></div>

      <div className="relative z-10">
        <span
          className={`material-symbols-outlined ${
            isLarge ? "mb-8 text-[108px]" : "mb-6 text-[90px]"
          } ${iconColorClass} transition-transform duration-500 group-hover:scale-125 origin-bottom-left`}
        >
          {icon}
        </span>
        <h3
          className={`font-headline ${
            isLarge ? "text-4xl md:text-5xl" : "text-4xl"
          } mb-6 tracking-tight`}
        >
          {title}
        </h3>
        <p
          className={`font-body ${descColorClass} ${
            isLarge ? "max-w-2xl text-2xl" : "text-xl"
          } font-light leading-relaxed`}
        >
          {description}
        </p>
      </div>

      {/* Typewriter Overwrite Effect Container */}
      <div className="relative z-10 mt-14 self-start font-body uppercase tracking-[0.2em] font-bold">
        {/* Base Muted Border */}
        <div className={`absolute inset-0 pb-3 border-b-2 ${borderMutedClass}`} />

        {/* Reveal Border */}
        <motion.div
          className="absolute inset-0 pb-3 border-b-2 border-current"
          style={{ clipPath: borderClipPath }}
        />

        {/* The Animated Text */}
        <div
          className={`relative flex items-end pb-3 ${
            isLarge ? "text-[26px]" : "text-[22px]"
          }`}
        >
          {actionText.split("").map((char, i) => (
            <TypewriterChar
              key={i}
              char={char}
              index={i}
              total={actionText.length}
              progress={scrollYProgress}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

import React, { useRef } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";

interface LighthouseBeamFrameProps {
  background: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  backgroundClassName?: string;
  contentClassName?: string;
  originX?: string;
  originY?: string;
}

export default function LighthouseBeamFrame({
  background,
  children,
  className = "",
  backgroundClassName = "",
  contentClassName = "",
  originX = "88%",
  originY = "12%",
}: LighthouseBeamFrameProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 22,
    mass: 0.45,
  });

  const beamRotate = useTransform(smoothProgress, [0, 0.5, 1], [-10, 1, 12]);
  const beamOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0.14, 0.23, 0.34, 0.25, 0.16]
  );
  const beamScale = useTransform(smoothProgress, [0, 0.5, 1], [0.985, 1.025, 1]);
  const beamX = useTransform(smoothProgress, [0, 0.5, 1], ["-1.5%", "0%", "1.2%"]);

  const coreOpacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0.08, 0.16, 0.24, 0.17, 0.1]
  );

  const ambientDarkness = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.30, 0.22, 0.28]
  );

  const ambientGlow = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.035, 0.085, 0.045]
  );

  const ambientLift = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.04, 0.09, 0.05]
  );

  return (
    <section
      ref={containerRef}
      className={`relative isolate overflow-hidden ${className}`}
    >
      <div className={`absolute inset-0 z-0 ${backgroundClassName}`}>
        {background}
      </div>

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,10,16,0.30) 0%, rgba(7,11,17,0.17) 28%, rgba(7,11,17,0.12) 60%, rgba(5,8,12,0.28) 100%)",
          opacity: ambientDarkness,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: `radial-gradient(circle at ${originX} ${originY}, rgba(255,244,214,0.22) 0%, rgba(255,244,214,0.10) 7%, rgba(255,244,214,0.04) 15%, rgba(255,244,214,0.00) 30%)`,
          opacity: ambientGlow,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(120% 95% at 80% 45%, rgba(255,250,236,0.10) 0%, rgba(255,250,236,0.04) 26%, rgba(255,250,236,0.00) 60%)",
          opacity: ambientLift,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-[4]"
        style={{
          left: originX,
          top: originY,
          width: "175%",
          height: "175%",
          transformOrigin: "0% 0%",
          rotate: beamRotate,
          opacity: beamOpacity,
          scale: beamScale,
          x: beamX,
          background:
            "linear-gradient(90deg, rgba(255,244,214,0.00) 0%, rgba(255,244,214,0.03) 10%, rgba(255,244,214,0.12) 20%, rgba(255,248,228,0.24) 32%, rgba(255,244,214,0.14) 48%, rgba(255,244,214,0.05) 66%, rgba(255,244,214,0.00) 100%)",
          clipPath: "polygon(0 0, 100% 14%, 100% 43%, 0 8%)",
          filter: "blur(18px)",
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute z-[5]"
        style={{
          left: originX,
          top: originY,
          width: "150%",
          height: "150%",
          transformOrigin: "0% 0%",
          rotate: beamRotate,
          opacity: coreOpacity,
          scale: beamScale,
          x: beamX,
          background:
            "linear-gradient(90deg, rgba(255,250,236,0.00) 0%, rgba(255,250,236,0.05) 15%, rgba(255,250,236,0.18) 30%, rgba(255,250,236,0.08) 52%, rgba(255,250,236,0.00) 100%)",
          clipPath: "polygon(0 0, 100% 18%, 100% 29%, 0 7%)",
          filter: "blur(9px)",
        }}
      />

      <div className={`relative z-10 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}

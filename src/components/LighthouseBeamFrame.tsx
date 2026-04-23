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
  originY = "17%",
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

  // Pure baseline rotations (Rotated +10 degrees from previous)
  const beamRotate1 = useTransform(smoothProgress, [0, 0.5, 1], [-50, -30, -10]);
  const beamRotate2 = useTransform(smoothProgress, [0, 0.5, 1], [130, 150, 170]);
  
  const beamOpacity = useTransform(
    smoothProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0.4, 0.8, 0.9, 0.8, 0.4] // Slightly reduced global intensity
  );
  const beamScale = useTransform(smoothProgress, [0, 0.5, 1], [0.95, 1.1, 1]);
  const beamX = useTransform(smoothProgress, [0, 0.5, 1], ["-5%", "0%", "5%"]);

  const coreOpacity = useTransform(
    smoothProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0.3, 0.7, 0.9, 0.8, 0.3] // Slightly reduced global intensity
  );

  const ambientDarkness = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.95, 0.8, 0.9]
  );

  const ambientGlow = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.3, 1.0, 0.4]
  );

  const ambientLift = useTransform(
    smoothProgress,
    [0, 0.5, 1],
    [0.2, 0.8, 0.2]
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
        className="pointer-events-none absolute inset-0 z-[1] mix-blend-multiply"
        style={{
          background: `radial-gradient(circle at ${originX} ${originY}, rgba(6,10,16,0.0) 0%, rgba(6,10,16,0.6) 40%, rgba(2,4,8,0.95) 100%)`,
          opacity: ambientDarkness,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[2]"
        style={{
          background: `radial-gradient(circle at ${originX} ${originY}, rgba(255,244,214,0.45) 0%, rgba(255,244,214,0.20) 7%, rgba(255,244,214,0.08) 15%, rgba(255,244,214,0.00) 30%)`,
          opacity: ambientGlow,
        }}
      />

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[3]"
        style={{
          background:
            "radial-gradient(120% 95% at 80% 45%, rgba(255,250,236,0.25) 0%, rgba(255,250,236,0.08) 26%, rgba(255,250,236,0.00) 60%)",
          opacity: ambientLift,
        }}
      />

      {/* BEAMS GROUP - placed at z-10 */}
      <div className="absolute inset-0 z-10 pointer-events-none" style={{ perspective: "1000px" }}>
        {/* BEAM 1 (Test Beam) */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            left: originX,
            top: originY,
            width: "175%",
            height: "175%",
            transformOrigin: "0% 0%",
            rotate: beamRotate1,
            opacity: beamOpacity,
            scale: beamScale,
            x: beamX,
            // Improved gradient: softer start, peak intensity further down, fading out smoothly
            // Added cross-fade (top-to-bottom in the beam's local space) via mask-image to soften lateral edges
            background:
              "linear-gradient(90deg, rgba(255,244,214,0.00) 0%, rgba(255,244,214,0.05) 15%, rgba(255,244,214,0.3) 35%, rgba(255,248,228,0.7) 50%, rgba(255,244,214,0.4) 70%, rgba(255,244,214,0.1) 85%, rgba(255,244,214,0.00) 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            clipPath: "polygon(0 0, 100% 14%, 100% 43%, 0 8%)",
            filter: "blur(24px)",
          }}
        />

        {/* BEAM 2 (Opposite Test Beam) */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            left: originX,
            top: originY,
            width: "175%",
            height: "175%",
            transformOrigin: "0% 0%",
            rotate: beamRotate2,
            opacity: beamOpacity,
            scale: beamScale,
            x: beamX,
            background:
              "linear-gradient(90deg, rgba(255,244,214,0.00) 0%, rgba(255,244,214,0.05) 15%, rgba(255,244,214,0.3) 35%, rgba(255,248,228,0.7) 50%, rgba(255,244,214,0.4) 70%, rgba(255,244,214,0.1) 85%, rgba(255,244,214,0.00) 100%)",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)",
            clipPath: "polygon(0 0, 100% 14%, 100% 43%, 0 8%)",
            filter: "blur(24px)",
          }}
        />

        {/* BEAM 1 CORE */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            left: originX,
            top: originY,
            width: "150%",
            height: "150%",
            transformOrigin: "0% 0%",
            rotate: beamRotate1,
            opacity: coreOpacity,
            scale: beamScale,
            x: beamX,
            background:
              "linear-gradient(90deg, rgba(255,250,236,0.00) 0%, rgba(255,250,236,0.1) 20%, rgba(255,250,236,0.5) 45%, rgba(255,250,236,0.2) 75%, rgba(255,250,236,0.00) 100%)",
            maskImage: "linear-gradient(to bottom, transparent 15%, black 40%, black 60%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 15%, black 40%, black 60%, transparent 85%)",
            clipPath: "polygon(0 0, 100% 18%, 100% 29%, 0 7%)",
            filter: "blur(12px)",
          }}
        />

        {/* BEAM 2 CORE */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            left: originX,
            top: originY,
            width: "150%",
            height: "150%",
            transformOrigin: "0% 0%",
            rotate: beamRotate2,
            opacity: coreOpacity,
            scale: beamScale,
            x: beamX,
            background:
              "linear-gradient(90deg, rgba(255,250,236,0.00) 0%, rgba(255,250,236,0.1) 20%, rgba(255,250,236,0.5) 45%, rgba(255,250,236,0.2) 75%, rgba(255,250,236,0.00) 100%)",
            maskImage: "linear-gradient(to bottom, transparent 15%, black 40%, black 60%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 15%, black 40%, black 60%, transparent 85%)",
            clipPath: "polygon(0 0, 100% 18%, 100% 29%, 0 7%)",
            filter: "blur(12px)",
          }}
        />
      </div>

      {/* CONTENT - placed at z-20 to be strictly ABOVE the beams */}
      <div className={`relative z-20 h-full w-full ${contentClassName}`}>
        {children}
      </div>
    </section>
  );
}

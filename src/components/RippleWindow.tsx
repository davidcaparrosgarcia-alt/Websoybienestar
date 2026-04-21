import React, { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleWindowProps {
  children: React.ReactNode;
  className?: string;
}

const RIPPLE_LIFETIME_MS = 3000;
const RIPPLE_SIZE = 800;

export default function RippleWindow({ children, className }: RippleWindowProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const timeoutsRef = useRef<number[]>([]);

  const removeRipple = useCallback((id: number) => {
    setRipples((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now() + Math.floor(Math.random() * 1000);
    setRipples((prev) => [...prev, { id, x, y }]);

    const timeoutId = window.setTimeout(() => removeRipple(id), RIPPLE_LIFETIME_MS);
    timeoutsRef.current.push(timeoutId);
  }, [removeRipple]);

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutsRef.current = [];
    };
  }, []);

  return (
    <div
      className={`relative overflow-hidden select-none ${className ?? ""}`}
      onClick={handleClick}
    >
      {children}

      <div className="pointer-events-none absolute inset-0 rounded-[inherit]">
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.div
              key={ripple.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: RIPPLE_SIZE,
                height: RIPPLE_SIZE,
                transform: "translate(-50%, -50%)",
              }}
            >
              <svg
                width={RIPPLE_SIZE}
                height={RIPPLE_SIZE}
                viewBox={`0 0 ${RIPPLE_SIZE} ${RIPPLE_SIZE}`}
                className="overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id={`core-${ripple.id}`} cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.15)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                  </radialGradient>
                </defs>

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={8}
                  fill={`url(#core-${ripple.id})`}
                  initial={{ scale: 0.6, opacity: 0.4 }}
                  animate={{ scale: 2.5, opacity: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={20}
                  fill="none"
                  stroke="rgba(255,255,255,0.75)"
                  strokeWidth="2"
                  initial={{ scale: 0.1, opacity: 0.9 }}
                  animate={{ scale: 8, opacity: 0 }}
                  transition={{ duration: 1.8, ease: "easeOut" }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={30}
                  fill="none"
                  stroke="rgba(255,255,255,0.55)"
                  strokeWidth="1.5"
                  initial={{ scale: 0.1, opacity: 0.8 }}
                  animate={{ scale: 9, opacity: 0 }}
                  transition={{ duration: 2.1, ease: "easeOut", delay: 0.1 }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={40}
                  fill="none"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="1"
                  initial={{ scale: 0.1, opacity: 0.6 }}
                  animate={{ scale: 10, opacity: 0 }}
                  transition={{ duration: 2.4, ease: "easeOut", delay: 0.2 }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                {/* --- ECO SECUNDARIO (El rebote de la gota que da más realismo) --- */}
                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={8}
                  fill={`url(#core-${ripple.id})`}
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 1.5, opacity: [0, 0.25, 0] }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.55 }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={16}
                  fill="none"
                  stroke="rgba(255,255,255,0.5)"
                  strokeWidth="1.5"
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 6, opacity: [0, 0.6, 0] }}
                  transition={{ duration: 1.6, ease: "easeOut", delay: 0.6 }}
                  style={{ transformOrigin: "50% 50%" }}
                />

                <motion.circle
                  cx={RIPPLE_SIZE / 2}
                  cy={RIPPLE_SIZE / 2}
                  r={24}
                  fill="none"
                  stroke="rgba(255,255,255,0.3)"
                  strokeWidth="1"
                  initial={{ scale: 0.1, opacity: 0 }}
                  animate={{ scale: 7, opacity: [0, 0.4, 0] }}
                  transition={{ duration: 1.8, ease: "easeOut", delay: 0.75 }}
                  style={{ transformOrigin: "50% 50%" }}
                />
              </svg>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

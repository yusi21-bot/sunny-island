"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform } from "motion/react";
import "./ShinyText.css";

type ShinyTextProps = {
  text: string;
  disabled?: boolean;
  speed?: number;
  delay?: number;
  color?: string;
  shineColor?: string;
  spread?: number;
  yoyo?: boolean;
  pauseOnHover?: boolean;
  direction?: "left" | "right";
  className?: string;
};

export default function ShinyText({
  text,
  disabled = false,
  speed = 2,
  delay = 0,
  color = "#b5b5b5",
  shineColor = "#ffffff",
  spread = 120,
  yoyo = false,
  pauseOnHover = false,
  direction = "left",
  className = "",
}: ShinyTextProps) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);
  const directionRef = useRef(direction === "left" ? 1 : -1);
  const animationDuration = Math.max(speed, 0.1) * 1000;
  const delayDuration = Math.max(delay, 0) * 1000;

  useAnimationFrame((time) => {
    if (disabled || isPaused) {
      lastTimeRef.current = null;
      return;
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    elapsedRef.current += time - lastTimeRef.current;
    lastTimeRef.current = time;
    const cycleDuration = animationDuration + delayDuration;
    const cycleTime = elapsedRef.current % (yoyo ? cycleDuration * 2 : cycleDuration);
    let next = directionRef.current === 1 ? 100 : 0;
    if (yoyo && cycleTime >= cycleDuration) {
      const reverseTime = cycleTime - cycleDuration;
      next = directionRef.current === 1
        ? 100 - (reverseTime / animationDuration) * 100
        : (reverseTime / animationDuration) * 100;
    } else if (cycleTime < animationDuration) {
      const phase = (cycleTime / animationDuration) * 100;
      next = directionRef.current === 1 ? phase : 100 - phase;
    }
    progress.set(next);
  });

  useEffect(() => {
    directionRef.current = direction === "left" ? 1 : -1;
    elapsedRef.current = 0;
    lastTimeRef.current = null;
  }, [direction]);

  const backgroundPosition = useTransform(progress, (value) => `${150 - value * 2}% center`);
  const handleMouseEnter = useCallback(() => { if (pauseOnHover) setIsPaused(true); }, [pauseOnHover]);
  const handleMouseLeave = useCallback(() => { if (pauseOnHover) setIsPaused(false); }, [pauseOnHover]);

  return (
    <motion.span
      className={`shiny-text ${className}`}
      style={{
        backgroundImage: `linear-gradient(${spread}deg, ${color} 0%, ${color} 35%, ${shineColor} 50%, ${color} 65%, ${color} 100%)`,
        backgroundSize: "200% auto",
        backgroundPosition,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >{text}</motion.span>
  );
}

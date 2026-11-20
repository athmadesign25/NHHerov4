"use client";

// Animate UI's Lucide chevron-down default-loop artwork and keyframes,
// adapted to the Framer Motion dependency already used by NH's animated icons.
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

export function ChevronDown({ size = 24 }: { size?: number }) {
  const reduced = useReducedMotion();
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <motion.path d="m6 9 6 6 6-6" initial={false} animate={{ y: reduced ? 0 : [0, 4, 0] }} transition={{ duration: duration.slowest, ease: ease.standard, repeat: reduced ? 0 : Infinity, repeatDelay: duration.slowest }} />
  </svg>;
}

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

/** Render the exact payable amount immediately; only its opacity changes. */
export default function BookingAmount({ value, animated = false }: { value: string; animated?: boolean }) {
  const reduced = useReducedMotion();
  if (!animated) return <>{value}</>;
  return <motion.span key={value} initial={reduced ? false : { opacity: .65 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}>{value}</motion.span>;
}

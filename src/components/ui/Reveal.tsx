"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface RevealProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "scale" | "fade";
  className?: string;
  once?: boolean;
  amount?: number;
}

const variants = {
  up:    { hidden: { y: 40, opacity: 0 },   visible: { y: 0, opacity: 1 } },
  down:  { hidden: { y: -40, opacity: 0 },  visible: { y: 0, opacity: 1 } },
  left:  { hidden: { x: 60, opacity: 0 },   visible: { x: 0, opacity: 1 } },
  right: { hidden: { x: -60, opacity: 0 },  visible: { x: 0, opacity: 1 } },
  scale: { hidden: { scale: 0.88, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
  fade:  { hidden: { opacity: 0 },           visible: { opacity: 1 } },
};

export default function Reveal({
  children,
  delay = 0,
  direction = "up",
  className,
  once = true,
  amount = 0.15,
}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once, margin: "-5% 0px", amount });

  return (
    <motion.div
      ref={ref}
      className={className}
      variants={variants[direction]}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      transition={{
        delay,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

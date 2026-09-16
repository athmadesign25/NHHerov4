"use client";

import { useRef, useCallback } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import styles from "./MagneticButton.module.css";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  href?: string;
  id?: string;
  onClick?: () => void;
  type?: "a" | "button" | "div";
}

export default function MagneticButton({
  children,
  className,
  strength = 0.35,
  href,
  id,
  onClick,
  type = "a",
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 20, mass: 0.5 });

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      x.set((e.clientX - cx) * strength);
      y.set((e.clientY - cy) * strength);
    },
    [x, y, strength]
  );

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  const Wrapper = type === "div" ? "div" : type === "button" ? "button" : "a";

  return (
    <div
      ref={ref}
      className={styles.magnetic}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <motion.div style={{ x: springX, y: springY }}>
        <Wrapper
          href={type === "a" ? href : undefined}
          id={id}
          onClick={onClick}
          className={`${styles.inner} ${className ?? ""}`}
        >
          {children}
        </Wrapper>
      </motion.div>
    </div>
  );
}

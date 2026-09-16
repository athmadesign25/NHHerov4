import React, { useRef, useEffect } from "react";
import { useInView, useMotionValue, useTransform, animate, motion } from "framer-motion";

export default function MetricValueReveal({ value, suffix = "" }: { value: number, suffix?: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10px" });

  // Dial up within a single fixed denomination (K/L) matching the final
  // value, starting at 1 (of that denomination) instead of 0.
  const { unit, to } = (() => {
    if (value >= 100000) return { unit: "L", to: value / 100000 };
    if (value >= 1000) return { unit: "K", to: value / 1000 };
    return { unit: "", to: value };
  })();

  const count = useMotionValue(1);
  const rounded = useTransform(count, (latest) => {
    const num = unit ? latest : Math.round(latest);
    const formattedNum = unit
      ? num.toLocaleString('en-IN', { maximumFractionDigits: 1 })
      : num.toLocaleString('en-IN');
    return formattedNum + unit + suffix;
  });

  useEffect(() => {
    if (!isInView) return;
    const animation = animate(count, to, { duration: 1, ease: [0.16, 1, 0.3, 1] });
    return animation.stop;
  }, [isInView, to, count]);

  return (
    <motion.span ref={ref}>
      {rounded}
    </motion.span>
  );
}

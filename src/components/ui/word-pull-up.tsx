"use client";

import React, { useRef } from "react";
import { motion, Variants, useInView } from "framer-motion";
import { cn } from "@/lib/utils";

type SemanticTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";

const motionElements: Record<SemanticTag, typeof motion.div> = {
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  h4: motion.h4,
  h5: motion.h5,
  h6: motion.h6,
  p: motion.p,
  span: motion.span,
  div: motion.div,
};

export interface WordPullUpProps {
  words: string;
  delayMultiple?: number;
  wrapperFramerProps?: Variants;
  framerProps?: Variants;
  className?: string;
  style?: React.CSSProperties;
  as?: SemanticTag;
  once?: boolean;
  animateControl?: "inView" | "always" | "none";
}

const defaultWrapperVariants: Variants = {
  hidden: { opacity: 0 },
  show: (delayMultiple: number = 0.08) => ({
    opacity: 1,
    transition: {
      staggerChildren: delayMultiple,
    },
  }),
};

const defaultItemVariants: Variants = {
  hidden: { y: 18, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export function WordPullUp({
  words,
  delayMultiple = 0.08,
  wrapperFramerProps = defaultWrapperVariants,
  framerProps = defaultItemVariants,
  className,
  style,
  as = "h2",
  once = true,
  animateControl = "inView",
}: WordPullUpProps) {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once, margin: "-10% 0px" });

  const MotionComponent = motionElements[as] || motion.h2;

  const shouldAnimate =
    animateControl === "always" ? true : animateControl === "inView" ? isInView : false;

  return (
    <MotionComponent
      ref={containerRef as any}
      variants={wrapperFramerProps}
      custom={delayMultiple}
      initial="hidden"
      animate={shouldAnimate ? "show" : "hidden"}
      className={cn(className)}
      style={style}
    >
      {words.split(" ").map((word, i) => (
        <span
          key={i}
          style={{
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "bottom",
            paddingRight: "0.28em",
          }}
        >
          <motion.span
            variants={framerProps}
            style={{ display: "inline-block" }}
          >
            {word === "" ? "\u00A0" : word}
          </motion.span>
        </span>
      ))}
    </MotionComponent>
  );
}

export default WordPullUp;

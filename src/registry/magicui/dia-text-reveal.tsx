"use client";

import { motion } from "framer-motion";

interface DiaTextRevealProps {
  text: string;
  className?: string;
  colors?: string[];
}

export function DiaTextReveal({
  text,
  className = "",
  colors = ["#A97CF8", "#F38CB8", "#FDCC92"],
}: DiaTextRevealProps) {
  const words = text.split(" ");

  return (
    <span className={className} style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.25em" }}>
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: "inline-block", overflow: "hidden" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ opacity: 0, y: "100%", filter: "blur(10px)", color: colors[wordIndex % colors.length] }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", color: "#000" }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{
              duration: 0.8,
              delay: wordIndex * 0.15,
              ease: [0.16, 1, 0.3, 1],
              color: { duration: 0.6, ease: "easeInOut", delay: wordIndex * 0.15 + 0.4 }
            }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

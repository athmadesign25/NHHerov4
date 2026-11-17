"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { duration } from "@/lib/motion";
import styles from "./RotatingSearchHint.module.css";
interface Props { active: boolean; paused: boolean; prefix: string; terms: readonly string[] }
const READING_HOLD_MS = 2000;
const keywordList = new Intl.ListFormat("en", { style: "long", type: "conjunction" });
/** Decorative empty-field guidance; the input keeps a stable accessible label. */
export default function RotatingSearchHint({ active, paused, prefix, terms }: Props) {
  if (!active || !terms.length) return null;
  if (paused) return <span className={`${styles.hint} ${styles.staticHint}`} aria-hidden="true">
    {prefix} {keywordList.format(terms)}
  </span>;
  // Remount on exit/clear so the reveal and its reading pause restart together.
  return <AnimatedSearchHint prefix={prefix} terms={terms} />;
}

function AnimatedSearchHint({ prefix, terms }: Pick<Props, "prefix" | "terms">) {
  const [index, setIndex] = useState(0);
  const [readableIndex, setReadableIndex] = useState<number | null>(null);
  const reduced = useReducedMotion();
  const term = terms[index % terms.length] ?? "";
  const characters = Array.from(term);
  const instant = Boolean(reduced);
  // Finish the whole word in 500ms, without moving or stretching the letters.
  const characterStagger = instant ? 0 : (duration.slower - duration.instant) / Math.max(1, characters.length - 1);
  useEffect(() => {
    if (reduced || terms.length < 2 || readableIndex !== index) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      clearTimeout(timer);
      if (!document.hidden) timer = setTimeout(() => setIndex(value => (value + 1) % terms.length), READING_HOLD_MS);
    };
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => { clearTimeout(timer); document.removeEventListener("visibilitychange", schedule); };
  }, [reduced, index, readableIndex, terms.length]);
  return <span className={styles.hint} aria-hidden="true"><span className={styles.prefix}>{prefix}</span>
    <span className={styles.terms}>
      {terms.map(value => <span key={value} className={styles.measure}>{value}</span>)}
      <AnimatePresence mode="wait">
      <motion.span key={index} className={styles.keyword} initial={instant ? false : "hidden"} animate="visible" exit="exit"
        variants={{ hidden: { opacity: 1 }, visible: { opacity: 1, transition: { staggerChildren: characterStagger } },
          exit: { opacity: 0, transition: { duration: instant ? 0 : duration.fast } } }}
        onAnimationComplete={state => { if (state === "visible") setReadableIndex(index); }}>
        {characters.map((character, position) => <motion.span key={position}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: instant ? 0 : duration.instant, ease: "linear" } } }}>
          {character}
        </motion.span>)}
      </motion.span>
    </AnimatePresence></span></span>;
}

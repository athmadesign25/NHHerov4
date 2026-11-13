"use client";

import { useCallback, useLayoutEffect, useRef, type RefObject } from "react";
import { animate, motion, useMotionValue, useReducedMotion, type AnimationPlaybackControls } from "framer-motion";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { duration, ease } from "@/lib/motion";
import styles from "./ConfirmationIntro.module.css";

interface Props {
  titleId: string;
  headingRef: RefObject<HTMLHeadingElement | null>;
  onComplete: () => void;
}

/** Move the introduction with a transform; its final layout space stays reserved. */
export default function ConfirmationIntro({ titleId, headingRef, onComplete }: Props) {
  // Motion initially reports null during hydration; normalise it so resolving
  // to false cannot tear down an entrance that is already running.
  const reduced = !!useReducedMotion();
  const heroRef = useRef<HTMLElement>(null);
  const movement = useRef<AnimationPlaybackControls | null>(null);
  const phase = useRef<"intro" | "settling" | "complete">("intro");
  const y = useMotionValue(0);
  const textDuration = duration.slowest * 2;
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const finish = useCallback(() => {
    if (phase.current === "complete") return;
    movement.current?.stop();
    if (settleTimer.current) clearTimeout(settleTimer.current);
    y.set(0);
    phase.current = "complete";
    onComplete();
  }, [onComplete, y]);

  useLayoutEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Each mount (including Strict Mode's setup replay) owns a complete run.
    // A scroll position inherited from the summary must not skip the entrance.
    phase.current = "intro";
    if (reduced) {
      finish();
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });

    const centreIntro = () => {
      if (phase.current !== "intro") return;
      const bounds = hero.getBoundingClientRect();
      const computed = getComputedStyle(hero);
      const padding = parseFloat(computed.paddingBottom);
      const viewport = window.visualViewport;
      const centre = (viewport?.offsetTop ?? 0) + (viewport?.height ?? window.innerHeight) / 2;
      // Remove our current translation before measuring the resting position.
      // This keeps repeated measurements from alternating between centre/top.
      const renderedY = computed.transform === "none" ? 0 : new DOMMatrixReadOnly(computed.transform).m42;
      const restingTop = bounds.top - renderedY;
      y.set(Math.max(0, centre - restingTop - (bounds.height - padding) / 2));
    };
    centreIntro();
    const measurementFrame = requestAnimationFrame(centreIntro);

    // One owned timeline drives the hand-off; incidental re-renders or a text
    // effect callback cannot cancel it or leave the receipt hidden indefinitely.
    settleTimer.current = setTimeout(() => {
      if (phase.current !== "intro") return;
      phase.current = "settling";
      movement.current = animate(y, 0, {
        duration: duration.slowest,
        ease: ease.standard,
        onComplete: finish,
      });
    }, (duration.base + textDuration) * 1000);

    // Mobile browser chrome and scrollbar changes can resize the viewport.
    // Re-centre during the intro rather than treating those as a dismissal.
    window.addEventListener("resize", centreIntro);
    window.visualViewport?.addEventListener("resize", centreIntro);
    window.addEventListener("wheel", finish, { passive: true });
    window.addEventListener("touchmove", finish, { passive: true });
    return () => {
      cancelAnimationFrame(measurementFrame);
      if (settleTimer.current) clearTimeout(settleTimer.current);
      movement.current?.stop();
      window.removeEventListener("resize", centreIntro);
      window.visualViewport?.removeEventListener("resize", centreIntro);
      window.removeEventListener("wheel", finish);
      window.removeEventListener("touchmove", finish);
    };
  }, [finish, reduced, textDuration, y]);

  return <motion.header ref={heroRef} className={styles.hero} style={{ y }}>
    <span className={styles.mark} aria-hidden="true">
      <motion.span className={styles.circle}
        initial={reduced ? false : { opacity: 0, scale: .2 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : duration.slowest + duration.base, ease: ease.standard }} />
      <motion.svg className={styles.tick} viewBox="0 0 32 32" fill="none"
        initial={reduced ? false : { opacity: 0, scale: .75 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reduced ? 0 : duration.slower, delay: reduced ? 0 : duration.base, ease: ease.out }}>
        <motion.path d="m8 16 5.5 5.5L25 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          initial={reduced ? false : { pathLength: 0 }} animate={{ pathLength: 1 }}
          transition={{ duration: reduced ? 0 : duration.emphasis, delay: reduced ? 0 : duration.base, ease: ease.out }} />
      </motion.svg>
    </span>
    <motion.div className={styles.copy}
      initial={reduced ? false : { opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : duration.slow, delay: reduced ? 0 : duration.base, ease: ease.out }}>
      <div className={styles.title}>
        <h1 id={titleId} ref={headingRef} tabIndex={-1}>Your appointment is confirmed</h1>
        <div className={styles.titleSweep} aria-hidden="true">
          <TextSweepEffect words={["Your appointment is confirmed"]}
            sweepMs={textDuration * 1000} delayMs={duration.base * 1000}
            active={!reduced}
            sweepColor="var(--journey-paper-success)" sweepHighlightColor="var(--color-success)"
            finalColor="var(--color-text)" />
        </div>
      </div>
      <p className={styles.notice}>You’ll receive a confirmation email and SMS on your registered contact details.</p>
    </motion.div>
  </motion.header>;
}

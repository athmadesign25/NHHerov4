"use client";

/**
 * The collapsed banner's mark, shared by the toast and the island tile.
 *
 * The artwork and the animation are animate-ui's hugeicons megaphone,
 * ported rather than installed. `npx shadcn add` wants a components.json
 * and would set Tailwind up in a project whose rules forbid it, and the
 * registry entry pulls `@animate-ui/react` plus `motion` — a second copy
 * of the same engine `framer-motion` already gives us. The paths and the
 * keyframes below are the library's, unchanged; only the plumbing is
 * ours.
 *
 * This icon is STROKED, where the one it replaces was filled. So the
 * brand gradient is applied to `stroke`, and `fill` stays none — putting
 * that gradient on the fill would flood the whole glyph.
 *
 * `currentColor` is the non-gradient variant. The default gradient is
 * white-to-light-blue for dark plates; the toast's blue tone uses existing
 * palette tokens through CSS stop colours, so it can sit directly on its
 * light background without a container.
 *
 * The gradient id comes from useId rather than a module counter. Two of
 * these on one page sharing an id would have the second silently reuse
 * the first one's stroke, and a counter incremented during render is
 * both a render side effect and wrong under SSR, where the server and
 * client would disagree on the number.
 */

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";

/* Slow grow-and-tilt cycle with a pause, derived from motion tokens. */
const beat = {
  duration: duration.slowest * 4,
  ease: ease.standard,
  repeat: Infinity,
  repeatDelay: duration.slowest * 2,
} as const;

const horn = {
  initial: { scale: 1, rotate: 0, transformOrigin: "50% 50%" },
  animate: {
    scale: [1, 1.08, 1.12, 1.06, 1],
    rotate: [0, -8, 6, -3, 0],
    transformOrigin: "50% 50%",
    transition: beat,
  },
};

const lines = {
  initial: { opacity: 1, x: 0 },
  animate: {
    opacity: [1, 0.25, 1, 0.25, 1],
    x: [0, 0.6, 0, 0.6, 0],
    transition: beat,
  },
};

export default function AnnouncementIcon({
  size = 32,
  gradient = true,
  tone = "light",
}: {
  size?: number;
  gradient?: boolean;
  tone?: "light" | "blue";
}) {
  const id = `announcement-grad-${useId()}`;
  const reducedMotion = useReducedMotion();
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={gradient ? `url(#${id})` : "currentColor"}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      initial="initial"
      animate={reducedMotion ? "initial" : "animate"}
      aria-hidden
      focusable="false"
    >
      <motion.g variants={horn}>
        <path d="M9 14V6H6C5.07003 6 4.60504 6 4.22354 6.10222C3.18827 6.37962 2.37962 7.18827 2.10222 8.22354C2 8.60504 2 9.07003 2 10C2 10.93 2 11.395 2.10222 11.7765C2.37962 12.8117 3.18827 13.6204 4.22354 13.8978C4.60504 14 5.07003 14 6 14H9Z" />
        <path d="M9 14L9.96466 18.8233C9.98816 18.9408 10 19.0604 10 19.1802V19.3411C10 20.2573 9.25728 21 8.34109 21C7.55885 21 6.8829 20.4536 6.719 19.6887L5.5 14" />
        <path d="M10 6H9V14H10C11.2982 14 12.5614 14.4211 13.6 15.2L15.747 16.8103C15.9112 16.9334 16.111 17 16.3162 17C16.7246 17 17.0909 16.7404 17.2088 16.3495C17.5537 15.2067 18 13.2728 18 10C18 6.72718 17.5537 4.79327 17.2088 3.65054C17.0909 3.25961 16.7246 3 16.3162 3C16.111 3 15.9112 3.06658 15.747 3.18974L13.6 4.8C12.5614 5.57893 11.2982 6 10 6Z" />
      </motion.g>
      <motion.g variants={lines}>
        <path d="M21 9.99996H22" />
        <path d="M20.5 6.00109L21.5 5.40637" />
        <path d="M20.5 14L21.5 14.6481" />
      </motion.g>
      {gradient && (
        <defs>
          <linearGradient
            id={id}
            x1="7.36875"
            y1="6.13437"
            x2="12.96875"
            y2="19.7344"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="white" style={tone === "blue" ? { stopColor: "var(--blue-500)" } : undefined} />
            <stop offset="1" stopColor="#70AEFF" style={tone === "blue" ? { stopColor: "var(--blue-brand)" } : undefined} />
          </linearGradient>
        </defs>
      )}
    </motion.svg>
  );
}

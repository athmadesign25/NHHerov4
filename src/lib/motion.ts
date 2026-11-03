/**
 * Motion tokens for Framer Motion.
 *
 * These mirror the --duration-* and --ease-* custom properties in
 * globals.css. The duplication is unavoidable: Framer animates values in
 * JS and interpolates them numerically, so it cannot read a CSS custom
 * property — `var(--duration-base)` would arrive as an uninterpolatable
 * string. CSS transitions use the custom properties; Framer uses these.
 *
 * Changing a duration means changing it in both places.
 */

/** Seconds, matching --duration-* in globals.css. */
export const duration = {
  instant: 0.1,
  fast: 0.15,
  base: 0.2,
  moderate: 0.25,
  emphasis: 0.3,
  slow: 0.4,
  slower: 0.5,
  slowest: 0.6,
} as const;

/**
 * Cubic-bezier control points, matching --ease-* in globals.css.
 * Framer takes these as a 4-tuple rather than a CSS function string.
 */
export const ease = {
  /** Decelerating. The default for almost everything. */
  out: [0.22, 1, 0.36, 1],
  /** Slight overshoot. Entrances and reveals. */
  spring: [0.16, 1, 0.3, 1],
  /** Symmetric. Use when something moves and returns. */
  standard: [0.4, 0, 0.2, 1],
} as const;

export type DurationToken = keyof typeof duration;
export type EaseToken = keyof typeof ease;

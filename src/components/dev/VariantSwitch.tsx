"use client";

/**
 * Renders one of several variants of the same thing, chosen by a URL param.
 *
 *   <VariantSwitch name="banner">
 *     {{
 *       1: <BannerDrift />,
 *       2: <BannerParallax />,
 *       3: <BannerPin />,
 *     }}
 *   </VariantSwitch>
 *
 *   localhost:3000/?banner=2
 *
 * Why a URL param rather than a toggle button: you can keep three tabs open,
 * each already scrolled to the banner, and flip between them with cmd+1/2/3.
 * For a scroll-driven interaction that is much closer to a real comparison
 * than clicking a switch, because the thing you are judging IS the scroll.
 *
 * It is also why these live in the real page rather than an isolated lab
 * route: a banner's behaviour depends on what is above and below it, so
 * pulling it onto a separate page would strip the thing being evaluated.
 *
 * TEMPORARY. When a variant wins, inline it and delete this component —
 * nothing else imports it, so removal is: unwrap the call site, delete
 * src/components/dev/.
 */

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./VariantSwitch.module.css";

type Props = {
  /** URL param to read, e.g. "banner" -> ?banner=2 */
  name: string;
  /** Variants keyed by number. Key 1 is the default. */
  children: Record<number, ReactNode>;
  /** Hide the corner badge even in development. */
  badge?: boolean;
};

function Picker({ name, children, badge = true }: Props) {
  const params = useSearchParams();
  const keys = Object.keys(children)
    .map(Number)
    .filter((n) => Number.isInteger(n))
    .sort((a, b) => a - b);

  const requested = Number(params.get(name));
  // Falls back to the first defined variant rather than hard-coding 1, so
  // this still behaves if variants are numbered 0-2 or 2-4 mid-iteration.
  const active = keys.includes(requested) ? requested : keys[0];

  return (
    <>
      {children[active]}
      {/* Dev-only, and worth having: with several tabs open on different
          variants it is otherwise genuinely hard to remember which is which. */}
      {badge && process.env.NODE_ENV !== "production" && (
        <div className={styles.badge} aria-hidden>
          <span className={styles.label}>{name}</span>
          {keys.map((k) => (
            <a
              key={k}
              href={`?${name}=${k}`}
              className={k === active ? styles.chipActive : styles.chip}
            >
              {k}
            </a>
          ))}
        </div>
      )}
    </>
  );
}

export default function VariantSwitch(props: Props) {
  // useSearchParams needs a Suspense boundary. Scoped to just this component
  // rather than the page, so nothing above it falls back to a loading state.
  // The fallback renders the default variant, so there is no flash of empty
  // space and no layout shift while the param resolves.
  const keys = Object.keys(props.children).map(Number).sort((a, b) => a - b);
  return (
    <Suspense fallback={<>{props.children[keys[0]]}</>}>
      <Picker {...props} />
    </Suspense>
  );
}

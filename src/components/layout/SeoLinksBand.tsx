"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./SeoLinksBand.module.css";
import { SEO_LINK_SECTIONS } from "@/data/seo-links";

const FIRST_SECTION = SEO_LINK_SECTIONS[0]?.id ?? null;

export default function SeoLinksBand() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const uid = useId();
  // True only for the render(s) spanning the master toggle's own opening
  // click — see the comment on the first section's transition below for why.
  const [skipFirstSectionAnim, setSkipFirstSectionAnim] = useState(false);
  const bandRef = useRef<HTMLElement>(null);
  const settleHandle = useRef<number | undefined>(undefined);
  const pendingScroll = useRef(false);
  const cancelled = useRef(false);

  useEffect(() => {
    cancelled.current = false;
    return () => {
      cancelled.current = true;
      if (settleHandle.current) cancelAnimationFrame(settleHandle.current);
    };
  }, []);

  const panelId = `${uid}-seo-panel`;
  const ease = [0.22, 1, 0.36, 1] as const;
  const duration = reduceMotion ? 0 : 0.36;

  // Lenis drives scroll position from its own rAF loop, so a native
  // scrollIntoView/window.scrollTo gets overwritten on the next frame — the
  // scroll has to go through Lenis when it is present.
  const scrollToBand = () => {
    const el = bandRef.current;
    if (!el) return;
    const lenis = (window as unknown as {
      lenis?: { scrollTo: (t: number, o?: object) => void; resize: () => void };
    }).lenis;
    // Lenis caches its own scroll ceiling and only refreshes it via a
    // debounced (250ms) ResizeObserver callback. The band expanding is
    // exactly the kind of resize that invalidates that cache, and this runs
    // well inside that 250ms window — so without forcing a resync here,
    // scrollTo() clamps our target against the *old*, pre-expansion ceiling.
    // On this page that stale ceiling is often the exact position we're
    // already at, so the clamped call looks like "already there" and
    // silently does nothing.
    if (lenis) lenis.resize();
    const top = Math.max(
      0,
      el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2
    );
    if (lenis) lenis.scrollTo(top, { duration: reduceMotion ? 0 : 1 });
    else window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
  };

  // A short, fixed settle window after the panel's own animation genuinely
  // completes: expanding it can also grow the footer wrapper past the
  // viewport, which flips it out of its pinned/fixed state (see
  // FooterRevealWrapper). That ResizeObserver-driven re-layout is a snap,
  // not a transition, and by observation lands within a couple of frames of
  // the size change that triggers it — which has already happened well
  // before the panel's own animation finishes, since the two are driven by
  // the same growing height. This just gives the last of it time to commit.
  const settleThenScroll = () => {
    if (settleHandle.current) cancelAnimationFrame(settleHandle.current);
    let framesLeft = 3;
    const tick = () => {
      if (cancelled.current) return;
      framesLeft -= 1;
      if (framesLeft <= 0) {
        scrollToBand();
        return;
      }
      settleHandle.current = requestAnimationFrame(tick);
    };
    settleHandle.current = requestAnimationFrame(tick);
  };

  const toggleBand = () => {
    const next = !open;
    setOpen(next);
    if (settleHandle.current) cancelAnimationFrame(settleHandle.current);
    if (next) {
      setOpenSection(FIRST_SECTION);
      // See the first section's transition prop below: it opens instantly,
      // in the same commit as the outer panel, rather than animating
      // alongside it.
      setSkipFirstSectionAnim(true);
      if (reduceMotion) {
        // No transition to wait out — still deferred one frame so this runs
        // after the DOM reflects the expanded state.
        requestAnimationFrame(scrollToBand);
      } else {
        pendingScroll.current = true;
      }
    } else {
      // Closing before the opening animation's onAnimationComplete has fired
      // (a fast double-click) would otherwise leave these stuck true, since
      // an interrupted animation never calls onAnimationComplete for the
      // target it was interrupted before reaching.
      pendingScroll.current = false;
      setSkipFirstSectionAnim(false);
    }
  };

  return (
    <section ref={bandRef} className={styles.band} aria-label="More links">
      <div className="container">
        <h2 className={styles.srOnly}>More links</h2>

        <button
          type="button"
          className={styles.masterToggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggleBand}
        >
          <span className={styles.masterLabel}>
            {open ? "Show Less Links" : "Show More Links"}
          </span>
          <ChevronDown
            size={16}
            className={styles.masterChevron}
            data-open={open || undefined}
            aria-hidden="true"
          />
        </button>

        {/* Height-collapsed rather than unmounted: every link stays in the DOM
            so the band is still crawlable while closed, which is the whole
            reason it exists. */}
        <motion.div
          id={panelId}
          className={styles.panel}
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={{ duration, ease }}
          onAnimationComplete={() => {
            // Also fires on close (animate target 0->auto in reverse) —
            // pendingScroll is only set true on an opening click, so a close
            // is a no-op here.
            if (!pendingScroll.current) return;
            pendingScroll.current = false;
            setSkipFirstSectionAnim(false);
            settleThenScroll();
          }}
          aria-hidden={!open}
        >
          <div className={styles.groups}>
            {SEO_LINK_SECTIONS.map((section) => {
              const isOpen = openSection === section.id;
              const sectionPanelId = `${uid}-${section.id}`;
              return (
                <div key={section.id} className={styles.group}>
                  <button
                    type="button"
                    className={styles.groupToggle}
                    aria-expanded={isOpen}
                    aria-controls={sectionPanelId}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                  >
                    <span className={styles.groupTitle}>{section.title}</span>
                    <ChevronDown
                      size={16}
                      className={styles.groupChevron}
                      data-open={isOpen || undefined}
                      aria-hidden="true"
                    />
                  </button>

                  <motion.div
                    id={sectionPanelId}
                    className={styles.groupPanel}
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    // The outer panel above measures its own "auto" height
                    // once, at the instant its animation starts — it does
                    // not re-measure if a child keeps growing after that.
                    // The master toggle opens this section in the very same
                    // click, so if this animated in step with the outer
                    // panel, the outer's one-time measurement would race
                    // against this one: whichever the browser happens to
                    // paint first. Losing that race is what made the
                    // scroll-to-band position only sometimes miscompute —
                    // it isn't from the scroll code at all, it's the height
                    // the outer panel settled on. Snapping this section
                    // open with no transition, in the same commit as the
                    // outer panel's opening render, means the true final
                    // height already exists before the outer ever measures.
                    transition={{
                      duration: section.id === FIRST_SECTION && skipFirstSectionAnim ? 0 : duration,
                      ease,
                    }}
                  >
                    <ul className={styles.linkGrid}>
                      {section.links.map((link) => {
                        const external = link.href.startsWith("http");
                        const tab = open && isOpen ? 0 : -1;
                        return (
                          <li key={`${section.id}-${link.href}-${link.label}`}>
                            {external ? (
                              <a
                                href={link.href}
                                className={styles.link}
                                tabIndex={tab}
                                rel="noopener noreferrer"
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                className={styles.link}
                                tabIndex={tab}
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

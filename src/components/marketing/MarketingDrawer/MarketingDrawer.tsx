"use client";

/**
 * Marketing banner — a CMS-driven promotional panel that opens centred
 * over the page, dims and blurs what is behind it, and pauses any playing
 * video.
 *
 * It was a drawer arriving from an edge; it is a centred modal now, with
 * the shape as the only spatial choice. The image is full-bleed in both
 * proportions, with the copy on a scrim that fades INTO it rather than
 * meeting it at an edge — bottom-up when tall, left-to-right when wide.
 */

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import { duration, ease } from "@/lib/motion";
import styles from "./MarketingDrawer.module.css";
import {
  type BannerConfig,
  OVERLAY_RGB,
  DESCRIPTION_COLOR,
  FIELD_PRESETS,
  needsScrim,
  resolve,
} from "./types";
import CloseIcon from "@/components/marketing/CloseIcon";
import { useIsMobile } from "./useIsMobile";
import BannerScene, { SCENE_LEAD } from "./BannerScene";

type Props = {
  open: boolean;
  config: BannerConfig;
  onClose: () => void;
  onClosed: () => void;
};

/** The glow leads, the panel follows. */
const GLOW_LEAD = 0.5;

export default function MarketingDrawer({ open, config, onClose, onClosed }: Props) {
  const pausedRef = useRef<HTMLVideoElement[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const [sweep, setSweep] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) {
      setSweep(false);
      return;
    }

    const paused: HTMLVideoElement[] = [];
    document.querySelectorAll("video").forEach((v) => {
      if (!v.paused) {
        v.pause();
        paused.push(v);
      }
    });
    pausedRef.current = paused;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    const lenis = (window as unknown as { lenis?: { stop: () => void; start: () => void } }).lenis;
    lenis?.stop();

    // The scroll position is never touched. Fixing <body> froze the page
    // but forced scrollY to 0, which made the search composer undock and
    // then re-dock on close — a second object flying to the FAB.
    //
    // data-lenis-prevent on the scrim makes Lenis step aside rather than
    // drive the scroll itself, and once it has, an ordinary preventDefault
    // stops the native scroll underneath. Neither half works alone.
    const blockScroll = (e: Event) => {
      const path = e.composedPath?.() ?? [];
      for (const node of path) {
        if (node instanceof HTMLElement && node.hasAttribute("data-drawer-scrollable")) return;
      }
      e.preventDefault();
    };
    document.addEventListener("wheel", blockScroll, { passive: false, capture: true });
    document.addEventListener("touchmove", blockScroll, { passive: false, capture: true });

    const blockKeys = (e: KeyboardEvent) => {
      const keys = ["PageDown", "PageUp", "Home", "End", "ArrowDown", "ArrowUp", " "];
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (keys.includes(e.key)) e.preventDefault();
    };
    window.addEventListener("keydown", blockKeys, { passive: false });

    const t = window.setTimeout(() => setSweep(true), (GLOW_LEAD + 0.45) * 1000);

    return () => {
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
      document.removeEventListener("wheel", blockScroll, { capture: true });
      document.removeEventListener("touchmove", blockScroll, { capture: true });
      window.removeEventListener("keydown", blockKeys);
      lenis?.start();
      pausedRef.current.forEach((v) => v.play().catch(() => {}));
      pausedRef.current = [];
    };
  }, [open, onClose]);

  // One layout below 768px, whatever the orientation says. A letterbox
  // asset on a phone is mostly crop, so mobile always takes the vertical
  // image and the stacked arrangement that goes with it.
  const isMobile = useIsMobile();
  const wide = config.orientation === "horizontal" && !isMobile;
  const art = wide ? config.image.horizontal : config.image.vertical;

  const scrim = needsScrim(config);

  // How far up the panel the readable area has to reach. A headline alone
  // occupies the bottom third; add a description, two fields and two
  // buttons and it is most of the panel. With the short ramp, the form's
  // labels ended up sitting on bare photograph.
  const tallContent = config.form.enabled || config.description.enabled;

  const scrimFade = wide
    ? `linear-gradient(to right,
        rgba(${OVERLAY_RGB}, 0.97) 0%,
        rgba(${OVERLAY_RGB}, 0.93) 26%,
        rgba(${OVERLAY_RGB}, 0.72) 44%,
        rgba(${OVERLAY_RGB}, 0.34) 62%,
        rgba(${OVERLAY_RGB}, 0) 82%)`
    : tallContent
      ? `linear-gradient(to top,
        rgba(${OVERLAY_RGB}, 0.98) 0%,
        rgba(${OVERLAY_RGB}, 0.96) 42%,
        rgba(${OVERLAY_RGB}, 0.82) 62%,
        rgba(${OVERLAY_RGB}, 0.4) 80%,
        rgba(${OVERLAY_RGB}, 0) 97%)`
      : `linear-gradient(to top,
        rgba(${OVERLAY_RGB}, 0.97) 0%,
        rgba(${OVERLAY_RGB}, 0.9) 26%,
        rgba(${OVERLAY_RGB}, 0.6) 48%,
        rgba(${OVERLAY_RGB}, 0.22) 68%,
        rgba(${OVERLAY_RGB}, 0) 86%)`;

  /**
   * The panel's height, published for the close button to sit above.
   *
   * On mobile the panel grows with its content, so the close cannot be
   * placed from a constant — positioned against the design's 548px it
   * ended up inside the panel, on top of the artwork, as soon as a form
   * made the panel taller. Measured, it stays put whatever the content.
   */
  useEffect(() => {
    const el = panelRef.current;
    if (!open || !el) {
      document.documentElement.style.removeProperty("--banner-panel-h");
      return;
    }
    const publish = () =>
      document.documentElement.style.setProperty("--banner-panel-h", `${el.offsetHeight}px`);
    publish();
    const ro = new ResizeObserver(publish);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.removeProperty("--banner-panel-h");
    };
    // `open` only. Layout changes from content or breakpoint come
    // through the ResizeObserver, which is what it is there for.
  }, [open]);

  // Each block waits for the one above it. With the headline off there is
  // no sweep to wait for, so everything starts as soon as the panel lands.
  const headlineLines = config.headline.enabled ? config.headline.parts.length : 0;
  const descDelay = config.headline.enabled
    ? GLOW_LEAD + 0.45 + headlineLines * 0.14 + 0.45
    : GLOW_LEAD + 0.25;
  const formDelay = descDelay + (config.description.enabled ? 0.16 : 0);
  const ctaDelay = formDelay + (config.form.enabled ? 0.16 : 0);

  const fields = config.form.fields.slice(0, 2);
  const ctas = [config.cta.primary, config.cta.secondary];
  const hasCta = ctas.some((c) => c.enabled);
  // With every block switched off the panel is just the artwork, so the
  // copy column is not rendered at all — kept, it contributed only its
  // own padding and left a dead strip beneath the image.
  const hasContent =
    config.headline.enabled || config.description.enabled || config.form.enabled || hasCta;

  return (
    <AnimatePresence onExitComplete={onClosed}>
      {open && (
        <>
          <motion.div
            className={styles.scrim}
            onClick={onClose}
            data-lenis-prevent
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : duration.slowest * 2 } }}
            transition={{ duration: 0.4, ease: ease.out }}
          />

          {isMobile && <BannerScene />}

          <motion.div
            className={styles.glowFrame}
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 0.95, 0] }}
            exit={{ opacity: 0, transition: { duration: 0.3 } }}
            transition={{
              duration: GLOW_LEAD + 1.7,
              times: [0, 0.2, 0.45, 0.62, 1],
              ease: "easeInOut",
            }}
          >
            <span className={styles.glowAll} />
          </motion.div>

          <motion.div
            ref={panelRef}
            className={`${styles.panel} ${wide ? styles.wide : styles.tall}`}
            role="dialog"
            aria-modal="true"
            aria-label="Promotional message"
            style={{ transformOrigin: "center center" }}
            // Centred, so it grows from its own middle rather than an edge.
            initial={{ opacity: 0, scale: 0.84, y: 18, filter: "blur(16px)" }}
            animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
            exit={{
              opacity: 0, scale: 1, x: 0, y: 0,
              filter: reduced ? "blur(0px)" : "blur(16px)",
              transition: { duration: reduced ? 0 : duration.slowest * 2, ease: ease.standard },
            }}
            transition={{
              duration: isMobile ? 0.7 : 0.92,
              // On mobile the scene arrives first and the panel steps onto
              // it; on desktop the page's edge glow plays that part.
              delay: isMobile ? SCENE_LEAD : GLOW_LEAD,
              ease: [0.22, 1, 0.3, 1] as const,
            }}
          >
            {/* The image needs a positioned box of its own. On desktop
                that box is the whole panel; on mobile it is a flex row
                above the copy, which is what lets the stack work without
                a second <Image>. */}
            <div className={styles.media}>
              <Image
                key={art.src}
                src={art.src}
                alt={art.alt}
                fill
                sizes={wide ? "(max-width: 768px) 96vw, 70vw" : "(max-width: 768px) 92vw, 34vw"}
                className={wide ? styles.imageWide : styles.imageTall}
                priority
              />
              {/* Carries the panel's gradient up into the photograph so the
                  two meet in a wash rather than at a line. */}
              <span className={styles.mediaFade} aria-hidden />
            </div>

            {/* No type on the panel means nothing to make readable, and an
                image composed with its own copy only gets obscured. */}
            {scrim && (
              <div className={styles.innerOverlay} style={{ background: scrimFade }} aria-hidden />
            )}

            {hasContent && (
            <div
              className={`${styles.content} ${wide ? styles.contentWide : styles.contentTall}`}
              data-drawer-scrollable
              data-lenis-prevent
            >
              {config.headline.enabled && (
                <div className={styles.headline}>
                  {config.headline.parts.map((part, i) => (
                    <span key={part.id} className={styles.headlineLine}>
                      <TextSweepEffect
                        words={[part.text]}
                        finalColor={resolve(part.colorId)}
                        sweepMs={1100}
                        delayMs={i * 140}
                        active={sweep}
                      />
                    </span>
                  ))}
                </div>
              )}

              {config.description.enabled && (
                <motion.p
                  className={styles.description}
                  style={{ color: DESCRIPTION_COLOR }}
                  initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ delay: descDelay, duration: 0.6, ease: ease.out }}
                >
                  {config.description.text}
                </motion.p>
              )}

              {/* Form and buttons are one block, because the buttons are
                  what submits the form — a gap between them would read as
                  two unrelated things. */}
              {/* Nothing to submit and nothing to press means no form at
                  all — an empty one still carries its padding, which left
                  a dead strip under an image-only banner. */}
              {(config.form.enabled || hasCta) && (
              <form
                className={styles.actions}
                // Prototype: there is no endpoint yet, and nothing here is
                // persisted. Values live in the inputs and die with the
                // panel — no state, no storage, nothing written down.
                onSubmit={(e) => e.preventDefault()}
              >
                {config.form.enabled && fields.length > 0 && (
                  <motion.div
                    className={styles.fields}
                    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: formDelay, duration: 0.6, ease: ease.out }}
                  >
                    {fields.map((f) => {
                      const preset = FIELD_PRESETS[f.kind];
                      const id = `banner-field-${f.id}`;
                      return (
                        <div key={f.id} className={styles.field}>
                          <input
                            id={id}
                            name={f.kind}
                            className={styles.input}
                            type={preset.type}
                            autoComplete={preset.autoComplete}
                            inputMode={preset.inputMode}
                            maxLength={preset.maxLength}
                            pattern={preset.pattern}
                            // A single space, not the label. The label is
                            // the placeholder until the field is used, and
                            // :placeholder-shown is what tells CSS which of
                            // the two it is being right now — an empty
                            // string would never count as shown.
                            placeholder=" "
                            onInput={
                              preset.digitsOnly
                                ? (e) => {
                                    // Stripped as it is typed rather than
                                    // validated on submit, so a pasted
                                    // "+91 98765 43210" simply cannot
                                    // leave non-digits in the field.
                                    const el = e.currentTarget;
                                    const clean = el.value
                                      .replace(/\D/g, "")
                                      .slice(0, preset.maxLength);
                                    if (el.value !== clean) el.value = clean;
                                  }
                                : undefined
                            }
                            required
                          />
                          <label className={styles.fieldLabel} htmlFor={id}>
                            {f.label || preset.label}
                          </label>
                        </div>
                      );
                    })}
                  </motion.div>
                )}

                {hasCta && (
                  <motion.div
                    className={styles.ctaRow}
                    initial={{ opacity: 0, y: 12, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    transition={{ delay: ctaDelay, duration: 0.6, ease: ease.out }}
                  >
                    {config.cta.primary.enabled &&
                      // With a form present the primary button submits it,
                      // so it has to be a button. Without one it is a plain
                      // link to wherever the campaign points.
                      (config.form.enabled ? (
                        <button type="submit" className={styles.cta}>
                          {config.cta.primary.label}
                        </button>
                      ) : (
                        <a href={config.cta.primary.href} className={styles.cta}>
                          {config.cta.primary.label}
                        </a>
                      ))}

                    {config.cta.secondary.enabled && (
                      <a href={config.cta.secondary.href} className={styles.ctaSecondary}>
                        {config.cta.secondary.label}
                      </a>
                    )}
                  </motion.div>
                )}
              </form>
              )}
            </div>
            )}
          </motion.div>

          <motion.button
            type="button"
            onClick={onClose}
            className={`${styles.close} ${wide ? styles.closeWide : styles.closeTall}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : duration.base, delay: 0 } }}
            transition={{ delay: GLOW_LEAD + 0.4, duration: 0.35, ease: ease.out }}
          >
            <CloseIcon size={20} />
            <span className={styles.closeLabel}>Back to homepage</span>
          </motion.button>
        </>
      )}
    </AnimatePresence>
  );
}

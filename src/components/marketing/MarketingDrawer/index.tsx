"use client";

/**
 * Prototype harness for the marketing drawer.
 *
 * Holds the config in local state so the control panel can drive it live.
 * When this moves to the CMS, `config` arrives as a prop and both the
 * toggle and the panel disappear — the drawer itself is unchanged.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence } from "framer-motion";
import MarketingDrawer from "./MarketingDrawer";
import CollapsedToast from "./CollapsedToast";
import { bannerCollapse } from "./bannerCollapse";
import DrawerControlPanel from "./DrawerControlPanel";
import { type BannerConfig, DEFAULT_CONFIG } from "./types";
import styles from "./harness.module.css";

export default function MarketingDrawerLab() {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<BannerConfig>(DEFAULT_CONFIG);
  // close is a stable callback, so it cannot read `config` directly without
  // going stale. A ref keeps it current without re-creating the callback,
  // which would tear down the drawer's effect on every keystroke again.
  const configRef = useRef(config);
  // Written in an effect rather than during render. `close` only ever runs
  // from an event handler or a timer, both of which are after the commit,
  // so it never reads a stale value.
  useEffect(() => {
    configRef.current = config;
  }, [config]);
  const [mounted, setMounted] = useState(false);
  // Stable identity. As an inline arrow this changed on every render, so the
  // drawer's effect tore down and re-ran on each control-panel keystroke —
  // briefly releasing the scroll lock and restarting paused videos.
  // What the banner left behind, if anything.
  const [collapsed, setCollapsed] = useState<"toast" | null>(null);
  // Where the panel should shrink to. Measured at close time, so the morph
  // lands on the real collapsed element rather than an assumed position.
  const [morphTo, setMorphTo] = useState<{ x: number; y: number; width: number } | null>(null);

  const close = useCallback(() => {
    const mode = configRef.current.collapse;

    if (mode === "none") {
      setMorphTo(null);
      setOpen(false);
      return;
    }

    // Measure the destination BEFORE the drawer leaves.
    //
    // Only the toast now. It is not mounted yet, so its resting box is
    // derived from the same values its stylesheet uses — 274px wide,
    // 24px in from the bottom-left.
    //
    // The "fab" destination is gone with the floating action bar. When
    // the collapse is re-pointed at the search experience's bottom
    // island, this is where its box gets measured.
    const w = Math.min(274, window.innerWidth - 24);
    const target = { x: 24, y: window.innerHeight - 24 - 36, width: w };

    // morphTo must land in a render where the drawer is still OPEN.
    // AnimatePresence snapshots an exiting child's props from the last
    // render in which it was present — so setting both in one update meant
    // it exited with the previous props and played the normal retreat.
    setMorphTo(target);
    requestAnimationFrame(() => setOpen(false));

    // The collapsed form appears only once the panel has finished arriving,
    // so the two never overlap — it has to read as one object changing
    // shape, not a handover.
    window.setTimeout(() => setCollapsed(mode), 540);
  }, []);

  // Re-opening clears whatever it collapsed into.
  const reopen = useCallback(() => {
    bannerCollapse.clear();
    setCollapsed(null);
    setMorphTo(null);
    setOpen(true);
  }, []);

  useEffect(() => setMounted(true), []);
  // The FAB tile lives inside FloatingQuickActions, so it reaches back
  // through the store rather than a prop.
  useEffect(() => {
    (window as unknown as { __reopenBanner?: () => void }).__reopenBanner = reopen;
  }, [reopen]);
  if (!mounted) return null;

  const ui = (
    <>
      {/* Fixed, so it is reachable from anywhere on the page — the drawer
          has to be testable against every section behind it, not just the
          hero. Hidden while open so it does not sit over the scrim. */}
      {!open && (
        <button type="button" className={styles.toggle} onClick={() => setOpen(true)}>
          Toggle Drawer
        </button>
      )}

      <MarketingDrawer open={open} config={config} onClose={close} morphTo={morphTo} />

      <AnimatePresence>
        {collapsed === "toast" && (
          <CollapsedToast
            parts={config.headline.enabled ? config.headline.parts : []}
            onExpand={reopen}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && <DrawerControlPanel config={config} onChange={setConfig} />}
      </AnimatePresence>
    </>
  );

  // Portaled to <body>. The page renders inside <main z-index: 1>, which is
  // a stacking context — so however high the scrim's z-index, it was being
  // clamped inside that context and the navbar painted over it. A portal is
  // the only way out of an ancestor stacking context; raising the z-index
  // cannot fix it. Same reason the search experience portals when docked.
  return createPortal(ui, document.body);
}

"use client";

import { useEffect, type RefObject } from "react";
import type Lenis from "lenis";
import styles from "./BookingFocus.module.css";

/** Keep background controls inactive while a booking surface has focus. */
export default function useBookingFocus(expanded: boolean, dock: RefObject<HTMLElement | null>, lockScroll = true) {
  useEffect(() => {
    const panel = dock.current;
    if (!expanded || !panel) return;

    // Inert siblings at each ancestor level, leaving the dock and its popovers live.
    const background = new Map<HTMLElement, boolean>();
    let branch: HTMLElement = panel;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (!(sibling instanceof HTMLElement) || sibling === branch || sibling.inert
          || sibling.matches("script, style, link, [data-booking-backdrop]")) continue;
        background.set(sibling, sibling.inert);
        sibling.setAttribute("inert", "");
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }

    const root = document.documentElement;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped ?? false;
    if (lockScroll) {
      root.classList.add(styles.scrollLocked);
      if (!wasStopped) lenis?.stop();
    }

    const focusable = () => Array.from(panel.querySelectorAll<HTMLElement>(
      'button, input, select, textarea, a[href], [tabindex]',
    )).filter(element => element.tabIndex >= 0 && !element.matches(":disabled")
      && !element.closest("[inert]") && element.getClientRects().length > 0);
    const isCovered = () => panel.closest("[inert]") || document.querySelector(
      'dialog[open], [role="dialog"][aria-modal="true"]:not([data-booking-focus])',
    );
    const trapTab = (event: KeyboardEvent) => {
      if (event.key !== "Tab" || event.defaultPrevented || isCovered()) return;
      const elements = focusable();
      const first = elements[0];
      const last = elements.at(-1);
      if (!first) { event.preventDefault(); panel.focus({ preventScroll: true }); return; }
      if (event.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last?.focus({ preventScroll: true });
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus({ preventScroll: true });
      }
    };
    const containFocus = (event: FocusEvent) => {
      if (isCovered() || !(event.target instanceof Node) || panel.contains(event.target)) return;
      (focusable()[0] ?? panel).focus({ preventScroll: true });
    };
    document.addEventListener("keydown", trapTab);
    document.addEventListener("focusin", containFocus);
    return () => {
      document.removeEventListener("keydown", trapTab);
      document.removeEventListener("focusin", containFocus);
      background.forEach((wasInert, element) => { element.toggleAttribute("inert", wasInert); });
      if (lockScroll) {
        root.classList.remove(styles.scrollLocked);
        if (!wasStopped) lenis?.start();
      }
    };
  }, [expanded, dock, lockScroll]);
}

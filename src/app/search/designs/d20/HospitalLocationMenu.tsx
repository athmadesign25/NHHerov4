"use client";

import { useLayoutEffect, useRef, type KeyboardEvent, type ReactNode, type RefObject } from "react";
import cardStyles from "./DefaultDoctorCard.module.css";
import styles from "./HospitalLocationMenu.module.css";

interface Props {
  id: string;
  label: string;
  anchorRef: RefObject<HTMLDivElement | null>;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  children: ReactNode;
}

/** A top-layer hospital menu: the title stays visible while long lists scroll. */
export default function HospitalLocationMenu({ id, label, anchorRef, triggerRef, onClose, children }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const optionsRef = useRef<HTMLUListElement>(null);

  const revealOption = (option: HTMLElement) => {
    const list = optionsRef.current;
    if (!list) return;
    const optionRect = option.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (optionRect.top < listRect.top) list.scrollTop += optionRect.top - listRect.top;
    else if (optionRect.bottom > listRect.bottom) list.scrollTop += optionRect.bottom - listRect.bottom;
  };

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const list = optionsRef.current;
    const anchor = anchorRef.current;
    if (!panel || !list || !anchor) return;

    panel.showPopover();
    const rect = anchor.getBoundingClientRect();
    const computed = getComputedStyle(panel);
    const gap = parseFloat(computed.getPropertyValue("--space-8"));
    const viewport = window.visualViewport;
    const viewportLeft = viewport?.offsetLeft ?? 0;
    const viewportTop = viewport?.offsetTop ?? 0;
    const viewportWidth = viewport?.width ?? window.innerWidth;
    const viewportBottom = viewportTop + (viewport?.height ?? window.innerHeight);
    const width = Math.min(rect.width, viewportWidth - gap * 2);
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(viewportLeft + gap, Math.min(rect.left, viewportLeft + viewportWidth - width - gap))}px`;

    const toolbar = document.querySelector("[data-d3-search-bar]")?.getBoundingClientRect();
    const topEdge = Math.max(viewportTop + gap, toolbar && toolbar.bottom > viewportTop && toolbar.top < rect.top ? toolbar.bottom + gap : 0);
    const above = Math.max(0, rect.top - gap - topEdge);
    const below = Math.max(0, viewportBottom - rect.bottom - gap * 2);
    const titleHeight = panel.firstElementChild?.getBoundingClientRect().height ?? 0;
    const naturalHeight = titleHeight + list.scrollHeight + parseFloat(computed.borderTopWidth) + parseFloat(computed.borderBottomWidth);
    const desiredHeight = Math.min(parseFloat(computed.maxHeight), naturalHeight);
    const opensAbove = below < desiredHeight && above > below;
    const height = Math.min(desiredHeight, opensAbove ? above : below);
    panel.style.maxHeight = `${height}px`;
    panel.style.top = `${opensAbove ? rect.top - gap - height : rect.bottom + gap}px`;

    const selected = list.querySelector<HTMLButtonElement>('button[aria-pressed="true"]') ?? list.querySelector<HTMLButtonElement>("button");
    selected?.focus({ preventScroll: true });
    if (selected) revealOption(selected);

    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.contains(event.target) && !panel.contains(event.target)) onClose();
    };
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      event.stopPropagation();
      onClose();
      triggerRef.current?.focus({ preventScroll: true });
    };
    const dismissOnScroll = (event: Event) => {
      if (event.target instanceof Node && panel.contains(event.target)) return;
      onClose();
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", dismissOnScroll, true);
    window.addEventListener("resize", onClose);
    return () => {
      panel.hidePopover();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", dismissOnScroll, true);
      window.removeEventListener("resize", onClose);
    };
  }, [anchorRef, triggerRef, onClose]);

  const navigateOptions = (event: KeyboardEvent<HTMLUListElement>) => {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const options = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("button"));
    const current = options.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? options.length - 1
      : Math.max(0, Math.min(options.length - 1, current + (event.key === "ArrowDown" ? 1 : -1)));
    event.preventDefault();
    options[next]?.focus({ preventScroll: true });
  };

  return <div ref={panelRef} popover="manual" id={id} role="region" aria-label={label}
    className={`${cardStyles.locationsPopover} ${styles.menu}`} data-lenis-prevent>
    <p>Choose hospital</p>
    <ul ref={optionsRef} className={styles.options} onKeyDown={navigateOptions}
      onFocus={event => revealOption(event.target)}>{children}</ul>
  </div>;
}

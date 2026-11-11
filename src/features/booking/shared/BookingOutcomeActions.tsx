"use client";

import { useLayoutEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { duration, ease } from "@/lib/motion";
import surface from "../design20/previous/BookingPaymentBar.module.css";
import styles from "./BookingOutcomeActions.module.css";

type OutcomeAction = { label: string; href?: string; onClick?: () => void; external?: boolean };
interface Props {
  primary: OutcomeAction;
  secondary: OutcomeAction;
  label: string;
  message?: string;
  amount?: { label: string; value: string };
  ready?: boolean;
}

const getServer = () => false;
const subscribeMounted = () => () => {};
const getMounted = () => true;

function Action({ action, primary }: { action: OutcomeAction; primary?: boolean }) {
  const className = `${styles.action} ${primary ? styles.primary : styles.secondary}`;
  const content = <>{action.label}{action.external && <ArrowUpRight size={16} aria-hidden />}</>;
  if (!action.href) return <button type="button" className={className} onClick={action.onClick}>{content}</button>;
  return action.external
    ? <a href={action.href} className={className} target="_blank" rel="noopener noreferrer" aria-label={`${action.label} (opens in a new tab)`}>{content}</a>
    : <Link href={action.href} className={className}>{content}</Link>;
}

/** One persistent outcome bar, with room reserved below the page content. */
export default function BookingOutcomeActions({ primary, secondary, label, message, amount, ready = true }: Props) {
  const mounted = useSyncExternalStore(subscribeMounted, getMounted, getServer);
  const reduced = useReducedMotion();
  const reserve = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLElement>(null);
  const visible = mounted && ready;

  useLayoutEffect(() => {
    if (!visible || !bar.current || !reserve.current) return;
    const space = reserve.current;
    const dock = bar.current;
    const measure = () => space.style.setProperty("--outcome-dock-height", `${dock.offsetHeight}px`);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(dock);
    return () => observer.disconnect();
  }, [visible]);

  return <>
    <div ref={reserve} className={styles.reserve} aria-hidden />
    {mounted && createPortal(<AnimatePresence>
      {visible && <motion.section key="outcome-actions" ref={bar}
        className={`${surface.bar} ${styles.dock}`} data-enhanced data-confirmation-actions aria-label={label}
        initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}
        transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}>
        <div className={styles.context}>
          {amount && <div className={styles.amount}><span>{amount.label}</span><strong>{amount.value}</strong></div>}
          {message && <p className={styles.message}>{message}</p>}
        </div>
        <nav className={styles.actions} aria-label={label}>
          <Action action={secondary} /><Action action={primary} primary />
        </nav>
      </motion.section>}
    </AnimatePresence>, document.body)}
  </>;
}

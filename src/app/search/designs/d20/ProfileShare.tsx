"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { Check, Copy, Share2 } from "lucide-react";
import cardStyles from "./DefaultDoctorCard.module.css";
import styles from "./ProfileShare.module.css";

interface Props {
  doctorName: string;
  profileUrl: string;
  className?: string;
}

/** A public profile link never carries the listing, patient, or booking state. */
function cleanProfileUrl(value: string) {
  const original = new URL(value, window.location.origin);
  if (original.protocol !== "https:" && original.protocol !== "http:") return null;
  const clean = new URL(original.pathname, original.origin);
  if (original.searchParams.get("design") === "d20") clean.searchParams.set("design", "d20");
  return clean.href;
}

export default function ProfileShare({ doctorName, profileUrl, className }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [nativeAvailable, setNativeAvailable] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState<CSSProperties>({});
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const openOrigin = useRef<"hover" | "pointer" | "keyboard">("pointer");
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();
  const errorId = useId();

  const cancelClose = () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
    closeTimer.current = null;
  };

  const close = (restoreFocus = false) => {
    cancelClose();
    setOpen(false);
    if (restoreFocus) requestAnimationFrame(() => trigger.current?.focus({ preventScroll: true }));
  };

  const scheduleClose = () => {
    cancelClose();
    // Leave a small bridge across the gap between the trigger and floating glass.
    // A keyboard-opened dialog stays available while its controls have focus.
    if (openOrigin.current === "keyboard" && root.current?.contains(document.activeElement)) return;
    closeTimer.current = setTimeout(() => setOpen(false), 160);
  };

  useEffect(() => () => {
    if (closeTimer.current !== null) clearTimeout(closeTimer.current);
  }, []);

  useEffect(() => {
    if (!open) return;
    const popover = panel.current;
    popover?.showPopover();
    if (openOrigin.current === "keyboard") {
      popover?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
    }
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    const scroll = (event: Event) => {
      if (event.target instanceof Node && popover?.contains(event.target)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", scroll, true);
    window.addEventListener("resize", scroll);
    return () => {
      if (closeTimer.current !== null) clearTimeout(closeTimer.current);
      closeTimer.current = null;
      popover?.hidePopover();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", scroll, true);
      window.removeEventListener("resize", scroll);
    };
  }, [open]);

  const openOptions = (origin: "hover" | "pointer" | "keyboard" = "pointer") => {
    if (!trigger.current) return;
    cancelClose();
    openOrigin.current = origin;
    const rect = trigger.current.getBoundingClientRect();
    const tokens = getComputedStyle(trigger.current);
    const gap = parseFloat(tokens.getPropertyValue("--sp-1"));
    const inset = gap * 2;
    const width = Math.min(parseFloat(tokens.getPropertyValue("--sp-16")) + parseFloat(tokens.getPropertyValue("--sp-8")), window.innerWidth - inset * 2);
    const below = Math.max(0, window.innerHeight - rect.bottom - inset);
    const above = Math.max(0, rect.top - inset);
    const opensAbove = below < width && above > below;
    setPosition({
      left: Math.max(inset, Math.min(rect.right - width, window.innerWidth - width - inset)),
      top: opensAbove ? "auto" : rect.bottom + gap,
      bottom: opensAbove ? window.innerHeight - rect.top + gap : "auto",
      width,
      maxHeight: opensAbove ? above : below,
    });
    setOpen(true);
  };

  const shareNatively = async (shareUrl: string) => {
    setSharing(true);
    try {
      await navigator.share({ title: `${doctorName} | Narayana Health`, text: doctorName, url: shareUrl });
      close(true);
    } catch (error) {
      // Dismissing the system sheet is a normal action, not an error state.
      if (!(error instanceof DOMException && error.name === "AbortError")) openOptions();
    } finally {
      setSharing(false);
    }
  };

  const prepareShare = () => {
    let clean: string | null;
    try { clean = cleanProfileUrl(profileUrl); } catch { clean = null; }
    if (!clean) { setStatus("This profile link is unavailable. Please try again."); return null; }
    setUrl(clean);
    setCopied(false);
    setCopyError(false);
    setStatus("");
    const supportsNative = typeof navigator.share === "function"
      && (typeof navigator.canShare !== "function" || navigator.canShare({ url: clean }));
    setNativeAvailable(supportsNative);
    return { clean, supportsNative };
  };

  const openOnHover = (pointerType: string) => {
    cancelClose();
    if (open || pointerType !== "mouse" || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (prepareShare()) openOptions("hover");
  };

  const handleShare = (keyboard: boolean) => {
    cancelClose();
    if (open) {
      if (openOrigin.current === "hover") {
        openOrigin.current = keyboard ? "keyboard" : "pointer";
        if (keyboard) panel.current?.querySelector<HTMLAnchorElement>("a")?.focus({ preventScroll: true });
      } else close();
      return;
    }
    const prepared = prepareShare();
    if (!prepared) return;
    const { clean, supportsNative } = prepared;
    if (supportsNative && window.matchMedia("(pointer: coarse)").matches) {
      void shareNatively(clean);
    } else openOptions(keyboard ? "keyboard" : "pointer");
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setCopyError(false);
      setStatus("Profile link copied.");
    } catch {
      setCopyError(true);
      setStatus("Copy is unavailable. Select and copy the link below.");
    }
  };

  const shareText = `${doctorName}\n${url}`;
  return (
    <div ref={root} className={`${styles.root}${className ? ` ${className}` : ""}`} data-share-open={open || undefined}
      onPointerEnter={cancelClose} onPointerLeave={scheduleClose} onBlur={event => {
      if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close();
    }}>
      <button ref={trigger} type="button" className={styles.trigger} onClick={event => handleShare(event.detail === 0)}
        onPointerEnter={event => openOnHover(event.pointerType)}
        disabled={sharing} aria-label={`Share ${doctorName}'s profile`}
        aria-expanded={open} aria-controls={open ? panelId : undefined} aria-haspopup="dialog">
        <Share2 size={16} strokeWidth={1.8} aria-hidden />
      </button>
      {open && <div ref={panel} id={panelId} popover="manual" role="dialog" aria-label="Share profile"
        className={`${cardStyles.locationsPopover} ${styles.popover}`} style={position} data-lenis-prevent
        onPointerEnter={cancelClose} onPointerLeave={scheduleClose}>
        <a className={styles.option} href={`https://wa.me/?text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          <Image src="/icons/whatsapp.svg" alt="" width={18} height={18} /><span>WhatsApp</span>
        </a>
        <button type="button" className={styles.option} onClick={() => void copyLink()}>
          {copied ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}<span>{copied ? "Link copied" : "Copy link"}</span>
        </button>
        <a className={styles.option} href={`https://mail.google.com/mail/?view=cm&fs=1&su=${encodeURIComponent(`${doctorName} | Narayana Health`)}&body=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer">
          <Image src="/icons/gmail.svg" alt="" width={18} height={18} /><span>Gmail</span>
        </a>
        {nativeAvailable && <button type="button" className={styles.option} disabled={sharing} onClick={() => void shareNatively(url)}>
          <Share2 size={18} aria-hidden /><span>More apps</span>
        </button>}
        {copyError && <div className={styles.copyFallback}>
          <p id={errorId}>Select and copy this link:</p>
          <input aria-label="Doctor profile link" aria-describedby={errorId} readOnly value={url} onFocus={event => event.currentTarget.select()} />
        </div>}
      </div>}
      <span className={styles.srOnly} role="status">{status}</span>
    </div>
  );
}

"use client";

import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Loader2, MapPin, Navigation, Search, X } from "lucide-react";
import type Lenis from "lenis";
import styles from "./SearchCityPicker.module.css";
import CityPickerScrollbar from "./CityPickerScrollbar";

interface Props {
  cities: readonly { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
  describedBy?: string;
  busy?: boolean;
  showDeviceLocation?: boolean;
}

const mobileQuery = "(max-width: 639px)";
function subscribeViewport(callback: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function mobileSnapshot() { return window.matchMedia(mobileQuery).matches; }
function serverSnapshot() { return false; }

/** Shared city picker with immediate, URL-backed multiple selection. */
export default function SearchCityPicker(props: Props) {
  const { cities, value, className = "", describedBy, busy } = props;
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const mobile = useSyncExternalStore(subscribeViewport, mobileSnapshot, serverSnapshot);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const selected = value === "All" ? [] : value.split(",");
  const firstLabel = cities.find(city => city.value === selected[0])?.label ?? selected[0];
  const label = !selected.length ? "All locations" : selected.length === 1 ? firstLabel : `${firstLabel} +${selected.length - 1}`;
  const panel = open ? <CityPanel {...props} key={mobile ? "sheet" : "popover"} mobile={mobile} id={id} trigger={trigger} root={root} onClose={close} /> : null;

  return <div ref={root} className={`${styles.location} ${className}`} data-active={value !== "All" || undefined}>
    <button ref={trigger} type="button" className={styles.trigger} data-doctor-location
      aria-label={`Change city: ${label}`} aria-haspopup="dialog" aria-expanded={open}
      aria-controls={open ? id : undefined} aria-describedby={describedBy} aria-busy={busy}
      onClick={() => setOpen(previous => !previous)}>
      {busy ? <Loader2 className={styles.spinner} aria-hidden /> : <MapPin aria-hidden />}
      <span className={styles.label}>{busy ? "Finding location…" : label}</span>
      <ChevronDown className={styles.chevron} aria-hidden />
    </button>
    {mobile && panel ? createPortal(panel, document.body) : panel}
  </div>;
}

function CityPanel({ cities, value, busy, showDeviceLocation, onChange, onClose, mobile, id, trigger, root }: Props & {
  mobile: boolean;
  id: string;
  trigger: RefObject<HTMLButtonElement | null>;
  root: RefObject<HTMLDivElement | null>;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const scrollViewport = useRef<HTMLDivElement>(null);
  const options = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef(true);
  const searchTerms = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  const visibleCities = [{ value: "All", label: "All locations" }, ...cities].filter(city =>
    searchTerms.every(term => `${city.label} ${city.value === "Bangalore" ? "Bengaluru" : ""}`.toLocaleLowerCase("en").includes(term)));

  useEffect(() => {
    const panel = dialog.current;
    const returnTo = trigger.current;
    const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
    const wasStopped = lenis?.isStopped;
    const previousOverflow = document.body.style.overflow;
    if (mobile) {
      panel?.showModal();
      document.body.style.overflow = "hidden";
      if (!wasStopped) lenis?.stop();
      // Avoid opening the mobile keyboard until the user taps Search.
      panel?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    } else panel?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    return () => {
      if (mobile) {
        panel?.close();
        document.body.style.overflow = previousOverflow;
        if (!wasStopped) lenis?.start();
      }
      if (restoreFocus.current && returnTo?.isConnected) returnTo.focus({ preventScroll: true });
    };
  }, [mobile, trigger]);

  useEffect(() => {
    if (mobile) return;
    const keepInViewport = () => {
      const panel = dialog.current;
      if (!panel) return;
      const gap = parseFloat(getComputedStyle(panel).getPropertyValue("--space-16"));
      panel.style.setProperty("--city-picker-max-height", `${Math.max(0, window.innerHeight - panel.getBoundingClientRect().top - gap)}px`);
    };
    const outside = (event: Event) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { restoreFocus.current = false; onClose(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", outside);
    window.addEventListener("resize", keepInViewport);
    window.addEventListener("scroll", keepInViewport, { passive: true });
    keepInViewport();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", outside);
      window.removeEventListener("resize", keepInViewport);
      window.removeEventListener("scroll", keepInViewport);
    };
  }, [mobile, onClose, root]);

  const selected = value === "All" ? [] : value.split(",");
  function choose(city: string) {
    if (city === "__device") { onClose(); onChange(city); return; }
    if (city === "All") { onChange("All"); return; }
    const next = selected.includes(city) ? selected.filter(item => item !== city) : [...selected, city];
    onChange(next.length ? next.join(",") : "All");
  }
  const isSelected = (city: string) => city === "All" ? !selected.length : selected.includes(city);
  function navigateOptions(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !mobile) { event.preventDefault(); onClose(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    if (event.target === input.current && ["Home", "End"].includes(event.key)) return;
    const buttons = [...options.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []];
    if (!buttons.length) return;
    event.preventDefault();
    const active = buttons.indexOf(document.activeElement as HTMLButtonElement);
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowDown" ? (active + 1) % buttons.length : active <= 0 ? buttons.length - 1 : active - 1;
    buttons[next]?.focus();
  }

  return <dialog ref={dialog} id={id} open={mobile ? undefined : true} className={`${styles.panel} ${mobile ? styles.sheet : styles.popover}`}
    aria-labelledby={`${id}-title`} aria-modal={mobile || undefined} data-lenis-prevent onKeyDown={navigateOptions}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (mobile && event.target === event.currentTarget) onClose(); }}>
      <header className={styles.header}>
        <h2 id={`${id}-title`}>Choose cities</h2>
        <button type="button" className={styles.iconButton} aria-label="Close city picker" onClick={onClose}><X aria-hidden /></button>
      </header>
    <div ref={scrollViewport} className={styles.panelBody}>
      <div className={styles.search}>
        <Search aria-hidden />
        <label className={styles.srOnly} htmlFor={`${id}-search`}>Search cities</label>
        <input ref={input} id={`${id}-search`} type="search" placeholder="Search cities" value={query} autoComplete="off" maxLength={120} onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" className={styles.iconButton} aria-label="Clear city search" onClick={() => { setQuery(""); input.current?.focus(); }}><X aria-hidden /></button>}
      </div>
      <div className={styles.results}>
        <ul ref={options} className={styles.options} aria-label="Cities">
          {showDeviceLocation && !query.trim() && <li><button type="button" className={styles.option} disabled={busy} onClick={() => choose("__device")}><Navigation aria-hidden /><span className={styles.optionLabel}>Use my location</span></button></li>}
          {visibleCities.map(city => <li key={city.value}><button type="button" className={styles.option} role="checkbox" aria-checked={isSelected(city.value)} onClick={() => choose(city.value)}>
            <span className={styles.check} aria-hidden>{isSelected(city.value) && <Check />}</span><span className={styles.optionLabel}>{city.label}</span>
          </button></li>)}
        </ul>
        {!visibleCities.length && <div className={styles.empty} role="status"><p>No matching cities</p><button type="button" onClick={() => { setQuery(""); input.current?.focus(); }}>Clear search</button></div>}
      </div>
    </div>
  <CityPickerScrollbar viewport={scrollViewport} /></dialog>;
}

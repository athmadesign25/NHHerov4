"use client";

import { useEffect, useId, useRef, useState, useSyncExternalStore, type KeyboardEvent, type RefObject } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, Building2, Check, ChevronDown, ChevronRight, MapPin, Search, X } from "lucide-react";
import type Lenis from "lenis";
import type { FacilityId, HealthFacility } from "../catalog";
import { healthCityKey, healthFacilityServesCity } from "../healthFacilitySelection";
import styles from "./HealthLocationPicker.module.css";

interface Props {
  cities: readonly { value: string; label: string }[];
  facilities: readonly HealthFacility[];
  selectedFacility?: HealthFacility;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onSelect: (id: FacilityId) => void;
}

const mobileQuery = "(max-width: 639px)";
function subscribeViewport(callback: () => void) {
  const media = window.matchMedia(mobileQuery);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}
function mobileSnapshot() { return window.matchMedia(mobileQuery).matches; }
function serverSnapshot() { return false; }

/** City and centre are one committed location; changing the city alone never clears a selection. */
export default function HealthLocationPicker(props: Props) {
  const { selectedFacility, open, onOpen, onClose } = props;
  const mobile = useSyncExternalStore(subscribeViewport, mobileSnapshot, serverSnapshot);
  const trigger = useRef<HTMLButtonElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const id = useId();
  const panel = open ? <LocationPanel {...props} key={mobile ? "sheet" : "popover"} mobile={mobile} id={id} trigger={trigger} root={root} /> : null;

  return <div className={styles.location} ref={root} data-health-location>
    <button ref={trigger} type="button" className={styles.trigger} aria-haspopup="dialog" aria-expanded={open} aria-controls={open ? id : undefined}
      aria-label={selectedFacility ? `Change location: ${selectedFacility.city}, ${selectedFacility.name}` : "Choose city and centre"}
      title={selectedFacility ? `${selectedFacility.city} · ${selectedFacility.name}` : undefined}
      onClick={open ? onClose : onOpen}>
      <MapPin className={styles.pin} aria-hidden />
      <span className={styles.triggerText}><strong>{selectedFacility?.city ?? "Choose city"}</strong><span>{selectedFacility?.name ?? "Hospital or clinic"}</span></span>
      <ChevronDown className={styles.chevron} aria-hidden />
    </button>
    {mobile && panel ? createPortal(panel, document.body) : panel}
  </div>;
}

function LocationPanel({ cities, facilities, selectedFacility, onClose, onSelect, mobile, id, trigger, root }: Props & {
  mobile: boolean;
  id: string;
  trigger: RefObject<HTMLButtonElement | null>;
  root: RefObject<HTMLDivElement | null>;
}) {
  const [city, setCity] = useState<string | null>(() => selectedFacility ? healthCityKey(selectedFacility.city) : null);
  const [query, setQuery] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const options = useRef<HTMLUListElement>(null);
  const restoreFocus = useRef(true);
  const titleId = `${id}-title`;
  const searchId = `${id}-search`;
  const cityLabel = cities.find(entry => entry.value === city)?.label ?? selectedFacility?.city ?? "";
  const searchTerms = query.toLocaleLowerCase("en").trim().split(/\s+/).filter(Boolean);
  const matches = (value: string) => searchTerms.every(term => value.toLocaleLowerCase("en").includes(term));
  const visibleCities = cities.filter(entry => matches(entry.label));
  const visibleCentres = city ? facilities.filter(entry => healthFacilityServesCity(entry, city) && matches(`${entry.name} ${entry.address}`)) : [];

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
    }
    // Keep the mobile keyboard closed until the user chooses to search.
    if (mobile) panel?.querySelector<HTMLButtonElement>("button")?.focus({ preventScroll: true });
    else input.current?.focus({ preventScroll: true });
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
      panel.style.setProperty("--health-location-panel-max-height", `${Math.max(0, window.innerHeight - panel.getBoundingClientRect().top - gap)}px`);
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { restoreFocus.current = false; onClose(); }
    };
    const focusOutside = (event: FocusEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) { restoreFocus.current = false; onClose(); }
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("focusin", focusOutside);
    window.addEventListener("resize", keepInViewport);
    window.addEventListener("scroll", keepInViewport, { passive: true });
    keepInViewport();
    return () => {
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("focusin", focusOutside);
      window.removeEventListener("resize", keepInViewport);
      window.removeEventListener("scroll", keepInViewport);
    };
  }, [mobile, onClose, root]);

  function changeCity(value: string | null) {
    setCity(value);
    setQuery("");
    if (!mobile) input.current?.focus({ preventScroll: true });
    else requestAnimationFrame(() => dialog.current?.querySelector<HTMLHeadingElement>("h2")?.focus({ preventScroll: true }));
  }

  function navigateOptions(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Escape" && !mobile) { event.preventDefault(); onClose(); return; }
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    const buttons = [...options.current?.querySelectorAll<HTMLButtonElement>("button") ?? []];
    if (!buttons.length) return;
    const active = buttons.indexOf(document.activeElement as HTMLButtonElement);
    // Home/End retain their usual text-editing behaviour in the search field.
    if (event.target === input.current && (event.key === "Home" || event.key === "End")) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : event.key === "ArrowDown" ? (active + 1) % buttons.length : active <= 0 ? buttons.length - 1 : active - 1;
    buttons[next]?.focus();
  }

  return <dialog ref={dialog} id={id} open={mobile ? undefined : true} className={`${styles.panel} ${mobile ? styles.sheet : styles.popover}`}
    aria-labelledby={titleId} aria-modal={mobile || undefined} data-lenis-prevent onKeyDown={navigateOptions}
    onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (mobile && event.target === event.currentTarget) onClose(); }}>
    <div className={styles.panelBody}>
      <header className={styles.header}>
        <div className={styles.titleGroup}>
          {city && <button type="button" className={styles.iconButton} aria-label="Choose another city" onClick={() => changeCity(null)}><ArrowLeft aria-hidden /></button>}
          <h2 id={titleId} tabIndex={-1}>{city ? "Choose a centre" : "Choose a city"}</h2>
        </div>
        <button type="button" className={styles.iconButton} aria-label="Close location picker" onClick={onClose}><X aria-hidden /></button>
      </header>
      {city && <button type="button" className={styles.cityContext} onClick={() => changeCity(null)} aria-label={`Change city, currently ${cityLabel}`}><MapPin aria-hidden /><span>{cityLabel}</span><ChevronDown aria-hidden /></button>}
      <div className={styles.search}>
        <Search aria-hidden />
        <label className={styles.srOnly} htmlFor={searchId}>{city ? "Search hospitals and clinics" : "Search cities"}</label>
        <input ref={input} id={searchId} type="search" placeholder={city ? "Search hospitals and clinics" : "Search cities"} value={query} autoComplete="off" maxLength={120} onChange={event => setQuery(event.target.value)} />
        {query && <button type="button" className={styles.iconButton} aria-label="Clear location search" onClick={() => { setQuery(""); input.current?.focus(); }}><X aria-hidden /></button>}
      </div>
      <div className={styles.results}>
        <ul ref={options} className={styles.options} aria-label={city ? `Hospitals and clinics in ${cityLabel}` : "Cities"}>
          {city ? visibleCentres.map(entry => <li key={entry.id}><button type="button" className={styles.option} aria-pressed={selectedFacility?.id === entry.id} onClick={() => onSelect(entry.id)}>
            <Building2 className={styles.optionIcon} aria-hidden />
            <span className={styles.optionCopy}><strong>{entry.name}</strong>{entry.address && entry.address !== entry.name && <small>{entry.address}</small>}</span>
            <span className={styles.radio} aria-hidden>{selectedFacility?.id === entry.id && <Check />}</span>
          </button></li>) : visibleCities.map(entry => <li key={entry.value}><button type="button" className={styles.option} onClick={() => changeCity(entry.value)}>
            <MapPin className={styles.optionIcon} aria-hidden /><span className={styles.optionCopy}><strong>{entry.label}</strong></span><ChevronRight className={styles.rowChevron} aria-hidden />
          </button></li>)}
        </ul>
        {(city ? !visibleCentres.length : !visibleCities.length) && <div className={styles.empty} role="status"><p>{query ? "No matching locations" : "No health checkup centres listed here"}</p><button type="button" onClick={() => query ? setQuery("") : changeCity(null)}>{query ? "Clear search" : "Choose another city"}</button></div>}
      </div>
    </div>
  </dialog>;
}

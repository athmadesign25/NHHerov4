"use client";

import { useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import cardStyles from "../d17/DoctorCard.module.css";
import styles from "./HospitalPicker.module.css";

interface Props {
  doctorName: string;
  locations: { name: string }[];
  value: string;
  onChange: (value: string) => void;
}

/** Keeps a single practice location quiet, with a glass picker when there are choices. */
export default function HospitalPicker({ doctorName, locations, value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<CSSProperties>({});
  const panel = useRef<HTMLDivElement>(null);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const names = [...new Set(locations.map(location => location.name).filter(Boolean))];
  const hospital = names.includes(value) ? value : names[0] ?? value;
  const lastSpace = hospital.lastIndexOf(" ");

  useEffect(() => {
    if (!open) return;
    const menu = panel.current;
    menu?.showPopover();
    const dismissOnScroll = (event: Event) => {
      if (event.target instanceof Node && menu?.contains(event.target)) return;
      setOpen(false);
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setOpen(false);
      trigger.current?.focus({ preventScroll: true });
    };
    document.addEventListener("pointerdown", outside);
    document.addEventListener("keydown", escape);
    window.addEventListener("scroll", dismissOnScroll, true);
    window.addEventListener("resize", dismissOnScroll);
    return () => {
      menu?.hidePopover();
      document.removeEventListener("pointerdown", outside);
      document.removeEventListener("keydown", escape);
      window.removeEventListener("scroll", dismissOnScroll, true);
      window.removeEventListener("resize", dismissOnScroll);
    };
  }, [open]);

  const toggle = () => {
    if (!open && root.current) {
      const rect = root.current.getBoundingClientRect();
      const spacing = parseFloat(getComputedStyle(root.current).getPropertyValue("--sp-16"));
      const gap = parseFloat(getComputedStyle(root.current).getPropertyValue("--sp-1"));
      const expectedHeight = Math.min(spacing * 2, window.innerHeight / 2);
      const below = Math.max(0, window.innerHeight - rect.bottom - gap * 2);
      const before = Math.max(0, rect.top - gap * 2);
      const opensAbove = below < expectedHeight && before > below;
      setPosition({ position: "fixed", left: rect.left, right: "auto", width: rect.width, margin: 0,
        top: opensAbove ? "auto" : rect.bottom + gap,
        bottom: opensAbove ? window.innerHeight - rect.top + gap : "auto",
        maxHeight: Math.min(expectedHeight, opensAbove ? before : below) });
    }
    setOpen(previous => !previous);
  };

  if (names.length <= 1) return (
    <p className={styles.hospital}>
      <MapPin size={16} aria-hidden />
      <span>{hospital || "Contact NH for hospital details"}</span>
    </p>
  );

  return (
    <div className={styles.picker} ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <button ref={trigger} type="button" className={`${styles.hospital} ${styles.trigger}`}
        aria-expanded={open} aria-controls={panelId}
        aria-label={`${hospital}. Change hospital for ${doctorName}`}
        onClick={toggle}>
        <MapPin size={16} aria-hidden />
        <span>{hospital.slice(0, lastSpace + 1)}<span className={styles.nameEnd}>{hospital.slice(lastSpace + 1)}<ChevronDown className={styles.chevron} size={14} aria-hidden /></span></span>
      </button>
      {open && <div ref={panel} popover="manual" id={panelId} className={cardStyles.locationsPopover}
        role="region" aria-label={`Hospitals for ${doctorName}`} style={position} data-lenis-prevent>
        <p>Choose hospital</p>
        <ul>{names.map(name => {
          const distance = getDesign16HospitalPreview(name)?.distanceKm;
          return <li key={name}>
          <button type="button" className={cardStyles.locationOption} aria-pressed={name === hospital} onClick={() => {
            onChange(name);
            setOpen(false);
            trigger.current?.focus({ preventScroll: true });
          }}>
            <MapPin size={16} aria-hidden /><span>{name}{distance !== undefined && <span className={cardStyles.locationHint}>{distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km</span>}</span>
            <span className={cardStyles.locationCheck} aria-hidden>{name === hospital && <Check size={12} strokeWidth={3} />}</span>
          </button>
        </li>;
        })}</ul>
      </div>}
    </div>
  );
}

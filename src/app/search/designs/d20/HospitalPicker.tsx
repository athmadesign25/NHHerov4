"use client";

import { useCallback, useId, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import cardStyles from "./DefaultDoctorCard.module.css";
import HospitalLocationMenu from "./HospitalLocationMenu";
import styles from "./HospitalPicker.module.css";

interface Props {
  doctorName: string;
  locations: { name: string }[];
  value: string;
  onChange: (value: string) => void;
  showDirections?: boolean;
  distanceKm?: number;
}

/** Keeps a single practice location quiet, with a glass picker when there are choices. */
export default function HospitalPicker({ doctorName, locations, value, onChange, showDirections = false, distanceKm }: Props) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const names = [...new Set(locations.map(location => location.name).filter(Boolean))];
  const hospital = names.includes(value) ? value : names[0] ?? value;
  const lastSpace = hospital.lastIndexOf(" ");
  const travel = getDesign16HospitalPreview(hospital);
  const distance = distanceKm ?? travel?.distanceKm;
  const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
  const directions = showDirections && <a className={styles.directions} href={travel?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital)}`} target="_blank" rel="noopener noreferrer" aria-label={`${distanceLabel}. Get directions to ${travel?.directionsDestination ?? hospital} (opens in a new tab)`} title="Get directions">
    {distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg>
  </a>;

  const close = useCallback(() => setOpen(false), []);

  if (names.length <= 1) return (
    <div className={showDirections ? styles.hospitalRow : undefined}>
      <p className={styles.hospital}><span>{hospital || "Contact NH for hospital details"}</span></p>
      {directions}
    </div>
  );

  return (
    <div className={styles.picker} ref={root} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }}>
      <div className={showDirections ? styles.hospitalRow : undefined}>
      <button ref={trigger} type="button" className={`${styles.hospital} ${styles.trigger}`}
        aria-expanded={open} aria-controls={panelId}
        aria-label={`${hospital}. Change hospital for ${doctorName}`}
        onClick={() => setOpen(previous => !previous)}>
          <span>{hospital.slice(0, lastSpace + 1)}<span className={styles.nameEnd}>{hospital.slice(lastSpace + 1)}<ChevronDown className={styles.chevron} size={14} aria-hidden /></span></span>
      </button>
      {directions}
      </div>
      {open && <HospitalLocationMenu id={panelId} label={`Hospitals for ${doctorName}`}
        anchorRef={root} triggerRef={trigger} onClose={close}>
        {names.map(name => {
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
        })}
      </HospitalLocationMenu>}
    </div>
  );
}

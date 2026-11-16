"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, Navigation, X } from "lucide-react";
import { requestDoctorPosition } from "@/features/search/doctorPosition";
import { getDesign16NearbyCity } from "@/features/search/design16NearbyCity";
import chip from "../../doctors/DoctorControlChip.module.css";
import styles from "./NearMeLocation.module.css";

interface Props {
  location: string;
  cityOnly?: boolean;
  label?: string;
  selected: boolean;
  showSelectionClear?: boolean;
  reserveSelectionClear?: boolean;
  disabled?: boolean;
  onLocated: (city: string) => void;
  onClear: () => void;
  onFeedback: (message: string) => void;
}

/** Native location permission, followed by D16's stable sample-distance ordering. */
export default function NearMeLocation({ location, selected, showSelectionClear = true, reserveSelectionClear = false, disabled, cityOnly = false, label, onLocated, onClear, onFeedback }: Props) {
  const requestId = useRef(0);
  const [detecting, setDetecting] = useState(false);

  useEffect(() => {
    requestId.current += 1;
    setDetecting(false);
    onFeedback("");
    return () => { requestId.current += 1; };
  }, [location, onFeedback]);

  const detect = async () => {
    if (selected) { onClear(); onFeedback(""); return; }
    const request = ++requestId.current;
    const initial = window.location.href;
    const current = () => request === requestId.current && initial === window.location.href;
    setDetecting(true);
    onFeedback("");
    const result = await requestDoctorPosition(current);
    if (request !== requestId.current) return;
    setDetecting(false);
    if (!current()) return;
    if (result.position !== undefined) {
      const city = getDesign16NearbyCity(result.position);
      // Update city and order together; never persist coordinates in URLs/storage.
      if (city) onLocated(city);
      else onFeedback("Couldn’t find a nearby location. Choose a city to continue.");
    } else onFeedback(result.error);
  };

  return <button type="button" className={chip.chip} data-near-me disabled={detecting || disabled} aria-busy={detecting} aria-pressed={selected}
    aria-label={detecting ? "Finding your city" : label ?? (cityOnly ? "Use my location" : "Near me")} title={selected ? (cityOnly ? "Clear detected city" : "Remove nearby ordering") : "Find doctors in your nearest available city"}
    onClick={() => { void detect(); }}>
    {detecting ? <Loader2 size={16} className={styles.spinner} aria-hidden /> : <Navigation size={16} aria-hidden />}
    {detecting ? "Locating…" : label ?? (cityOnly ? "Use my location" : "Near me")}
    {showSelectionClear && (selected || reserveSelectionClear) && <span className={chip.selectionClear} data-selected={selected} aria-hidden><X size={14} /></span>}
  </button>;
}

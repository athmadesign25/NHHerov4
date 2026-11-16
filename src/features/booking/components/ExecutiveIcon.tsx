"use client";

import { useId } from "react";
import styles from "./ExecutiveSlotTag.module.css";

/** Supplied executive mark. Only its speed lines animate on selection. */
export default function ExecutiveIcon({ selected = false, className = "" }: { selected?: boolean; className?: string }) {
  const gradient = useId();
  return <svg viewBox="0 0 12 12" fill="none" aria-hidden="true" className={`${styles.icon} ${selected ? styles.iconSelected : ""} ${className}`}>
    <g className={styles.speedLines} strokeLinecap="round" strokeLinejoin="round">
      <path pathLength="1" d="M2 3.25H4.5" />
      <path pathLength="1" d="M1 6H3.25" />
      <path pathLength="1" d="M1.75 8.75H4.5" />
    </g>
    <path d="M8.68229 1.03498C8.89586 1.1194 9.02447 1.33843 8.99412 1.56606L8.56959 4.74998H10.4712C10.477 4.74998 10.4827 4.74998 10.4885 4.74998C10.5988 4.74995 10.7132 4.74993 10.8077 4.75857C10.9007 4.76707 11.0698 4.78959 11.2209 4.90625C11.3972 5.04231 11.5039 5.24966 11.5122 5.47219C11.5193 5.66301 11.4393 5.8137 11.3922 5.89428C11.3443 5.9762 11.2778 6.06927 11.2136 6.15908L7.90537 10.7906C7.77189 10.9775 7.52828 11.0494 7.31471 10.965C7.10115 10.8806 6.97254 10.6615 7.00289 10.4339L7.42741 7.24998H5.52578C5.52004 7.24998 5.51429 7.24998 5.50853 7.24998C5.39816 7.25001 5.28376 7.25003 5.18927 7.24139C5.09632 7.2329 4.92722 7.21037 4.77606 7.09371C4.59977 6.95765 4.49307 6.7503 4.48481 6.52777C4.47774 6.33696 4.5577 6.18626 4.60482 6.10569C4.65271 6.02377 4.71922 5.9307 4.78339 5.8409C4.78674 5.83621 4.79009 5.83153 4.79342 5.82687L8.09164 1.20936C8.22511 1.02249 8.46872 0.950572 8.68229 1.03498Z" fillRule="evenodd" clipRule="evenodd" fill={`url(#${gradient})`} />
    <defs><linearGradient id={gradient} x1="11.5941" y1="0.710462" x2="6.85381" y2="2.31434" gradientUnits="userSpaceOnUse"><stop stopColor="#EED308" /><stop offset="1" stopColor="#BE7C00" /></linearGradient></defs>
  </svg>;
}

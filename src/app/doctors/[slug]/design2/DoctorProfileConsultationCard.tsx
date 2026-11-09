"use client";

import { useState } from "react";
import Image from "next/image";
import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import DoctorProfileAvailability from "../DoctorProfileAvailability";
import profile from "./DoctorProfileDesign2.module.css";
import styles from "./DoctorProfileConsultationCard.module.css";

interface Props {
  title: string;
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  image?: { src: string; alt: string };
  directions?: { href: string; label: string };
  onBook?: () => void;
}

export default function DoctorProfileConsultationCard({ title, doctor, mode, image, directions, onBook }: Props) {
  const [imageFailed, setImageFailed] = useState(false);
  const hasImage = !!image && !imageFailed;

  return <li className={styles.card} data-bookable={!!onBook} data-has-image={hasImage} data-mode={mode}>
    {hasImage && <div className={styles.media}>
      <Image src={image.src} alt={image.alt} fill sizes="(max-width: 1023px) 32vw, 200px" className={styles.image} onError={() => setImageFailed(true)} />
    </div>}
    <div className={styles.content}>
      <div className={styles.identity}>
        <h3>{title}</h3>
        {directions && <a className={`${profile.distance} ${styles.distance}`} href={directions.href} target="_blank" rel="noopener noreferrer"
          aria-label={`${directions.label}. Get directions to ${title} (opens in a new tab)`}>
          {directions.label}<svg className={styles.directionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
            <path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" />
          </svg>
        </a>}
      </div>
      <div className={styles.booking}>
        <DoctorProfileAvailability doctor={doctor} mode={mode} tone="light" compact />
        {onBook && <button type="button" className={styles.action} onClick={onBook}
          aria-label={mode === "video" ? "Choose a video consultation slot" : `Choose a slot at ${title}`}>
          <span>Choose a slot</span>
        </button>}
      </div>
    </div>
  </li>;
}

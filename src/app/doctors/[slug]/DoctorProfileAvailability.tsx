"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { indiaClock, indiaDate } from "@/features/booking/appointmentTime";
import { getDesign20Availability } from "@/features/search/design20Availability";
import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import card from "@/app/search/designs/d20/DefaultDoctorCard.module.css";
import styles from "./DoctorProfileAvailability.module.css";

export default function DoctorProfileAvailability({ doctor, mode: requestedMode, tone = "light", showModeLabels = false, compact = false }: { doctor: DoctorListingItem; mode?: ConsultationMode; tone?: "light" | "dark"; showModeLabels?: boolean; compact?: boolean }) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  const modes = (["hospital", "video"] as const).filter(mode => doctor.modes[mode] === true && (!requestedMode || requestedMode === mode));
  if (!modes.length) return null;
  return <div className={`${styles.availability} ${card.availability} ${showModeLabels ? styles.labelled : ""} ${compact ? styles.compact : ""}`} data-tone={tone}>
    <p className={card.availabilityLabel}>{!compact && <Image src="/icons/doctor-card/slot.svg" alt="" width={16} height={16} />}Next available at</p>
    <div className={styles.options} role="list" aria-label={`Next availability for ${doctor.name}`}>
      {modes.map(mode => {
        const slot = now ? getDesign20Availability(doctor, mode, "", "any", now) : null;
        const day = slot && now ? indiaDate(slot) === indiaDate(now) ? "Today" : indiaDate(slot) === indiaDate(now, 1) ? "Tomorrow"
          : slot.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" }) : "";
        const time = slot ? `${day}, ${indiaClock(slot)}` : now ? "Check availability" : "Checking availability…";
        const label = mode === "hospital" ? `Hospital visit at ${doctor.hospital}` : "Video consultation";
        return <div key={mode} className={card.consultationOption} role="listitem" title={`${label}: ${time}`}>
          {!compact && <Image src={`/icons/doctor-card/${mode}.svg`} alt={showModeLabels ? "" : mode === "hospital" ? "Hospital visit:" : "Video consultation:"} width={16} height={16} className={card.consultationIcon} />}
          <span className={styles.optionCopy}>{showModeLabels && <span className={styles.modeLabel}>{mode === "hospital" ? "Hospital" : "Video"}</span>}<span className={card.appointmentTime}>{time}</span></span>
        </div>;
      })}
    </div>
  </div>;
}

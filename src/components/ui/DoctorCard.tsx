import React from "react";
import styles from "../home/HeroSearchFirst.module.css";
import HighlightMatch from "./HighlightMatch";
import { DoctorData } from "@/data/doctors";

interface DoctorCardProps {
  doc: DoctorData;
  searchQuery?: string;
  onClick: (name: string) => void;
}

export default function DoctorCard({ doc, searchQuery = "", onClick }: DoctorCardProps) {
  return (
    <div
      key={doc.name}
      onClick={() => onClick(doc.name)}
      className={styles.doctorCard}
    >
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start", width: "100%" }}>
        <img
          src={doc.photo || "/images/misc/doctor_avatar_male.png"}
          alt={doc.name}
          className={styles.doctorPhoto}
        />
        <div className={styles.doctorInfo} style={{ width: "100%" }}>
          <div className={styles.doctorName}>
            <HighlightMatch text={doc.name} query={searchQuery} />
          </div>
          <div className={styles.doctorSpec}>{doc.speciality}</div>
          <div className={styles.doctorLoc}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.locIcon}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            <span>
              <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                {doc.hospital}
                {doc.additionalHospitals && (
                  <span className={styles.plusMoreBadge}> +{doc.additionalHospitals}</span>
                )}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", gap: "4px", alignItems: "center", flexWrap: "wrap", width: "100%", borderTop: "1px solid var(--color-border)", paddingTop: "10px", marginTop: "2px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
          <img src="/Appointment/Hospital_visit.svg" alt="Hospital Visit" width={10} height={10} />
          {doc.availability?.hospital || "Today 05:30 PM"}
        </div>
        {(doc.consultationModes === "both" || !doc.consultationModes) && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#ffffff", color: "var(--color-text)", padding: "2px 6px", borderRadius: "20px", fontSize: "10px", fontWeight: 600, whiteSpace: "nowrap", border: "1px solid var(--color-border)" }}>
            <img src="/Appointment/Video_consultation.svg" alt="Video Consultation" width={10} height={10} />
            {doc.availability?.video || "Today 05:30 PM"}
          </div>
        )}
      </div>
    </div>
  );
}

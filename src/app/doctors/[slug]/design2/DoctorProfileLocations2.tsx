"use client";

import { ArrowRight, CornerUpRight } from "lucide-react";
import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import { selectDesign17ProfileHospital } from "@/features/search/design17Profile";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { getDesign20BookingDoctor } from "@/features/search/design20Directory";
import DoctorProfileAvailability from "../DoctorProfileAvailability";
import DoctorProfileCallBanner from "./DoctorProfileCallBanner";
import styles from "./DoctorProfileDesign2.module.css";

interface Props {
  doctor: DoctorListingItem;
  hospitals: string[];
  onBook?: (mode: ConsultationMode, hospital: string) => void;
}

export default function DoctorProfileLocations2({ doctor, hospitals, onBook }: Props) {
  if (!hospitals.length && !doctor.modes.video) return null;
  const bookingDoctor = getDesign20BookingDoctor(doctor.id);
  const bookableHospitals = bookingDoctor?.locations?.map(location => location.name) ?? (bookingDoctor ? [bookingDoctor.hospital] : []);
  return <section id="profile-locations" className={styles.chapter} aria-labelledby="profile-locations-heading">
    <header className={styles.chapterHeading}><h2 id="profile-locations-heading">Hospitals & availability</h2></header>
    <ul className={styles.locations}>
      {hospitals.map(hospital => {
        const preview = getDesign16HospitalPreview(hospital);
        const directions = preview?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital)}`;
        const distance = doctor.practiceLocations?.find(location => location.hospital === hospital)?.distanceKm ?? preview?.distanceKm;
        const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
        const canBook = !!onBook && doctor.modes.hospital && bookableHospitals.includes(hospital);
        return <li key={hospital} data-bookable={canBook}>
          <div className={styles.locationContent}>
            <h3>{hospital}{" "}<a className={styles.distance} href={directions} target="_blank" rel="noopener noreferrer" aria-label={`${distanceLabel}. Get directions to ${hospital} (opens in a new tab)`}>{distanceLabel}<CornerUpRight size={14} aria-hidden /></a></h3>
            <div className={styles.locationFooter}>
              <DoctorProfileAvailability doctor={selectDesign17ProfileHospital(doctor, hospital)} mode="hospital" tone="light" compact />
              {canBook && <button type="button" className={styles.locationBooking} onClick={() => onBook?.("hospital", hospital)} aria-label={`Choose a slot at ${hospital}`}><span>Choose a slot</span><ArrowRight size={16} aria-hidden /></button>}
            </div>
          </div>
        </li>;
      })}
      {doctor.modes.video && <li data-bookable={!!onBook && !!bookingDoctor}>
        <div className={styles.locationContent}>
          <h3>Video consultation</h3>
          <div className={styles.locationFooter}>
            <DoctorProfileAvailability doctor={doctor} mode="video" tone="light" compact />
            {onBook && bookingDoctor && <button type="button" className={styles.locationBooking} onClick={() => onBook("video", bookingDoctor.hospital)} aria-label="Choose a video consultation slot"><span>Choose a slot</span><ArrowRight size={16} aria-hidden /></button>}
          </div>
        </div>
      </li>}
    </ul>
    <DoctorProfileCallBanner />
  </section>;
}

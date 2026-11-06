import { MapPin, Video, CornerUpRight } from "lucide-react";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import { selectDesign17ProfileHospital } from "@/features/search/design17Profile";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import DoctorProfileAvailability from "../DoctorProfileAvailability";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileLocations2({ doctor, hospitals }: { doctor: DoctorListingItem; hospitals: string[] }) {
  if (!hospitals.length && !doctor.modes.video) return null;
  return <section id="profile-locations" className={styles.chapter} aria-labelledby="profile-locations-heading">
    <header className={styles.chapterHeading}><h2 id="profile-locations-heading">Hospitals & availability</h2></header>
    <ul className={styles.locations}>
      {hospitals.map(hospital => {
        const preview = getDesign16HospitalPreview(hospital);
        const directions = preview?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hospital)}`;
        const distance = doctor.practiceLocations?.find(location => location.hospital === hospital)?.distanceKm ?? preview?.distanceKm;
        const distanceLabel = distance !== undefined ? `${distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Directions";
        return <li key={hospital}><MapPin size={20} aria-hidden /><div><h3>{hospital}{" "}<a className={styles.distance} href={directions} target="_blank" rel="noopener noreferrer" aria-label={`${distanceLabel}. Get directions to ${hospital} (opens in a new tab)`}>{distanceLabel}<CornerUpRight size={14} aria-hidden /></a></h3><DoctorProfileAvailability doctor={selectDesign17ProfileHospital(doctor, hospital)} mode="hospital" tone="light" /></div></li>;
      })}
      {doctor.modes.video && <li><Video size={20} aria-hidden /><div><h3>Video consultation</h3><DoctorProfileAvailability doctor={doctor} mode="video" tone="light" /></div></li>}
    </ul>
  </section>;
}

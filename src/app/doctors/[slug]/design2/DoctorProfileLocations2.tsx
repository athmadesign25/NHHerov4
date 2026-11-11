"use client";

import type { ConsultationMode, DoctorListingItem } from "@/features/search/doctorListing";
import { selectDesign17ProfileHospital } from "@/features/search/design17Profile";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { getDesign20BookingDoctor } from "@/features/search/design20Directory";
import { getDoctorProfileHospitalImage } from "@/features/search/doctorProfileHospitalImages";
import DoctorProfileConsultationCard from "./DoctorProfileConsultationCard";
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
        return <DoctorProfileConsultationCard key={hospital} title={hospital}
          doctor={selectDesign17ProfileHospital(doctor, hospital)} mode="hospital"
          image={getDoctorProfileHospitalImage(hospital)} directions={{ href: directions, label: distanceLabel }}
          onBook={canBook ? () => onBook?.("hospital", hospital) : undefined} />;
      })}
      {doctor.modes.video && <DoctorProfileConsultationCard title="Video consultation" doctor={doctor} mode="video"
        image={{ src: "/images/profile-locations/video-consultation-angled.webp", alt: "Doctor on a smartphone video consultation" }}
        onBook={onBook && bookingDoctor ? () => onBook("video", bookingDoctor.hospital) : undefined} />}
    </ul>
    <DoctorProfileCallBanner />
  </section>;
}

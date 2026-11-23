import { nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import styles from "./DoctorDetails.module.css";

interface Props { doctor: DoctorListingItem; mode: ConsultationMode }

/** Full clinical details retain the practice location selected on the card. */
export default function DoctorDetails({ doctor, mode }: Props) {
  const slot = nextSlot(doctor, mode);
  const experience = /\b(?:years?|yrs?)\b/i.test(doctor.experience) ? doctor.experience : `${doctor.experience} years`;
  const expertise = [...new Set(doctor.expertise?.filter(Boolean) ?? [])];
  return <dl className={styles.details}>
    <div><dt>Speciality</dt><dd>{doctor.speciality || "Speciality information unavailable"}</dd></div>
    {doctor.designation && <div><dt>Designation</dt><dd>{doctor.designation}</dd></div>}
    {doctor.experience && <div><dt>Experience</dt><dd>{experience}</dd></div>}
    {doctor.degrees && <div><dt>Qualifications</dt><dd>{doctor.degrees}</dd></div>}
    {expertise.length > 0 && <div><dt>Expertise</dt><dd><ul>{expertise.map(value => <li key={value}>{value}</li>)}</ul></dd></div>}
    {doctor.languages?.length ? <div><dt>Languages</dt><dd>{doctor.languages.join(" · ")}</dd></div> : null}
    {mode === "hospital" && doctor.hospital && <div><dt>Hospital</dt><dd>{doctor.hospital}</dd></div>}
    <div><dt>{mode === "hospital" ? "Next hospital appointment" : "Next video consultation"}</dt><dd>{slot
      ? new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }).format(slot)
      : "Contact NH for appointment times"}</dd></div>
    <div><dt>Consultation fee</dt><dd>{doctor.fee ? `From ${doctor.fee}` : "Confirm with NH"}</dd></div>
  </dl>;
}

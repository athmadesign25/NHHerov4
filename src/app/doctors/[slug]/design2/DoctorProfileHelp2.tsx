import { ChevronDown, PhoneCall } from "lucide-react";
import DoctorProfileCallback from "../DoctorProfileCallback";
import DoctorProfileEnquiry from "../DoctorProfileEnquiry";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileHelp2({ doctorName, hasEnquiry, contact }: {
  doctorName: string; hasEnquiry?: boolean; contact?: string;
}) {
  return <section className={`${styles.chapter} ${styles.help}`} id="profile-help" aria-labelledby="profile-help-heading">
    <header className={styles.helpHeading}>
      <h2 id="profile-help-heading">Need help with your appointment?</h2>
      <DoctorProfileCallback doctorName={doctorName} presentation="inline" />
    </header>
    {!!contact && <a className={styles.phoneBooking} href={`tel:${contact.replace(/[^+\d]/g, "")}`}><PhoneCall size={16} aria-hidden />{contact}</a>}
    {hasEnquiry && <details className={styles.enquiryDisclosure}>
      <summary>Make an enquiry<ChevronDown size={16} aria-hidden /></summary>
      <DoctorProfileEnquiry doctorName={doctorName} embedded />
    </details>}
  </section>;
}

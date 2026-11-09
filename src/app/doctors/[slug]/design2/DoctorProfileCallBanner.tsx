import { Phone } from "lucide-react";
import styles from "./DoctorProfileCallBanner.module.css";

export default function DoctorProfileCallBanner() {
  return <a className={styles.banner} href="tel:08067506836" aria-label="Call 08067506836 to book an appointment">
    <Phone className={styles.phone} aria-hidden />
    <span className={styles.content}>
      <span className={styles.copy}>Or call to book an appointment</span>
      <span className={styles.number}>08067506836</span>
    </span>
  </a>;
}

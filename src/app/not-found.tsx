import Link from "next/link";
import { Home, Search, Calendar, Phone } from "lucide-react";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.notFoundContainer}>
      <div className={styles.notFoundCard}>
        <div className={styles.badge404}>404 — Page Not Found</div>
        <h1 className={styles.title}>Looking for care or doctors?</h1>
        <p className={styles.desc}>
          The link you navigated to may have moved, expired, or is currently under update. 
          Use our directory or fast search to find what you need.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryBtn}>
            <Home size={16} />
            <span>Go to Homepage</span>
          </Link>
          <Link href="/doctors" className={styles.secondaryBtn}>
            <Calendar size={16} />
            <span>Find Doctors</span>
          </Link>
          <Link href="/search" className={styles.secondaryBtn}>
            <Search size={16} />
            <span>Search All Services</span>
          </Link>
        </div>

        <div className={styles.helpRow}>
          <Phone size={14} color="var(--color-emergency, #ED1C24)" />
          <span>
            24x7 Emergency Assistance:{" "}
            <a href="tel:18003090309" className={styles.emergencyPhone}>
              1800-309-0309
            </a>
          </span>
        </div>
      </div>
    </main>
  );
}

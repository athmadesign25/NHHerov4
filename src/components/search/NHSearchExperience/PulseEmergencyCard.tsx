import Image from "next/image";
import { Phone, TriangleAlert } from "lucide-react";
import { NH_EMERGENCY_PHONE, NH_EMERGENCY_PHONE_LABEL } from "./pulseEmergency";
import styles from "./PulseEmergencyCard.module.css";

export default function PulseEmergencyCard() {
  return (
    <section className={styles.card} aria-label="Narayana Health emergency support">
      <div className={styles.visual} aria-hidden="true">
        <Image src="/navigation/services-ambulance.webp" alt="" fill sizes="(max-width: 640px) 85vw, 480px" />
        <span className={styles.wash} />
        <span className={styles.label}><TriangleAlert />24/7 Emergency</span>
      </div>
      <div className={styles.content}>
        <h3>Narayana Health emergency support</h3>
        <p>Call now for emergency and ambulance assistance.</p>
        <a className={styles.call} href={`tel:${NH_EMERGENCY_PHONE}`} aria-label={`Call Narayana Health emergency on ${NH_EMERGENCY_PHONE_LABEL}`}>
          <Phone aria-hidden="true" />
          <span>Call {NH_EMERGENCY_PHONE_LABEL}</span>
        </a>
      </div>
    </section>
  );
}

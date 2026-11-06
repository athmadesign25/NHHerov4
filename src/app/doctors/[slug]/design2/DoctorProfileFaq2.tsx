import { Plus } from "lucide-react";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { DoctorProfileContent } from "@/features/search/doctorProfileContent";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileFaq2({ doctor, faqs }: { doctor: DoctorListingItem; faqs: DoctorProfileContent["faqs"] }) {
  if (!faqs.length) return null;
  return <section id="profile-faq" className={styles.chapter} aria-labelledby="profile-faq-heading">
    <header className={styles.chapterHeading}><h2 id="profile-faq-heading">Frequently asked questions</h2></header>
    <div className={styles.faqs}>{faqs.map((faq, index) => <details key={faq.question} className={styles.faq} name={`doctor-${doctor.id}-faq`}>
      <summary aria-controls={`doctor-faq-answer-${index}`}>{faq.question}<Plus size={18} aria-hidden /></summary>
      <div id={`doctor-faq-answer-${index}`}><p>{faq.answer}</p></div>
    </details>)}</div>
  </section>;
}

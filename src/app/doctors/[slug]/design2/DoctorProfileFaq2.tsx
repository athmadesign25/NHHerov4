import DoctorFAQAccordion from "@/components/ui/DoctorFAQAccordion";
import faqStyles from "@/components/ui/DoctorFAQAccordion.module.css";
import type { DoctorListingItem } from "@/features/search/doctorListing";
import type { DoctorProfileContent } from "@/features/search/doctorProfileContent";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileFaq2({ doctor, faqs }: { doctor: DoctorListingItem; faqs: DoctorProfileContent["faqs"] }) {
  if (!faqs.length) return null;
  return <section id="profile-faq" className={`${styles.chapter} ${styles.faqChapter} ${faqStyles.profileSection}`} aria-labelledby="profile-faq-heading">
    <header className={faqStyles.header}><h2 id="profile-faq-heading">Frequently asked questions</h2></header>
    <DoctorFAQAccordion items={faqs} idPrefix={`doctor-${doctor.id}-faq`} />
  </section>;
}

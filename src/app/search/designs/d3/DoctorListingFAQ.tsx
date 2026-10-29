import { ChevronDown } from "lucide-react";
import styles from "./DoctorListingFAQ.module.css";

interface Props {
  speciality?: string;
  city?: string;
}

/** Native disclosures keep every answer in the initial HTML and work without JavaScript. */
export default function DoctorListingFAQ({ speciality, city }: Props) {
  const location = city ? ` in ${city}` : "";
  const questions = [
    {
      question: `How can I find and compare doctors${location}?`,
      answer: "Search by doctor name, speciality or hospital, then use the filters to narrow the list. Review each doctor’s speciality, qualifications and hospital affiliation. Open their profile or details to learn more before choosing.",
    },
    {
      question: "How do I choose the hospital for my visit?",
      answer: "Choose your city, then use the Hospital filter to find doctors at a particular hospital. Each card shows a hospital affiliation; open additional locations when available. Check the hospital shown before continuing to book.",
    },
    {
      question: "Can I choose a hospital visit or a video consultation?",
      answer: "Use the Hospital visit and Video consultation switch above the results to see the relevant consultation options. Review the appointment information on the card. If availability is not shown, use the call option to contact Narayana Health. A displayed time does not confirm a booking.",
    },
    {
      question: "How can I confirm the consultation fee?",
      answer: "A consultation fee appears on the doctor’s card when it is available. If it is missing, use the call option to check with Narayana Health. Confirm the applicable fee for your chosen doctor, hospital and consultation type before booking.",
    },
    {
      question: "What should I check before completing my booking?",
      answer: "Review the doctor’s details, consultation type, hospital for an in-person visit, and selected date and time. Check that your contact details are correct and review the appointment information before confirming.",
    },
  ];

  return <section id="doctor-listing-faq" className={styles.section} aria-labelledby="doctor-listing-faq-heading" data-d3-ui>
    <header className={styles.header}>
      <h2 id="doctor-listing-faq-heading">Before you book</h2>
      <p>{speciality ? `${speciality} appointments` : "Doctor appointments"}{location}: consultation options, locations and fees.</p>
    </header>
    <div className={styles.questions}>
      {questions.map(({ question, answer }) => <details className={styles.item} key={question}>
        <summary className={styles.question}>
          <span>{question}</span>
          <ChevronDown size={18} strokeWidth={1.75} className={styles.chevron} aria-hidden />
        </summary>
        <div className={styles.answer}><p>{answer}</p></div>
      </details>)}
    </div>
  </section>;
}

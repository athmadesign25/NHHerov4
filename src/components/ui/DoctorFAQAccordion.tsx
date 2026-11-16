import { ChevronDown } from "lucide-react";
import styles from "./DoctorFAQAccordion.module.css";

interface Props {
  items: readonly { question: string; answer: string }[];
  idPrefix: string;
}

/** Shared native disclosures keep answers accessible without JavaScript. */
export default function DoctorFAQAccordion({ items, idPrefix }: Props) {
  return <div className={styles.questions}>
    {items.map(({ question, answer }, index) => <details className={styles.item} key={question}>
      <summary className={styles.question} aria-controls={`${idPrefix}-answer-${index}`}>
        <span>{question}</span>
        <ChevronDown size={18} strokeWidth={1.75} className={styles.chevron} aria-hidden />
      </summary>
      <div id={`${idPrefix}-answer-${index}`} className={styles.answer}><p>{answer}</p></div>
    </details>)}
  </div>;
}

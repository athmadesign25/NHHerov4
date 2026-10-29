import styles from "./CardSummary.module.css";

interface Props {
  label: string;
  text: string;
  singleLine?: boolean;
  showLabel?: boolean;
}

/** Compact source text; the doctor's profile retains the complete clinical details. */
export default function CardSummary({ label, text, singleLine = false, showLabel = false }: Props) {
  return <p className={`${styles.summary} ${singleLine ? styles.credentials : styles.expertise}`}>
    <span className={showLabel ? styles.inlineLabel : styles.srOnly}>{label}: </span>{text}
  </p>;
}

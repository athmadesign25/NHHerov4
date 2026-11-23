import styles from "./DoctorProfileDesign2.module.css";

export default function ProfileSampleLabel({ show }: { show?: boolean }) {
  return show ? <span className={styles.sampleLabel} title="Illustrative content for the design preview">Sample</span> : null;
}

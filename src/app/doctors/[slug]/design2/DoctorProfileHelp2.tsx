import DoctorProfileEnquiry from "../DoctorProfileEnquiry";
import styles from "./DoctorProfileHelp2.module.css";

export default function DoctorProfileHelp2({ doctorName }: {
  doctorName: string; hasEnquiry?: boolean; contact?: string;
}) {
  return <section className={styles.banner} id="profile-help" aria-labelledby="profile-help-heading">
    <header className={styles.heading}>
      <h2 id="profile-help-heading">Need help with your appointment?</h2>
      <p>Leave your number and our team will call you to help.</p>
    </header>
    <DoctorProfileEnquiry doctorName={doctorName} embedded presentation="banner" />
  </section>;
}

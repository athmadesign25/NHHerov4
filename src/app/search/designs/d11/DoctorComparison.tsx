"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, CalendarDays, Phone, UserRound, Video } from "lucide-react";
import { nextSlot, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { design7BookingUrl } from "../d7/directory";
import styles from "./DoctorComparison.module.css";

interface Props {
  doctors: readonly DoctorListingItem[];
  mode: ConsultationMode;
  onProfile: (doctor: DoctorListingItem) => void;
}

function Portrait({ doctor }: { doctor: DoctorListingItem }) {
  const [failed, setFailed] = useState(false);
  return <div className={styles.portrait}>
    {doctor.img && !failed
      ? <Image src={doctor.img} alt={doctor.name} fill sizes="80px" className={styles.photo} onError={() => setFailed(true)} />
      : <UserRound size={30} strokeWidth={1.4} aria-label="Doctor portrait unavailable" />}
  </div>;
}

function Identity({ doctor, onProfile }: Pick<Props, "onProfile"> & { doctor: DoctorListingItem }) {
  return <div className={styles.identity}>
    <Portrait doctor={doctor} />
    <div className={styles.identityText}>
      <h3><button type="button" className={styles.name} onClick={() => onProfile(doctor)} aria-label={`View profile of ${doctor.name}`}>{doctor.name}</button></h3>
      <p className={styles.speciality}>{doctor.speciality || "Speciality not listed"}</p>
      {doctor.isExecutive && <span className={styles.executive}>Executive</span>}
    </div>
  </div>;
}

function Appointment({ doctor, mode, now }: { doctor: DoctorListingItem; mode: ConsultationMode; now: Date }) {
  const offered = doctor.modes[mode];
  const slot = offered === true ? nextSlot(doctor, mode, now) : null;
  const text = offered === null ? "Contact hospital to confirm"
    : offered === false ? "Not offered in this preview"
      : slot ? doctor.availability[mode] : "Choose a date & time";
  return <div className={styles.appointment} data-has-slot={Boolean(slot) || undefined}>
    <CalendarDays size={16} aria-hidden />
    <div>{slot && <span className={styles.slotLabel}>Preview slot</span>}<p>{text}</p></div>
  </div>;
}

function Actions({ doctor, mode, now, onProfile }: Pick<Props, "mode" | "onProfile"> & { doctor: DoctorListingItem; now: Date }) {
  return <div className={styles.actions}>
    {doctor.modes[mode] === true
      ? <Link href={design7BookingUrl(doctor, mode, now, "d11")} className={styles.book} aria-label={`Book appointment with ${doctor.name}`}>Book appointment <ArrowRight size={16} aria-hidden /></Link>
      : <a href="tel:18602080208" className={styles.book} aria-label={`Contact Narayana Health about ${doctor.name}`}>Contact hospital <Phone size={16} aria-hidden /></a>}
    <button type="button" onClick={() => onProfile(doctor)} className={styles.profile} aria-label={`View full profile of ${doctor.name}`}>View full profile <ArrowUpRight size={14} aria-hidden /></button>
  </div>;
}

export default function DoctorComparison({ doctors, mode, onProfile }: Props) {
  const comparison = useRef<HTMLElement>(null);
  const [group, setGroup] = useState(0);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const refresh = () => setNow(new Date());
    const timer = window.setInterval(refresh, 60_000);
    const resume = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", resume);
    return () => { window.clearInterval(timer); document.removeEventListener("visibilitychange", resume); };
  }, []);

  const lastGroup = Math.max(0, Math.ceil(doctors.length / 3) - 1);
  const currentGroup = Math.min(group, lastGroup);
  const start = currentGroup * 3;
  const visible = doctors.slice(start, start + 3);
  const status = doctors.length ? `Doctors ${start + 1}–${Math.min(start + 3, doctors.length)} of ${doctors.length}` : "No doctors to compare";
  const changeGroup = (next: number) => {
    setGroup(next);
    comparison.current?.scrollIntoView({ block: "start", behavior: "instant" });
  };

  if (!doctors.length) return null;

  return <section ref={comparison} className={styles.comparison} aria-label="Compare doctor profiles" data-doctor-comparison>
    <header className={styles.boardHeader}>
      <div className={styles.boardContext}><span>{mode === "hospital" ? <Building2 size={16} aria-hidden /> : <Video size={16} aria-hidden />}{mode === "hospital" ? "Hospital consultations" : "Video consultations"}</span><p role="status" aria-live="polite" aria-atomic="true">{status}</p></div>
      <nav className={styles.groupNavigation} aria-label="Doctor comparison groups">
        <button type="button" disabled={currentGroup === 0} onClick={() => changeGroup(currentGroup - 1)} aria-label="Previous group of doctors"><ArrowLeft size={16} aria-hidden /><span>Previous</span></button>
        <button type="button" disabled={currentGroup >= lastGroup} onClick={() => changeGroup(currentGroup + 1)} aria-label="Next group of doctors"><span>Next</span><ArrowRight size={16} aria-hidden /></button>
      </nav>
    </header>

    <div className={styles.desktopBoard}>
      <table className={styles.table}>
        <caption className={styles.srOnly}>Compare {visible.length} doctor profiles. Details and appointment times are for the design preview.</caption>
        <colgroup><col className={styles.labelColumn} />{visible.map((doctor) => <col key={doctor.id} />)}</colgroup>
        <thead><tr><th scope="col" className={styles.corner}><span>YOUR CARE,<br />SIDE BY SIDE</span><p>Compare the details that matter to you.</p></th>{visible.map((doctor) => <th scope="col" key={doctor.id}><Identity doctor={doctor} onProfile={onProfile} /></th>)}</tr></thead>
        <tbody>
          <tr className={styles.metricRow}><th scope="row">Experience</th>{visible.map((doctor) => <td key={doctor.id}><strong className={styles.metricValue}>{doctor.experience || "Not listed"}</strong></td>)}</tr>
          <tr className={styles.metricRow}><th scope="row">Consultation fee</th>{visible.map((doctor) => <td key={doctor.id}><strong className={styles.feeValue}>{doctor.fee || "Confirm with hospital"}</strong></td>)}</tr>
          <tr><th scope="row">Next appointment</th>{visible.map((doctor) => <td key={doctor.id}><Appointment doctor={doctor} mode={mode} now={now} /></td>)}</tr>
          <tr><th scope="row">Hospital</th>{visible.map((doctor) => <td key={doctor.id}><p className={styles.hospital}>{doctor.hospital || "Not listed"}</p>{doctor.city && !doctor.hospital.toLowerCase().includes(doctor.city.toLowerCase()) && <span className={styles.city}>{doctor.city}</span>}</td>)}</tr>
          <tr><th scope="row">Qualifications</th>{visible.map((doctor) => <td key={doctor.id}>{doctor.degrees || "Not listed"}</td>)}</tr>
          <tr><th scope="row">Languages</th>{visible.map((doctor) => <td key={doctor.id}>{doctor.languages?.length ? doctor.languages.join(", ") : "Not listed"}</td>)}</tr>
        </tbody>
        <tfoot><tr><th scope="row"><span className={styles.srOnly}>Choose a doctor</span></th>{visible.map((doctor) => <td key={doctor.id}><Actions doctor={doctor} mode={mode} now={now} onProfile={onProfile} /></td>)}</tr></tfoot>
      </table>
    </div>

    <div className={styles.mobileBoard}>
      {visible.map((doctor) => <article className={styles.mobileCard} key={doctor.id} aria-label={doctor.name}>
        <Identity doctor={doctor} onProfile={onProfile} />
        <dl className={styles.metrics}><div><dt>Experience</dt><dd className={styles.metricValue}>{doctor.experience || "Not listed"}</dd></div><div><dt>Consultation fee</dt><dd className={styles.feeValue}>{doctor.fee || "Confirm with hospital"}</dd></div></dl>
        <dl className={styles.mobileDetails}>
          <div><dt>Next appointment</dt><dd><Appointment doctor={doctor} mode={mode} now={now} /></dd></div>
          <div><dt>Hospital</dt><dd><p className={styles.hospital}>{doctor.hospital || "Not listed"}</p>{doctor.city && !doctor.hospital.toLowerCase().includes(doctor.city.toLowerCase()) && <span className={styles.city}>{doctor.city}</span>}</dd></div>
          <div><dt>Qualifications</dt><dd>{doctor.degrees || "Not listed"}</dd></div>
          <div><dt>Languages</dt><dd>{doctor.languages?.length ? doctor.languages.join(", ") : "Not listed"}</dd></div>
        </dl>
        <Actions doctor={doctor} mode={mode} now={now} onProfile={onProfile} />
      </article>)}
    </div>
    <p className={styles.note}>Sample doctor details, fees and availability. Compare options, then choose your appointment time.</p>
  </section>;
}

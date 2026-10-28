"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Clock3, MapPin, PhoneCall, UserRound, Video } from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import LoginModal from "@/features/auth/LoginModal";
import { design17ProfileUrl, getDesign17ProfileDoctor } from "@/features/search/design17Profile";
import type { Design17Variant } from "@/features/search/design17Navigation";
import type { BookingDoctorSummary } from "../types";
import { formatBookingDate } from "../format";
import PatientSelection from "./PatientSelection";
import BookingReview from "./BookingReview";
import { appointmentPricing } from "./pricing";
import PaymentDialog from "./PaymentDialog";
import useDesign17Booking from "./useDesign17Booking";
import AppointmentPicker from "./AppointmentPicker";
import styles from "./Booking.module.css";
import cardStyles from "@/app/search/designs/d17/DoctorCard.module.css";

export default function Design17BookingFlow({ doctor, design, confirmationRef }: { doctor: BookingDoctorSummary; design: Design17Variant; confirmationRef?: string }) {
  const flow = useDesign17Booking(doctor, design, confirmationRef);
  const { draft } = flow;
  const patient = draft.patients.find(item => item.id === draft.selectedPatientId)?.patient;
  const heading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(draft.stage);
  useEffect(() => {
    if (previous.current !== draft.stage) { previous.current = draft.stage; heading.current?.focus(); }
  }, [draft.stage]);
  const listingDoctor = getDesign17ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const activeDoctor = listingDoctor ? { ...doctor, hospital: listingDoctor.hospital, fee: listingDoctor.fee } : doctor;
  const pricing = appointmentPricing(activeDoctor.fee, draft.discountCode);
  const profileUrl = listingDoctor ? design17ProfileUrl(listingDoctor, draft.selection.mode, draft.selection.date, false, design, flow.returnTo) : flow.returnTo;
  const selectingAppointment = draft.stage === "patient" || draft.stage === "appointment";
  const reviewingAppointment = draft.stage === "review" || draft.stage === "payment";
  const singlePanel = reviewingAppointment || draft.stage === "confirmation" || confirmationRef !== undefined;
  const titles = { patient: "Choose your appointment", appointment: "Choose your appointment", review: "Review your appointment", payment: "Review your appointment", confirmation: "Appointment confirmed" };
  const bookAgainUrl = `/doctors/${encodeURIComponent(doctor.id)}/book?${new URLSearchParams({ design, returnTo: flow.returnTo, mode: draft.selection.mode, hospital: draft.selection.hospital })}`;

  return <div className={styles.page} data-design17-booking={design}>
    <div className={`${styles.container} ${singlePanel ? styles.reviewContainer : ""}`}>
      <Breadcrumbs theme={design === "d17-lite" ? "light" : "dark"} items={[{ label: "Home", href: "/" }, { label: "Doctors", href: flow.returnTo }, { label: doctor.name, href: profileUrl }, { label: confirmationRef !== undefined || draft.receipt ? "Confirmation" : "Book appointment" }]} />
      <header className={styles.header}><h1 ref={heading} tabIndex={-1}>{flow.missingReceipt ? "Booking details unavailable" : flow.isUserLoggedIn ? titles[draft.stage] : "Sign in to book an appointment"}</h1>

      </header>
      {!flow.loaded ? <p className={styles.loading} role="status">Preparing your appointment…</p> : <div className={`${styles.layout} ${selectingAppointment && draft.identity ? styles.appointmentLayout : ""} ${singlePanel ? styles.reviewLayout : ""}`}>

        <div className={styles.main}>
          {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
          {flow.recoveryUnavailable && <p className={styles.muted} role="status">Keep this page open to retain your booking progress.</p>}
          {!flow.isUserLoggedIn ? <section className={styles.panel}><h2>Continue with your account</h2><p className={styles.muted}>Sign in with your mobile number or email to choose a patient and appointment time.</p><button type="button" className={styles.primary} onClick={() => flow.setLoginOpen(true)}>Log in to continue <ArrowRight size={17} aria-hidden /></button><Link href={flow.returnTo} className={styles.textButton}><ArrowLeft size={16} aria-hidden />Back to doctors</Link></section>
          : flow.missingReceipt ? <section className={styles.panel}><h2>We couldn’t find this booking</h2><p className={styles.muted}>Return to the doctor list or start a new appointment.</p><Link className={styles.primary} href={bookAgainUrl}>Book again</Link><Link className={styles.textButton} href={flow.returnTo}>Back to doctors</Link></section> : <>
            {draft.failureHold && !draft.receipt && <div className={styles.hold} role="status"><Clock3 size={19} aria-hidden /><div><strong>{flow.expired ? "Your slot reservation has expired" : "Your slot is reserved after the unsuccessful payment"}</strong><p>{flow.expired ? "Choose another available time to continue." : draft.selection.mode === "hospital" ? "Complete payment or choose pay at hospital before the reservation ends." : "Complete your online payment before the reservation ends."}</p></div>{!flow.expired && <time aria-label={`${Math.floor(flow.seconds / 60)} minutes ${flow.seconds % 60} seconds remaining`}>{Math.floor(flow.seconds / 60)}:{String(flow.seconds % 60).padStart(2, "0")}</time>}{flow.expired && <button type="button" className={styles.textButton} onClick={() => flow.go("appointment")}>Choose a time</button>}</div>}
            {selectingAppointment && draft.identity && <div className={`${styles.panel} ${styles.selectionPanel}`}>
              <AppointmentPicker doctor={doctor} selection={draft.selection} now={flow.now} onSelect={flow.selectTime}>
                <PatientSelection identity={draft.identity} patients={draft.patients} selectedId={draft.selectedPatientId} onSelect={flow.selectPatient} onAdd={flow.addPatient} />
              </AppointmentPicker>
            </div>}
            {(draft.stage === "review" || draft.stage === "payment") && patient && <BookingReview doctor={activeDoctor} selection={draft.selection} patient={patient} fee={activeDoctor.fee} mode={draft.selection.mode} discountCode={draft.discountCode} busy={flow.busy} expired={flow.expired} retrying={Boolean(draft.failureHold)} onDiscount={flow.applyDiscount} onEditAppointment={() => flow.go("appointment")} onPay={payment => { void flow.submitReview(payment); }} onLater={() => { void flow.finishLater(); }} />}
            {draft.stage === "payment" && <PaymentDialog fee={pricing.total} busy={flow.busy} expired={flow.expired} onPay={() => { void flow.pay(); }} onClose={() => flow.go("review")} />}
            {draft.stage === "confirmation" && draft.receipt && <section className={`${styles.panel} ${styles.confirmation}`} aria-labelledby="d17-confirmation-title">
              <header className={styles.confirmationHeading}><div className={styles.confirmed}><Check size={26} aria-hidden /></div><div><h2 id="d17-confirmation-title">Your appointment is confirmed</h2><p className={styles.muted}>You’ll receive a confirmation email and SMS on your registered email address and mobile number.</p></div></header>
              <div className={styles.reviewDoctor}><Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt="" width={48} height={48} sizes="48px" /><div><strong>{doctor.name}</strong><p className={styles.muted}>{doctor.speciality}</p></div></div>
              <div className={styles.reviewRecap}>
                <div className={styles.reviewSlot}><CalendarDays size={17} aria-hidden /><div><span className={styles.slotLabel}>Date & time</span><strong>{formatBookingDate(draft.selection.date)} · {draft.selection.time} <span className={styles.slotTimezone}>IST</span></strong></div></div>
                {patient && <div className={styles.reviewMember}><UserRound size={17} aria-hidden /><div><span className={styles.slotLabel}>Patient</span><strong>{patient.name} <span className={styles.reviewAge}>· {patient.age} years</span></strong></div></div>}
                <p className={styles.reviewLocation}>{draft.selection.mode === "hospital" ? <MapPin size={17} aria-hidden /> : <Video size={17} aria-hidden />}<span>{draft.selection.mode === "hospital" ? draft.selection.hospital : "Video consultation"}</span></p>
              </div>
              <div className={styles.confirmationReference}><span>Payment mode</span><strong>{draft.payment === "online" ? "Paid online" : "Pay at hospital"}</strong></div>
              <div className={styles.total}><span>{draft.payment === "online" ? "Amount paid" : "Amount due at hospital"}</span><strong>{pricing.total}</strong></div>
              {draft.selection.mode === "video" && <p className={styles.muted}>Have a stable internet connection, a quiet place and your reports ready.</p>}
              {draft.payment === "hospital" && <p className={styles.muted}>Pay at reception before your consultation.</p>}
              <div className={styles.portalSupport}>
                <h3>Manage your care</h3>
                <p className={styles.muted}>Track your appointments, view your medical history and access your health records through the patient portal.</p>
                <div className={styles.confirmationActions}><Link href="/" className={styles.secondary}>Go back to home</Link><a href="https://narayana.health/phrportal" target="_blank" rel="noopener noreferrer" className={styles.primary} aria-label="Log in to patient portal (opens in a new tab)">Log in to patient portal <ArrowRight size={17} aria-hidden /></a></div>
              </div>
            </section>}
          </>}
        </div>
        {!singlePanel && <aside className={`${styles.summary} ${selectingAppointment ? "" : styles.panel}`} data-design={design} aria-label="Appointment summary">
          <div className={selectingAppointment ? `${cardStyles.card} ${styles.portraitSummary}` : styles.summaryPlain}>
          {selectingAppointment ? <>
            <div className={cardStyles.portrait}><Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt="" fill sizes="(min-width: 1024px) 450px, (min-width: 640px) 90vw, calc(100vw - 32px)" priority className={cardStyles.photo} /></div>
            <span className={cardStyles.scrim} aria-hidden />
            <div className={cardStyles.identity}><h2 className={cardStyles.name}><Link href={profileUrl} className={cardStyles.profileAction}>{doctor.name}</Link></h2><p className={cardStyles.designation}>{doctor.speciality}</p></div>
          </> : <div className={styles.identity}><Image src={doctor.img || "/images/misc/doctor_avatar_male_v2.png"} alt="" width={64} height={64} sizes="64px" /><div><Link href={profileUrl}>{doctor.name}</Link><p>{doctor.speciality}</p></div></div>}
          <div className={selectingAppointment ? `${cardStyles.body} ${styles.summaryGlass}` : styles.summaryPlain}>
          <p className={styles.detail}>{draft.selection.mode === "hospital" ? <MapPin size={17} aria-hidden /> : <Video size={17} aria-hidden />}<span>{draft.selection.mode === "hospital" ? draft.selection.hospital : "Video consultation"}</span></p>
          {selectingAppointment ? <div className={styles.selectedSlot}>
            <CalendarDays size={17} aria-hidden />
            <div><span className={styles.slotLabel}>Selected slot</span>
              <p className={styles.slotValue}><span>{formatBookingDate(draft.selection.date, "short")}</span>{draft.selection.time && <span>· {draft.selection.time}</span>}</p>
            </div>
          </div> : <p className={styles.detail}><CalendarDays size={17} aria-hidden /><span>{formatBookingDate(draft.selection.date, "short")}{draft.selection.time ? ` · ${draft.selection.time}` : ""}</span></p>}
          <div className={styles.total}><span>{pricing.hasDiscount ? "Total after discount" : "Consultation fee"}</span><strong>{pricing.total}</strong></div>
          {patient && flow.isUserLoggedIn && <p className={styles.detail}><UserRound size={17} aria-hidden /><span>{patient.name}</span></p>}
          {flow.isUserLoggedIn && selectingAppointment && !flow.missingReceipt && <div className={styles.summaryActions}>
            {(!patient || !draft.selection.time) && <p className={styles.muted}>{!patient ? "Select a member and appointment time to continue." : "Choose an available time to continue."}</p>}
            <button type="button" className={styles.primary} disabled={!patient || !draft.selection.time || flow.expired} onClick={flow.reviewAppointment}>Continue to pay <ArrowRight size={17} aria-hidden /></button>
          </div>}
          <a className={styles.contact} href="tel:18602080208"><PhoneCall size={16} aria-hidden />Call NH for help</a>
          </div>
          </div>
        </aside>}
      </div>}
      {process.env.NODE_ENV === "development" && flow.isUserLoggedIn && !draft.receipt && <details className={styles.developer}><summary>Development tools</summary><label>Next payment result<select value={flow.paymentOutcome} onChange={event => flow.setPaymentOutcome(event.target.value as "success" | "failure")}><option value="success">Successful</option><option value="failure">Failed</option></select></label>{draft.failureHold && <button type="button" className={styles.textButton} onClick={flow.expireFailureHold}>Expire failed-payment reservation</button>}</details>}
    </div>
    <LoginModal isOpen={flow.loginOpen} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.setLoginOpen(false)} manageFocus />
  </div>;
}

"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import type Lenis from "lenis";
import { Check, CalendarDays, ChevronRight, MapPin, Sparkles, UserRound, Video } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import type { BookingDoctorSummary } from "../types";
import { formatBookingDate } from "../format";
import { sameSelection } from "../design7/model";
import NewPatient from "../design15/NewPatient";
import { design20Pricing, HEALTH_CREDIT_BALANCE } from "./pricing";
import AppointmentEditor from "./AppointmentEditor";
import BenefitIcon, { SponsorMark } from "./BenefitIcon";
import BenefitsDialog from "./BenefitsDialog";
import BookingMemberPicker from "./BookingMemberPicker";
import BookingPaymentBar from "./BookingPaymentBar";
import type useDesign20Booking from "./useDesign20Booking";
import styles from "./BookingSummary.module.css";

export default function BookingSummary({ doctor, flow }: { doctor: BookingDoctorSummary; flow: ReturnType<typeof useDesign20Booking> }) {
  const { draft, busy, expired } = flow;
  const { selection } = draft;
  const id = useId();
  const reduced = useReducedMotion();
  const layoutTransition = { duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] as const };
  const paymentRowMotion = {
    layout: reduced ? false as const : "position" as const,
    initial: reduced ? false as const : { opacity: 0, y: -4 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: reduced ? 0 : -4 },
    transition: { duration: reduced ? 0 : .16, layout: layoutTransition },
  };
  const [editor, setEditor] = useState(() => !selection.time || expired);
  const [addingMember, setAddingMember] = useState(false);
  const [benefits, setBenefits] = useState<"coupon" | "sponsorship" | null>(null);
  const [couponCelebration, setCouponCelebration] = useState(0);
  const [appointmentUpdated, setAppointmentUpdated] = useState(0);
  useEffect(() => {
    if (!appointmentUpdated) return;
    const timeout = window.setTimeout(() => setAppointmentUpdated(0), 3800);
    return () => window.clearTimeout(timeout);
  }, [appointmentUpdated]);
  const [imageFailed, setImageFailed] = useState(false);
  const memberHeading = useRef<HTMLHeadingElement>(null);
  const pricing = design20Pricing(doctor.fee, draft.discountCode, draft.sponsorshipId, draft.useHealthCredits);
  const selectedMember = draft.patients.find(entry => entry.id === draft.selectedPatientId);
  const paymentDisabled = busy || expired || !selection.time || !selectedMember || Boolean(editor) || addingMember;
  const paymentFeedback = editor ? "Save your appointment changes to continue." : addingMember ? "Save the new member to continue." : expired || !selection.time ? "Choose an available time to continue." : !selectedMember ? "Select a member to continue." : undefined;
  const travel = getDesign16HospitalPreview(selection.hospital);
  const profile = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: selection.hospital }));
  const distanceKm = profile?.practiceLocations?.find(location => location.hospital === selection.hospital)?.distanceKm ?? travel?.distanceKm;
  const distanceLabel = distanceKm !== undefined ? `${distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "Get directions";
  const directionsUrl = travel?.directionsUrl ?? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(selection.hospital)}`;
  const closeEditor = () => {
    setEditor(false);
    requestAnimationFrame(() => {
      document.querySelector<HTMLHeadingElement>('[data-design17-booking="d20"] h1')?.focus({ preventScroll: true });
      const lenis = (window as Window & { __lenis?: Lenis }).__lenis;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(0, { duration: .7, immediate: Boolean(reduced) });
      } else window.scrollTo({ top: 0, behavior: reduced ? "instant" : "smooth" });
    });
  };
  const closeMemberForm = () => { setAddingMember(false); requestAnimationFrame(() => memberHeading.current?.focus()); };
  const applyCoupon = (code: string) => {
    const applied = flow.applyDiscount(code);
    if (applied) {
      if (!code) setCouponCelebration(0);
      else if (code !== draft.discountCode) setCouponCelebration(count => count + 1);
    }
    return applied;
  };

  return <><motion.section layout={!reduced} className={styles.panel} aria-label="Booking summary" initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .24, ease: [.22, 1, .36, 1], layout: layoutTransition }}>
    <motion.header layout={reduced ? false : "position"} transition={{ layout: layoutTransition }} className={styles.doctor}>
      {doctor.img && !imageFailed ? <Image src={doctor.img} alt="" width={56} height={56} sizes="56px" className={styles.doctorPhoto} onError={() => setImageFailed(true)} /> : <span className={styles.doctorPhoto}><UserRound size={24} aria-hidden /></span>}
      <div className={styles.doctorIdentity}><h2>{doctor.name}</h2><p>{doctor.speciality}</p></div>
    </motion.header>

    <motion.div layout={reduced ? false : "position"} transition={{ layout: layoutTransition }} className={styles.content}>
      <div className={styles.bookingDetails}>
        <section className={styles.section} aria-labelledby={`${id}-members`}>
          <h2 id={`${id}-members`} ref={memberHeading} tabIndex={-1}>Select member</h2>
          {addingMember && draft.identity ? <div className={styles.newMember}><NewPatient identity={draft.identity} onSave={patient => { flow.addPatient(patient); closeMemberForm(); }} onCancel={closeMemberForm} /></div>
            : <BookingMemberPicker patients={draft.patients} selectedId={draft.selectedPatientId} busy={busy} onSelect={flow.selectPatient} onAdd={() => setAddingMember(true)} />}
        </section>
        <section className={styles.section} aria-labelledby={`${id}-appointment`}>
          <div className={styles.appointmentHeading}><h2 id={`${id}-appointment`}>Your appointment</h2>
            {!editor && <button id={`${id}-appointment-edit`} type="button" className={styles.edit} disabled={busy} onClick={() => { setAppointmentUpdated(0); setEditor(true); }} aria-label="Edit appointment">Edit</button>}
          </div>
          <span className={styles.updateAnnouncement} role="status" aria-live="polite">{appointmentUpdated > 0 ? `Appointment updated. ${formatBookingDate(selection.date, "short")}, ${selection.time}.` : ""}</span>
          {editor ? <AppointmentEditor doctor={doctor} selection={selection} now={flow.now} busy={busy} onSave={next => { const changed = !sameSelection(selection, next); if (flow.saveAppointment(next)) { closeEditor(); if (changed) setAppointmentUpdated(Date.now()); } }} onCancel={closeEditor} />
            : <div className={styles.appointment}>
              <div className={`${styles.detailRow} ${styles.updatedSlot}`}>
                {appointmentUpdated > 0 && <motion.span key={appointmentUpdated} className={styles.slotHighlight} aria-hidden initial={{ opacity: reduced ? 0 : 0.7 }} animate={{ opacity: 0 }} transition={{ duration: reduced ? 0 : 1.2, ease: [.22, 1, .36, 1] }} />}
                <CalendarDays size={18} aria-hidden />
                <div><span className={styles.label}>Selected slot</span><strong className={styles.selectedSlot}>{selection.time ? <><span>{formatBookingDate(selection.date, "short")}</span><span className={styles.slotTime}><span className={styles.slotSeparator} aria-hidden>·</span>{selection.time}</span></> : "Choose a time"}</strong><div className={styles.updateFeedback} aria-hidden="true"><AnimatePresence>{appointmentUpdated > 0 && <motion.span key={appointmentUpdated} initial={{ opacity: 0, y: reduced ? 0 : 3 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .32, ease: [.22, 1, .36, 1] }}><Check size={14} aria-hidden />Appointment updated</motion.span>}</AnimatePresence></div></div>
              </div>
              <div className={styles.detailRow}>
                {selection.mode === "hospital" ? <MapPin size={18} aria-hidden /> : <Video size={18} aria-hidden />}
                <div><span className={styles.label}>{selection.mode === "hospital" ? "Hospital" : "Consultation"}</span><p className={styles.hospitalLine}>{selection.mode === "hospital" ? selection.hospital : "Video consultation"}
                  {selection.mode === "hospital" && <a className={styles.distancePill} href={directionsUrl} target="_blank" rel="noopener noreferrer" title="Get directions" aria-label={`${distanceLabel}. Get directions to ${travel?.directionsDestination ?? selection.hospital} (opens in a new tab)`}>{distanceLabel}<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" /></svg></a>}</p>
                </div>
              </div>
            </div>}
        </section>
      </div>

      <div className={styles.payment}>
        <section aria-labelledby={`${id}-benefits`}>
          <h2 id={`${id}-benefits`}>Benefits & savings</h2>
          <div className={styles.benefits}>
            <div className={`${styles.benefit} ${styles.coupon}`} data-applied={pricing.hasCoupon || undefined}>
              <button type="button" className={styles.benefitMain} disabled={busy} onClick={() => setBenefits("coupon")} aria-label={pricing.hasCoupon ? `Change coupon, ${draft.discountCode} applied` : undefined} aria-haspopup="dialog">
                <span className={styles.couponIcon} aria-hidden>
                  <motion.span key={couponCelebration} initial={!reduced && couponCelebration > 0 ? { scale: .7 } : false} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 430, damping: 14 }}>
                    <BenefitIcon kind="coupon" />
                  </motion.span>
                  {!reduced && pricing.hasCoupon && couponCelebration > 0 && <motion.span key={`sparkle-${couponCelebration}`} className={styles.couponSparkle} initial={{ opacity: 0, scale: .5, y: 3 }} animate={{ opacity: [0, 1, 0], scale: [ .5, 1.15, 1], y: [3, -3, -6] }} transition={{ duration: .85 }}><Sparkles size={16} /></motion.span>}
                </span><span><strong>{pricing.hasCoupon ? `${draft.discountCode} applied` : "Apply coupon"}</strong></span><ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{couponCelebration > 0 && pricing.hasCoupon ? `Coupon applied. You save ${pricing.couponDiscount}.` : ""}</span>
            <div className={`${styles.benefit} ${styles.sponsorship}`} data-applied={pricing.hasSponsorship || undefined}>
              <button type="button" className={styles.benefitMain} disabled={busy || !selectedMember} onClick={() => setBenefits("sponsorship")} aria-label={pricing.hasSponsorship ? `Change sponsorship, ${pricing.sponsorship?.label} applied` : undefined} aria-haspopup="dialog">
                {pricing.sponsorship ? <SponsorMark id={pricing.sponsorship.id} /> : <BenefitIcon kind="sponsorship" />}<span><strong>{pricing.sponsorship ? `${pricing.sponsorship.label} applied` : "Apply sponsorship benefit"}</strong></span><ChevronRight size={16} aria-hidden />
              </button>
            </div>
            <button type="button" role="switch" aria-checked={Boolean(draft.useHealthCredits)} aria-label={`Use ${HEALTH_CREDIT_BALANCE} health credits`} className={`${styles.benefit} ${styles.credits}`} data-applied={pricing.hasHealthCredits || undefined} disabled={busy || (!draft.useHealthCredits && pricing.amounts.total === 0)} onClick={() => flow.setUseHealthCredits(!draft.useHealthCredits)}>
              <BenefitIcon kind="credits" /><strong>{pricing.hasHealthCredits ? `${pricing.healthCreditsUsed} health credits applied` : `Use ${HEALTH_CREDIT_BALANCE} health credits`}</strong><span className={styles.switch} aria-hidden><span /></span>
            </button>
          </div>
        </section>
        <section className={styles.paymentDetails} aria-labelledby={`${id}-payment`}>
          <h2 id={`${id}-payment`}>Payment details</h2>
          <dl className={styles.breakdown}>
            <AnimatePresence initial={false} mode="popLayout">
              <motion.div key="fee" {...paymentRowMotion}><dt>Consultation fee</dt><dd>{pricing.base}</dd></motion.div>
              {pricing.hasSponsorship && <motion.div key="sponsorship" {...paymentRowMotion} className={styles.saving}><dt>Sponsorship applied</dt><dd>−{pricing.sponsorshipDiscount}</dd></motion.div>}
              {pricing.hasCoupon && <motion.div key="coupon" {...paymentRowMotion} className={styles.saving}><dt>Coupon applied</dt><dd>−{pricing.couponDiscount}</dd></motion.div>}
              {pricing.hasHealthCredits && <motion.div key="credits" {...paymentRowMotion} className={styles.saving}><dt>Health credits applied</dt><dd>−{pricing.healthCreditsDiscount}</dd></motion.div>}
              <motion.div key="total" {...paymentRowMotion} className={styles.total}><dt>Total payable</dt><dd>{pricing.total}</dd></motion.div>
            </AnimatePresence>
          </dl>
          <div className={styles.savingsFeedback}>
            <span className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{pricing.hasDiscount ? `You save ${pricing.discount}. Total payable ${pricing.total}.` : `Total payable ${pricing.total}.`}</span>
            <AnimatePresence initial={false} mode="popLayout">
              {pricing.hasDiscount && <motion.div key="savings" layout={reduced ? false : "position"} className={styles.savingsStrip} aria-hidden="true" initial={{ opacity: 0, y: reduced ? 0 : 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduced ? 0 : 2 }} transition={{ duration: reduced ? 0 : .3, ease: [.22, 1, .36, 1], layout: layoutTransition }}>
                <span>You save <span className={styles.savingsValue}><AnimatePresence initial={false}><motion.strong key={pricing.discount} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .2 }}>{pricing.discount}</motion.strong></AnimatePresence></span> on this booking</span>
                <span key={`${draft.discountCode}-${draft.sponsorshipId}-${draft.useHealthCredits}-${pricing.discount}`} className={styles.savingsShimmer} />
              </motion.div>}
            </AnimatePresence>
          </div>
        </section>
      </div>
    </motion.div>
    {benefits && <BenefitsDialog kind={benefits} fee={doctor.fee} discountCode={draft.discountCode} sponsorshipId={draft.sponsorshipId} memberName={selectedMember?.patient.name} onCoupon={applyCoupon} onSponsorship={flow.applySponsorship} onClose={() => setBenefits(null)} busy={busy} />}
  </motion.section>
    <BookingPaymentBar pricing={pricing} hospitalVisit={selection.mode === "hospital"} disabled={paymentDisabled} busy={busy} feedback={paymentFeedback} onSubmit={payment => { void flow.submitReview(payment); }} />
  </>;
}

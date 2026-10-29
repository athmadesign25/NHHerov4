"use client";

import { useEffect, useId, useRef, type ComponentProps } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { getDesign20BookingDoctor, getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { formatBookingDate } from "@/features/booking/format";
import type { BookingDoctorSummary } from "@/features/booking/types";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { design20RequestedSelection } from "@/features/booking/design20/model";
import { appointmentPricing } from "@/features/booking/design17/pricing";
import LoginModal from "@/features/auth/LoginModal";
import useDesign20Booking from "@/features/booking/design20/useDesign20Booking";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import Design17DoctorCard from "./DefaultDoctorCard";
import AppointmentSelector from "./AppointmentSelector";
import CardScrollArea from "./CardScrollArea";
import styles from "./DoctorCard.module.css";
import { cardLayoutTransition } from "./cardMotion";
import { getDesign20CardContent } from "@/features/search/design20CardContent";
import { readListingParams } from "@/features/search/doctorListing";

type Props = Omit<ComponentProps<typeof Design17DoctorCard>, "cardDesign"> & {
  cardDesign?: "d17" | "d17-lite" | "d18" | "d19" | "d20";
  active?: boolean;
  onClose?: () => void;
  initialSelection?: AppointmentSelection;
  resume?: boolean;
};
type BookingFlow = ReturnType<typeof useDesign20Booking>;

/** The browsing card defines the responsive footprint for every booking state. */
export default function DoctorCard({ active, onClose, initialSelection, resume, ...props }: Props) {
  const bookingDoctor = active ? getDesign20BookingDoctor(props.doctor.id) : null;
  const query = new URLSearchParams({ mode: props.mode, hospital: props.doctor.hospital });
  if (props.bookingDate) query.set("date", props.bookingDate);
  const booking = Boolean(active && bookingDoctor);
  const listingFilters = readListingParams(new URLSearchParams(props.listingReturnTo?.split("?")[1] ?? "")).filters;
  const cardContent = getDesign20CardContent(props.doctor, { specialties: listingFilters.specialties, focusTerms: props.focusTerms });
  return <LayoutGroup id={`d20-${props.doctor.id}`}><div className={styles.frame}>
    {/* Retain natural sizing across resizing, deep links and browser Back.
        The concealed baseline is neither interactive nor exposed to AT. */}
    <div className={styles.baseline} data-concealed={booking || undefined} aria-hidden={booking || undefined} inert={booking}>
      <Design17DoctorCard {...props} cardDesign="d20" />
    </div>
    <AnimatePresence initial={false}>{bookingDoctor && <BookingCard key="booking" doctor={{ ...bookingDoctor, name: presentationDoctorName(bookingDoctor.name), speciality: cardContent.speciality }}
    initialSelection={initialSelection ?? design20RequestedSelection(bookingDoctor, query)}
    returnTo={props.listingReturnTo ?? "/search/doctors?design=d20"} onClose={onClose ?? (() => undefined)} resume={resume} />}</AnimatePresence>
  </div></LayoutGroup>;
}

function BookingCard({ doctor, initialSelection, returnTo, onClose, resume }: {
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; onClose: () => void; resume?: boolean;
}) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, resume });
  const reduced = useReducedMotion();
  const id = useId();
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const previousPhase = useRef(flow.phase);
  const { draft } = flow;
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(selectedDoctor?.fee ?? doctor.fee, draft.discountCode);
  useEffect(() => {
    const panel = footer.current;
    const card = panel?.closest<HTMLElement>("article");
    if (!panel || !card) return;
    const header = card.querySelector("header");
    const measure = () => {
      card.style.setProperty("--summary-height", `${panel.offsetHeight}px`);
      if (header) card.style.setProperty("--booking-header-height", `${header.offsetHeight}px`);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(panel);
    if (header) observer.observe(header);
    return () => observer.disconnect();
  }, []);
  useEffect(() => { heading.current?.focus({ preventScroll: true }); }, []);
  useEffect(() => {
    const changed = previousPhase.current !== flow.phase;
    previousPhase.current = flow.phase;
    if (!changed || flow.phase !== "slots") return;
    const frame = requestAnimationFrame(() => {
      const target = content.current?.querySelector<HTMLButtonElement>('[data-d20-times] button[aria-pressed="true"]')
        ?? content.current?.querySelector<HTMLElement>('[data-d20-times] button, select, button:not(:disabled)');
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [flow.phase]);

  return <><motion.article className={styles.card} data-doctor-card data-d20-booking-card={doctor.id} data-booking-card={doctor.id} aria-labelledby={`${id}-doctor`}
    layoutId={reduced ? undefined : `d20-card-${doctor.id}`} exit={{ opacity: 0 }} transition={{ layout: cardLayoutTransition, opacity: { duration: reduced ? 0 : .16 } }}>
    <header className={`${styles.header} ${styles.textHeader}`}>
      <button type="button" className={styles.back} onClick={onClose} aria-label="Back to details" title="Back to details"><ArrowLeft size={18} aria-hidden /></button>
      <div className={styles.identity}>
        <h2 id={`${id}-doctor`} ref={heading} tabIndex={-1}><motion.span layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-name-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>{doctor.name}</motion.span></h2>
        <motion.p layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-speciality-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>{doctor.speciality}</motion.p>
      </div>
    </header>
    <CardScrollArea viewportRef={content}>
    <motion.div layoutScroll ref={content} className={styles.content} tabIndex={0} role="region" aria-label="Appointment options" data-lenis-prevent initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .16 }}>
      {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
      {!flow.loaded ? <p className={styles.hint} role="status">Finding available times…</p>
        : <AppointmentSelector doctor={doctor} selection={draft.selection} now={flow.now} onChange={flow.selectTime} />}
    </motion.div>
    </CardScrollArea>
    <motion.footer ref={footer} className={styles.footer} layoutId={reduced ? undefined : `d20-summary-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>
      <motion.div layout={reduced ? false : "position"} transition={{ layout: cardLayoutTransition }} className={styles.reassurance}>
        <div className={styles.slotSummary} aria-live="polite" aria-atomic="true"><div><span>Your appointment</span><strong>{draft.selection.time ? <><span>{formatBookingDate(draft.selection.date, "short")}</span>{" "}<span>{draft.selection.time}</span></> : "Choose a time to continue"}</strong></div></div>
      </motion.div>
      <div className={styles.paymentRow}>
      <motion.div className={styles.price} layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-fee-${doctor.id}`} transition={{ layout: cardLayoutTransition }} aria-label={`${pricing.total} onwards`}><strong>{pricing.total}</strong><span>onwards</span></motion.div>
      <motion.div className={styles.actionSlot} layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-action-${doctor.id}`} transition={{ layout: cardLayoutTransition }}><button type="button" className={styles.continue}
        disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired}
        onClick={flow.continueBooking}>
        {flow.busy ? "Continuing…" : "Continue"}<ArrowRight size={17} aria-hidden />
      </button></motion.div>
      </div>
    </motion.footer>
  </motion.article>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}

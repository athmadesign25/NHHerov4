"use client";

import SlotSelectionValue from "@/features/booking/components/SlotSelectionValue";
import { getAppointmentFee } from "@/features/booking/executiveSlots";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type ComponentProps } from "react";
import { ArrowLeft } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { BookingBackdrop, BookingFocusGlow } from "@/features/booking/components/BookingFocus";
import useBookingFocus from "@/features/booking/components/useBookingFocus";
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
import useInlineBookingSpotlight from "./useInlineBookingSpotlight";
import { duration } from "@/lib/motion";
import ExpandingDoctorBooking from "@/features/booking/designA/ExpandingDoctorBooking";
import { revealBookingSource } from "@/features/booking/designA/revealBookingSource";
import { acquireBookingHistoryLease } from "@/features/booking/designA/bookingHistoryLease";

type Props = Omit<ComponentProps<typeof Design17DoctorCard>, "cardDesign"> & {
  cardDesign?: "d17" | "d17-lite" | "d18" | "d19" | "d20";
  active?: boolean;
  onClose?: () => void;
  initialSelection?: AppointmentSelection;
  resume?: boolean;
  browsingPreview?: boolean;
  expandingPreview?: boolean;
};
type BookingFlow = ReturnType<typeof useDesign20Booking>;

/** The browsing card defines the responsive footprint for every booking state. */
export default function DoctorCard({ active, onClose, initialSelection, resume, onBook, live, browsingPreview = false, expandingPreview = false, ...props }: Props) {
  const sourceRef = useRef<HTMLDivElement>(null);
  const pendingReveal = useRef<AbortController | null>(null);
  const releaseHistory = useRef<(() => void) | null>(null);
  const returnFocusFrame = useRef(0);
  const reducedMotion = Boolean(useReducedMotion());
  const [authOpen, setAuthOpen] = useState(false);
  const [remembered, setRemembered] = useState<{ context: string; selection: AppointmentSelection } | null>(null);
  const contextParams = new URLSearchParams(props.listingReturnTo?.split("?")[1] ?? "");
  contextParams.delete("listingPreview");
  const selectionContext = JSON.stringify([props.mode, props.doctor.hospital, props.bookingDate, props.listingReturnTo?.split("?")[0], contextParams.toString()]);
  const expansionRequest = active && expandingPreview ? selectionContext : null;
  const [expansion, setExpansion] = useState({ request: expansionRequest, ready: false });
  // Reset readiness before rendering a new URL/history activation. This also
  // prevents browser Forward from reusing a prior activation's completed reveal.
  if (expansion.request !== expansionRequest) setExpansion({ request: expansionRequest, ready: false });
  const expansionReady = expansion.request === expansionRequest && expansion.ready;
  const closeRequest = useRef(onClose);
  useEffect(() => {
    if (expansionRequest) return;
    releaseHistory.current?.();
    releaseHistory.current = null;
  }, [expansionRequest]);
  useEffect(() => () => releaseHistory.current?.(), []);
  useEffect(() => { closeRequest.current = onClose; }, [onClose]);
  useEffect(() => {
    if (!expansionRequest || expansionReady || !sourceRef.current) return;
    const controller = new AbortController();
    pendingReveal.current = controller;
    const intentUrl = window.location.href;
    const started = performance.now();
    let frame = 0;
    const prepare = () => {
      if (controller.signal.aborted || !sourceRef.current) return;
      // A history change can replace another card while its return morph is
      // finishing. Wait for that surface to release its scroll/focus ownership.
      if (document.querySelector('[data-booking-focus][aria-modal="true"]')
        && performance.now() - started < (duration.slow + duration.slowest) * 1000) {
        frame = requestAnimationFrame(prepare);
        return;
      }
      void revealBookingSource(sourceRef.current, reducedMotion, controller.signal).then(ready => {
        if (controller.signal.aborted || pendingReveal.current !== controller) return;
        pendingReveal.current = null;
        if (ready) setExpansion({ request: expansionRequest, ready: true });
        else if (window.location.href === intentUrl) closeRequest.current?.();
      });
    };
    // Let browser Back/Forward restore the document before measuring its source.
    frame = requestAnimationFrame(() => { frame = requestAnimationFrame(prepare); });
    return () => { controller.abort(); cancelAnimationFrame(frame); };
  }, [expansionRequest, expansionReady, reducedMotion]);
  useEffect(() => () => cancelAnimationFrame(returnFocusFrame.current), []);
  const rememberSelection = useCallback((selection: AppointmentSelection) => {
    setRemembered({ context: selectionContext, selection });
  }, [selectionContext]);
  // Dismissing the focus treatment should not discard a changed hospital or
  // consultation mode. A new listing/filter intent still starts a fresh choice.
  const restoredSelection = remembered?.context === selectionContext ? remembered.selection : undefined;
  const bookingDoctor = active && (!expandingPreview || expansionReady) ? getDesign20BookingDoctor(props.doctor.id) : null;
  const query = new URLSearchParams({ mode: props.mode, hospital: props.doctor.hospital });
  if (props.bookingDate) query.set("date", props.bookingDate);
  const booking = Boolean(active && bookingDoctor);
  const finishExpansion = () => {
    if (!expandingPreview || booking) return;
    cancelAnimationFrame(returnFocusFrame.current);
    // The exiting surface keeps focus/scroll ownership until its unmount cleanup.
    returnFocusFrame.current = requestAnimationFrame(() => {
      if (!document.querySelector('[data-booking-focus][aria-modal="true"]')) {
        sourceRef.current?.querySelector<HTMLAnchorElement>("[data-book-doctor]")?.focus({ preventScroll: true });
      }
    });
  };
  const { active: dimRequested, highlight, start: startSpotlight } = useInlineBookingSpotlight(booking, authOpen);
  const spotlight = dimRequested && !browsingPreview && !expandingPreview;
  const openBooking: Props["onBook"] = useCallback((event, doctor, mode, includeSlot) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (!live && !expandingPreview) startSpotlight();
    if (!live && expandingPreview && !releaseHistory.current) {
      releaseHistory.current = acquireBookingHistoryLease();
    }
    // Consume the original event synchronously; the surface itself waits for
    // reveal, so clicks, direct URLs and browser return follow the same sequence.
    onBook(event, doctor, mode, includeSlot);
    // An alternate caller may consume the action without opening this doctor.
    if (new URLSearchParams(window.location.search).get("booking") !== doctor.id) {
      releaseHistory.current?.();
      releaseHistory.current = null;
    }
  }, [live, expandingPreview, startSpotlight, onBook]);
  const listingFilters = readListingParams(new URLSearchParams(props.listingReturnTo?.split("?")[1] ?? "")).filters;
  const cardContent = getDesign20CardContent(props.doctor, { specialties: listingFilters.specialties, focusTerms: props.focusTerms });
  return <LayoutGroup id={`d20-${props.doctor.id}`}>
    <BookingBackdrop inline open={spotlight} suspended={authOpen} onDismiss={onClose ?? (() => undefined)} />
    <div ref={sourceRef} className={styles.frame} data-booking-active={booking || undefined} data-booking-card={expandingPreview && booking ? props.doctor.id : undefined}>
    {/* Retain natural sizing across resizing, deep links and browser Back.
        The concealed baseline is neither interactive nor exposed to AT. */}
    <div className={styles.baseline} data-concealed={booking || undefined} aria-hidden={booking || undefined} inert={booking}>
      <Design17DoctorCard {...props} live={live} cardDesign="d20" expandFromSurface={expandingPreview} onBook={openBooking} />
    </div>
    <AnimatePresence initial={false} onExitComplete={finishExpansion}>{bookingDoctor && (expandingPreview ? <ExpandingDoctorBooking key="expanded-booking" sourceRef={sourceRef}
      doctor={{ ...bookingDoctor, name: presentationDoctorName(bookingDoctor.name), speciality: cardContent.speciality }}
      initialSelection={restoredSelection ?? initialSelection ?? design20RequestedSelection(bookingDoctor, query)}
      returnTo={props.listingReturnTo ?? "/search/doctors?design=d21"} onClose={onClose ?? (() => undefined)}
      resume={Boolean(restoredSelection) || resume} onSelectionChange={rememberSelection} /> : <BookingCard key="booking" spotlight={spotlight} highlight={highlight} doctor={{ ...bookingDoctor, name: presentationDoctorName(bookingDoctor.name), speciality: cardContent.speciality }}
    initialSelection={restoredSelection ?? initialSelection ?? design20RequestedSelection(bookingDoctor, query)}
    returnTo={props.listingReturnTo ?? "/search/doctors?design=d21"} onClose={onClose ?? (() => undefined)} resume={Boolean(restoredSelection) || resume} onAuthChange={setAuthOpen} onSelectionChange={rememberSelection} />)}</AnimatePresence>
  </div></LayoutGroup>;
}

function BookingCard({ doctor, initialSelection, returnTo, onClose, resume, onAuthChange, onSelectionChange, spotlight, highlight }: {
  spotlight: boolean;
  highlight: boolean;
  doctor: BookingDoctorSummary; initialSelection: AppointmentSelection; returnTo: string; onClose: () => void; resume?: boolean;
  onAuthChange: (open: boolean) => void;
  onSelectionChange: (selection: AppointmentSelection) => void;
}) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, resume });
  const reduced = useReducedMotion();
  const id = useId();
  const cardRef = useRef<HTMLElement>(null);
  const present = useIsPresent();
  // Once the user scrolls to compare doctors, restore background controls and
  // normal keyboard navigation while leaving this booking selection intact.
  useBookingFocus(present && spotlight, cardRef, false);
  const heading = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const footer = useRef<HTMLElement>(null);
  const previousPhase = useRef(flow.phase);
  const { draft } = flow;
  useEffect(() => { if (flow.loaded) onSelectionChange(draft.selection); }, [flow.loaded, draft.selection, onSelectionChange]);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  useEffect(() => { onAuthChange(signingIn); return () => onAuthChange(false); }, [signingIn, onAuthChange]);
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(getAppointmentFee(selectedDoctor?.fee ?? doctor.fee, draft.selection), draft.discountCode);
  useLayoutEffect(() => {
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

  return <><motion.article ref={cardRef} className={styles.card} data-booking-focus data-doctor-card data-d20-booking-card={doctor.id} data-booking-card={doctor.id} aria-labelledby={`${id}-doctor`}
    role={spotlight ? "dialog" : "region"} aria-modal={spotlight || undefined} tabIndex={-1}
    onKeyDown={event => {
      if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector(':popover-open, dialog[open], [role="dialog"][aria-modal="true"]:not([data-booking-focus])')) {
        event.preventDefault(); onClose();
      }
    }}
    exit={{ opacity: 0 }} transition={{ opacity: { duration: reduced ? 0 : duration.base } }}>
    {highlight && <BookingFocusGlow />}
    <header className={`${styles.header} ${styles.textHeader}`}>
      <button type="button" className={styles.back} onClick={onClose} aria-label="Back to details" title="Back to details"><ArrowLeft size={18} aria-hidden /></button>
      <div className={styles.identity}>
        <h2 id={`${id}-doctor`} ref={heading} tabIndex={-1}><motion.span layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-name-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>{doctor.name}</motion.span></h2>
        <motion.p layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-speciality-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>{doctor.speciality}</motion.p>
      </div>
    </header>
    <CardScrollArea viewportRef={content}>
    <motion.div layoutScroll ref={content} className={styles.content} tabIndex={0} role="region" aria-label="Appointment options" initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : duration.base }}>
      {flow.notice && <p className={styles.notice} role="status">{flow.notice}</p>}
      {/* Reserve the final selector geometry immediately while saved choices load.
          Swapping a one-line loader for these rows during projection caused a jump. */}
      <div aria-busy={!flow.loaded} inert={!flow.loaded}>
        <AppointmentSelector showHospitalDirections doctor={doctor} selection={draft.selection} now={flow.now} onChange={flow.selectTime} autoSelectFirst={flow.loaded && flow.phase === "slots" && !flow.busy && !flow.expired} />
      </div>
    </motion.div>
    </CardScrollArea>
    <motion.footer ref={footer} className={styles.footer} layoutId={reduced ? undefined : `d20-summary-${doctor.id}`} transition={{ layout: cardLayoutTransition }}>
      <motion.div layout={reduced ? false : "position"} transition={{ layout: cardLayoutTransition }} className={styles.reassurance}>
        <div className={styles.slotSummary} aria-live="polite" aria-atomic="true"><div><span>Your appointment</span><div className={styles.slotSummaryValue}><SlotSelectionValue selection={draft.selection}><strong>{draft.selection.time ? <><span>{formatBookingDate(draft.selection.date, "short")}</span>{" "}<span>{draft.selection.time}</span></> : "Choose a time to continue"}</strong></SlotSelectionValue></div></div></div>
      </motion.div>
      <div className={styles.paymentRow}>
      <motion.div className={styles.price} layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-fee-${doctor.id}`} transition={{ layout: cardLayoutTransition }} aria-label={`${pricing.total} onwards`}><strong>{pricing.total}</strong><span>onwards</span></motion.div>
      <motion.div className={styles.actionSlot} layout={reduced ? false : "position"} layoutId={reduced ? undefined : `d20-action-${doctor.id}`} transition={{ layout: cardLayoutTransition }}><button type="button" className={styles.continue}
        disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired}
        onClick={flow.continueBooking}>
        {flow.busy ? "Continuing…" : "Continue"}
      </button></motion.div>
      </div>
    </motion.footer>
  </motion.article>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={() => flow.onSignedIn()} manageFocus />
  </>;
}


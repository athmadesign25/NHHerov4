"use client";

import { getAppointmentFee } from "@/features/booking/executiveSlots";
import { useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type RefObject } from "react";
import { createPortal } from "react-dom";
import { motion, useIsPresent, useReducedMotion } from "framer-motion";
import LoginModal from "@/features/auth/LoginModal";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import AppointmentBookingPanel from "@/features/booking/components/AppointmentBookingPanel";
import { BookingBackdrop, BookingFocusGlow } from "@/features/booking/components/BookingFocus";
import useBookingFocus from "@/features/booking/components/useBookingFocus";
import useDesign20Booking from "@/features/booking/design20/useDesign20Booking";
import { appointmentPricing } from "@/features/booking/design17/pricing";
import type { BookingDoctorSummary } from "@/features/booking/types";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { duration, ease } from "@/lib/motion";
import { expandedBookingPlacement } from "./placement";
import { bookingPanelHeight } from "./sizing";
import { readBookingSourceSafeTop } from "./sourceReveal";
import { acquireBookingHistoryLease } from "./bookingHistoryLease";
import styles from "./ExpandingDoctorBooking.module.css";

interface Props {
  doctor: BookingDoctorSummary;
  initialSelection: AppointmentSelection;
  returnTo: string;
  resume?: boolean;
  sourceRef: RefObject<HTMLDivElement | null>;
  onClose: () => void;
  onSelectionChange: (selection: AppointmentSelection) => void;
}

const subscribe = () => () => undefined;
const clientSnapshot = () => true;
const serverSnapshot = () => false;

/** Design A changes only the presentation. Listing booking/history still use the existing flow. */
export default function ExpandingDoctorBooking(props: Props) {
  const mounted = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  return mounted ? <ExpandedBooking {...props} /> : null;
}

function ExpandedBooking({ doctor, initialSelection, returnTo, resume, sourceRef, onClose, onSelectionChange }: Props) {
  const flow = useDesign20Booking(doctor, { initialSelection, returnTo, inline: true, resume });
  const { draft } = flow;
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const id = useId();
  const surface = useRef<HTMLElement>(null);
  const positioner = useRef<HTMLDivElement>(null);
  const morphSurface = useRef<HTMLDivElement>(null);
  const [openingComplete, setOpeningComplete] = useState(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const priorAuth = useRef(false);
  const [contentSize, setContentSize] = useState<{ natural: number; fixed: number } | null>(null);
  const [placement, setPlacement] = useState<(ReturnType<typeof expandedBookingPlacement> & { availableHeight: number; bottomAnchored: boolean }) | null>(null);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(getAppointmentFee(selectedDoctor?.fee ?? doctor.fee, draft.selection), draft.discountCode);

  // Hold the source still until the closing surface reaches it. Releasing the
  // scroll/inert lease at exit start lets the destination move mid-transition.
  useBookingFocus(true, surface);
  useLayoutEffect(() => acquireBookingHistoryLease(), []);
  useEffect(() => { if (flow.loaded) onSelectionChange(draft.selection); }, [flow.loaded, draft.selection, onSelectionChange]);

  // Desktop expands within the grid; mobile docks to the viewport bottom.
  // Both keep the source card height as their initial baseline.
  useLayoutEffect(() => {
    if (!present) return;
    const panel = surface.current;
    const anchor = sourceRef.current;
    const shell = positioner.current;
    if (!panel || !anchor || !shell) return;
    const grid = anchor.closest<HTMLElement>("[data-doctor-results-grid]");
    const place = () => {
      const computed = getComputedStyle(shell);
      const gutter = parseFloat(computed.getPropertyValue("--booking-dock-gutter")) || 0;
      const bottomAnchored = computed.getPropertyValue("--expanded-booking-anchor").trim() === "bottom";
      const bottomInset = parseFloat(computed.bottom) || gutter;
      const viewport = { width: document.documentElement.clientWidth, height: window.visualViewport?.height ?? window.innerHeight };
      const bounds = expandedBookingPlacement(anchor.getBoundingClientRect(),
        viewport, { width: parseFloat(computed.maxWidth), height: anchor.offsetHeight }, gutter, grid?.getBoundingClientRect(),
        bottomAnchored ? { bottomInset } : undefined,
        readBookingSourceSafeTop(anchor.offsetHeight, viewport.height, gutter));
      const next = { ...bounds, bottomAnchored, availableHeight: viewport.height - gutter - (bottomAnchored ? bottomInset : bounds.top) };
      setPlacement(previous => previous && Object.keys(next).every(key => previous[key as keyof typeof next] === next[key as keyof typeof next]) ? previous : next);
    };
    // This DOM measurement must finish before first paint to avoid a visible
    // intermediate panel at the viewport corner.
    place();
    const observer = new ResizeObserver(place);
    observer.observe(anchor);
    if (grid) observer.observe(grid);
    window.addEventListener("resize", place);
    // Explicit return-navigation restoration may scroll even while the modal
    // locks ordinary scrolling. Keep its source anchor in sync with that move.
    window.addEventListener("scroll", place, { passive: true });
    window.visualViewport?.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place);
      window.visualViewport?.removeEventListener("resize", place);
    };
  }, [sourceRef, present]);

  // Measure intrinsic content, not the constrained scroll viewport (whose
  // scrollHeight cannot shrink below its clientHeight). This also handles long
  // hospital names, notices and reopening directly into video consultation.
  useLayoutEffect(() => {
    if (!present) return;
    const dialog = surface.current;
    const header = dialog?.querySelector<HTMLElement>("[data-appointment-header]");
    const scroll = dialog?.querySelector<HTMLElement>("[data-appointment-scroll]");
    const intrinsic = dialog?.querySelector<HTMLElement>("[data-appointment-intrinsic]");
    const summary = dialog?.querySelector<HTMLElement>("[data-appointment-summary]");
    if (!dialog || !header || !scroll || !intrinsic || !summary) return;
    const measure = () => {
      const computed = getComputedStyle(scroll);
      const fixed = header.offsetHeight + summary.offsetHeight
        + parseFloat(computed.paddingTop) + parseFloat(computed.paddingBottom);
      const next = { fixed, natural: fixed + intrinsic.offsetHeight };
      setContentSize(previous => previous?.natural === next.natural && previous.fixed === next.fixed ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    [header, intrinsic, summary].forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [present, draft.selection.mode, draft.selection.hospital, flow.notice, flow.loaded, placement?.width]);

  const height = placement ? bookingPanelHeight(placement.height, placement.availableHeight) : 0;
  // Text never scales with the FLIP surface. During the brief morph, clip it
  // to that surface's actual transformed bounds so controls cannot float
  // outside the expanding card. Stop sampling at rest; native popovers remain
  // unrestricted once the transition finishes.
  useLayoutEffect(() => {
    const content = surface.current;
    const background = morphSurface.current;
    if (!placement || !content || !background || reduced) return;
    let frame = 0;
    const until = performance.now() + (duration.slow + duration.moderate) * 1000;
    const radius = getComputedStyle(background).borderTopLeftRadius;
    const mask = () => {
      const bounds = background.getBoundingClientRect();
      const target = content.getBoundingClientRect();
      const top = Math.max(0, bounds.top - target.top);
      const right = Math.max(0, target.right - bounds.right);
      const bottom = Math.max(0, target.bottom - bounds.bottom);
      const left = Math.max(0, bounds.left - target.left);
      content.style.setProperty("--booking-content-clip", `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius})`);
      if (performance.now() < until) frame = requestAnimationFrame(mask);
      else if (present) content.style.removeProperty("--booking-content-clip");
    };
    frame = requestAnimationFrame(mask);
    return () => {
      cancelAnimationFrame(frame);
      content.style.removeProperty("--booking-content-clip");
    };
  }, [placement, height, present, reduced]);

  // At extreme zoom/landscape sizes even the fixed controls may exceed the
  // viewport. Fall back to one scroll surface instead of trapping controls.
  const compact = Boolean(placement && contentSize && contentSize.fixed >= height);
  const shellStyle = placement ? {
    "--expanded-booking-left": `${placement.left}px`,
    "--expanded-booking-top": `${placement.top}px`,
    "--expanded-booking-width": `${placement.width}px`,
    "--expanded-booking-height": `${height}px`,
  } as CSSProperties : undefined;

  useEffect(() => {
    if (present) heading.current?.focus({ preventScroll: true });
    // The listing restores focus after the source card is visible again.
  }, [present]);

  useEffect(() => {
    if (priorAuth.current && !signingIn) continueButton.current?.focus({ preventScroll: true });
    priorAuth.current = signingIn;
  }, [signingIn]);

  return createPortal(<>
    <div className={styles.layer} data-design-a-booking-layer>
      <BookingBackdrop open={present} suspended={signingIn} onDismiss={onClose} />
      <motion.div ref={positioner} className={styles.positioner} style={shellStyle} layoutRoot>
        {/* Grow the source card's inner booking container into this surface.
            Portraits and text remain unscaled throughout the transition. */}
        <motion.div ref={morphSurface} className={styles.surface} aria-hidden="true"
          onLayoutAnimationComplete={() => setOpeningComplete(true)}
          layoutId={reduced ? undefined : `d20-booking-surface-${doctor.id}`} layout
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ layout: { duration: reduced ? 0 : !present || !openingComplete ? duration.slow : duration.emphasis, ease: present && openingComplete ? ease.out : ease.standard }, opacity: { duration: reduced ? 0 : duration.emphasis, ease: ease.standard } }}>
          <BookingFocusGlow />
        </motion.div>
        <motion.article ref={surface} className={styles.content} data-booking-focus data-design-a-booking={doctor.id}
          data-compact={compact || undefined} inert={!present || undefined}
          role="dialog" aria-modal="true" aria-labelledby={`${id}-heading`} tabIndex={-1}
          layout={reduced ? false : "position"}
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ opacity: { duration: reduced ? 0 : present ? duration.moderate : duration.fast, delay: reduced || !present ? 0 : duration.instant, ease: ease.out }, layout: { duration: reduced ? 0 : !present || !openingComplete ? duration.slow : duration.emphasis, ease: present && openingComplete ? ease.out : ease.standard } }}
          onKeyDown={event => {
            if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector(':popover-open, dialog[open], [role="dialog"][aria-modal="true"]:not([data-booking-focus])')) {
              event.preventDefault(); onClose();
            }
          }}>
            <AppointmentBookingPanel id={id} headingRef={heading} actionRef={continueButton}
              showDoctorImage doctor={doctor} selection={draft.selection} now={flow.now} loaded={flow.loaded} notice={flow.notice}
              autoSelectFirst={flow.loaded && flow.phase === "slots" && !flow.busy && !flow.expired}
              onChange={flow.selectTime} price={pricing.total} busy={flow.busy}
              disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired}
              onContinue={flow.continueBooking} onClose={onClose} closeLabel="Back to doctor details" />
        </motion.article>
      </motion.div>
    </div>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={flow.onSignedIn} manageFocus />
  </>, document.body);
}

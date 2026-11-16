"use client";

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
  const heading = useRef<HTMLHeadingElement>(null);
  const continueButton = useRef<HTMLButtonElement>(null);
  const priorAuth = useRef(false);
  const [openingMode] = useState(initialSelection.mode);
  const [hospitalHeight, setHospitalHeight] = useState(0);
  const [placement, setPlacement] = useState<(ReturnType<typeof expandedBookingPlacement> & { availableHeight: number; bottomAnchored: boolean }) | null>(null);
  const signingIn = flow.phase === "auth" && !flow.isUserLoggedIn;
  const selectedDoctor = getDesign20ProfileDoctor(doctor.id, new URLSearchParams({ hospital: draft.selection.hospital }));
  const pricing = appointmentPricing(selectedDoctor?.fee ?? doctor.fee, draft.discountCode);

  useBookingFocus(present, surface);
  useEffect(() => { if (flow.loaded) onSelectionChange(draft.selection); }, [flow.loaded, draft.selection, onSelectionChange]);

  // Desktop expands within the grid; mobile docks to the viewport bottom.
  // Both keep the source card height as their initial baseline.
  useLayoutEffect(() => {
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
        bottomAnchored ? { bottomInset } : undefined);
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
  }, [sourceRef]);

  // Cache the hospital block and its gap. The anchored edge stays fixed when
  // switching modes; this measurement survives the hospital exit animation.
  useLayoutEffect(() => {
    if (draft.selection.mode !== "hospital") return;
    const hospital = surface.current?.querySelector<HTMLElement>("[data-appointment-hospital]");
    const selector = hospital?.closest<HTMLElement>("[data-appointment-selector]");
    if (!hospital || !selector) return;
    const measure = () => setHospitalHeight(hospital.offsetHeight + (parseFloat(getComputedStyle(selector).rowGap) || 0));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(hospital);
    return () => observer.disconnect();
  }, [draft.selection.mode, draft.selection.hospital, placement?.width]);

  const modeAdjustment = draft.selection.mode === openingMode ? 0 : draft.selection.mode === "hospital" ? hospitalHeight : -hospitalHeight;
  const shellStyle = placement ? {
    "--expanded-booking-left": `${placement.left}px`,
    "--expanded-booking-top": `${placement.top}px`,
    "--expanded-booking-width": `${placement.width}px`,
    "--expanded-booking-height": `${Math.min(placement.height + modeAdjustment, placement.availableHeight)}px`,
  } as CSSProperties : undefined;

  useEffect(() => {
    if (present) heading.current?.focus({ preventScroll: true });
    else sourceRef.current?.querySelector<HTMLAnchorElement>('[data-book-doctor]')?.focus({ preventScroll: true });
  }, [present, sourceRef]);

  useEffect(() => {
    if (priorAuth.current && !signingIn) continueButton.current?.focus({ preventScroll: true });
    priorAuth.current = signingIn;
  }, [signingIn]);

  return createPortal(<>
    <div className={styles.layer} data-design-a-booking-layer>
      <BookingBackdrop open={present} suspended={signingIn} onDismiss={onClose} />
      <motion.div ref={positioner} className={styles.positioner} style={shellStyle} layoutRoot>
        <motion.article ref={surface} className={styles.surface} data-booking-focus data-design-a-booking={doctor.id}
          role="dialog" aria-modal="true" aria-labelledby={`${id}-heading`} tabIndex={-1}
          layoutId={reduced ? undefined : `d20-card-${doctor.id}`} layout
          style={{ originX: placement?.edge === "right" ? 1 : placement?.edge === "center" ? 0.5 : 0, originY: placement?.bottomAnchored ? 1 : 0 }}
          initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          transition={{ layout: { duration: reduced ? 0 : present ? duration.slow : duration.emphasis, ease: ease.standard }, opacity: { duration: reduced ? 0 : duration.base } }}
          onKeyDown={event => {
            if (event.key === "Escape" && !event.defaultPrevented && !document.querySelector(':popover-open, dialog[open], [role="dialog"][aria-modal="true"]:not([data-booking-focus])')) {
              event.preventDefault(); onClose();
            }
          }}>
          <BookingFocusGlow />
          <motion.div className={styles.content} layout="position"
            initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : duration.moderate, delay: reduced ? 0 : duration.instant, ease: ease.out }}>
            <AppointmentBookingPanel id={id} headingRef={heading} actionRef={continueButton}
              showDoctorImage doctor={doctor} selection={draft.selection} now={flow.now} loaded={flow.loaded} notice={flow.notice}
              autoSelectFirst={flow.loaded && flow.phase === "slots" && !flow.busy && !flow.expired}
              onChange={flow.selectTime} price={pricing.total} busy={flow.busy}
              disabled={!flow.loaded || !draft.selection.time || flow.busy || flow.expired}
              onContinue={flow.continueBooking} onClose={onClose} closeLabel="Back to doctor details" />
          </motion.div>
        </motion.article>
      </motion.div>
    </div>
    <LoginModal previewOtp isOpen={signingIn} onClose={() => flow.setLoginOpen(false)} onLoginSuccess={flow.onSignedIn} manageFocus />
  </>, document.body);
}

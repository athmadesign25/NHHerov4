"use client";

import SlotSelectionValue from "@/features/booking/components/SlotSelectionValue";
import { useId, type ReactNode, type RefObject } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import AppointmentSelector from "@/app/search/designs/d20/AppointmentSelector";
import type { AppointmentSelection } from "@/features/booking/design7/model";
import { formatBookingDate } from "@/features/booking/format";
import type { BookingDoctorSummary } from "@/features/booking/types";
import { duration, ease } from "@/lib/motion";
// Both entry points intentionally share the profile's existing visual styles.
import presentation from "@/app/doctors/[slug]/DoctorProfileBooking.module.css";
import styles from "./AppointmentBookingPanel.module.css";

export interface AppointmentBookingPanelProps {
  doctor: BookingDoctorSummary;
  selection: AppointmentSelection;
  now: number;
  loaded: boolean;
  notice: string | null;
  autoSelectFirst: boolean;
  onChange: (selection: AppointmentSelection) => void;
  /** Already formatted, so pricing remains with the booking controller. */
  price: string;
  showOnwards?: boolean;
  busy: boolean;
  disabled: boolean;
  onContinue: () => void;
  onClose: () => void;
  closeLabel?: string;
  showDoctorImage?: boolean;
  id?: string;
  headingRef?: RefObject<HTMLHeadingElement | null>;
  actionRef?: RefObject<HTMLButtonElement | null>;
  editActionRef?: RefObject<HTMLButtonElement | null>;
  expanded?: boolean;
  onOpen?: () => void;
  collapsedAction?: ReactNode;
}

/** Shared presentation; availability, persistence, login and navigation stay in its owner. */
export default function AppointmentBookingPanel({
  doctor, selection, now, loaded, notice, autoSelectFirst, onChange,
  price, showOnwards = true, busy, disabled, onContinue, onClose,
  closeLabel = "Minimise appointment options",
  showDoctorImage = false,
  id, headingRef, actionRef, editActionRef, expanded = true, onOpen,
  collapsedAction,
}: AppointmentBookingPanelProps) {
  const generatedId = useId();
  const panelId = id ?? generatedId;
  const reduced = useReducedMotion();
  const showContinue = expanded || Boolean(selection.time);

  return <div className={styles.root} data-appointment-booking-panel data-expanded={expanded}>
    <AnimatePresence initial={false} mode="popLayout">
      {expanded && <motion.div key="options" id={panelId}
        className={`${presentation.panel} ${styles.panel}`} data-appointment-options layout={reduced ? false : "position"}
        initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: reduced ? 0 : duration.base, ease: ease.out, layout: { duration: reduced ? 0 : duration.emphasis, ease: ease.out } }}>
        <header className={`${presentation.header} ${showDoctorImage ? styles.doctorHeader : ""}`} data-appointment-header>
          {showDoctorImage ? <div className={styles.identity}>
            <span className={styles.portrait}><Image src={doctor.img} alt="" fill sizes="48px" /></span>
            <div className={styles.identityText}>
              <h2 id={`${panelId}-heading`} ref={headingRef} tabIndex={-1}>{doctor.name}</h2>
              {doctor.speciality && <p title={doctor.speciality}>{doctor.speciality}</p>}
            </div>
          </div> : <div><h2 id={`${panelId}-heading`} ref={headingRef} tabIndex={-1}>Choose your appointment</h2><p>{doctor.name}</p></div>}
          <button type="button" className={presentation.collapse} onClick={onClose} aria-label={closeLabel}>
            <ChevronDown className={styles.closeIcon} aria-hidden />
          </button>
        </header>
        <div className={presentation.options} data-appointment-scroll data-lenis-prevent aria-busy={!loaded || undefined}>
          <div data-appointment-intrinsic>
            {notice && <p className={presentation.notice} role="status">{notice}</p>}
            <div inert={!loaded || undefined}>
            <AppointmentSelector preserveModeHeight showHospitalDirections doctor={doctor} selection={selection}
              now={now} onChange={onChange} autoSelectFirst={loaded && autoSelectFirst} />
            </div>
          </div>
        </div>
      </motion.div>}
    </AnimatePresence>
    <motion.div layout={reduced ? false : "position"} layoutId={`${panelId}-summary`}
      className={`${presentation.summary} ${styles.summary}`} data-appointment-summary
      transition={{ layout: { duration: reduced ? 0 : duration.emphasis, ease: ease.out } }}>
      {expanded || selection.time ? <div className={presentation.selected}>
        <div className={presentation.selectionDetails}>
          <div className={`${presentation.slotLine} ${styles.slotLine}`}>
            <SlotSelectionValue selection={selection}><strong aria-live="polite" aria-atomic="true">{selection.time
              ? <>{formatBookingDate(selection.date, "short")} <span aria-hidden>·</span> {selection.time}</>
              : "Choose an available time"}</strong></SlotSelectionValue>
            {!expanded && <button ref={editActionRef} type="button" className={presentation.editSelection} onClick={onOpen}
              disabled={busy} aria-label="Edit appointment date, time and consultation details" aria-expanded={false} aria-controls={panelId}>Edit</button>}
          </div>
          {!expanded && <span>{selection.mode === "hospital" ? selection.hospital : "Video consultation"}</span>}
        </div>
      </div> : <div className={presentation.doctor}>
        <strong>{doctor.name}</strong><span>{selection.mode === "hospital" ? "Hospital visit" : "Video consultation"}</span>
      </div>}
      <div className={presentation.price}><strong>{price}</strong>{showOnwards && <span>onwards</span>}</div>
      <div className={presentation.actionGroup}>
        {!expanded && collapsedAction}
        <button ref={actionRef} type="button" className={presentation.primary}
          aria-expanded={showContinue ? undefined : false} aria-controls={showContinue ? undefined : panelId}
          disabled={showContinue && disabled} onClick={showContinue ? onContinue : onOpen}>
          <span>{showContinue ? busy ? "Continuing…" : "Continue" : "Book appointment"}</span>
        </button>
      </div>
    </motion.div>
  </div>;
}

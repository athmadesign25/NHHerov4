"use client";

import { useEffect, useId, useRef, useState, type MouseEvent, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionTemplate, useMotionValue, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight, Check, ChevronDown, History, MapPin, PhoneCall, UserRound, Zap } from "lucide-react";
import { indiaDate } from "@/features/booking/appointmentTime";
import { doctorHospitals, nextSlot, withSelectedDoctorHospital, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { design17BookingUrl } from "@/features/search/design17Booking";
import { design17ProfileUrl } from "@/features/search/design17Profile";
import CardSummary from "./CardSummary";
import styles from "./DoctorCard.module.css";

interface Props {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  live: boolean;
  priority?: boolean;
  cardDesign?: "d17" | "d17-lite" | "d18" | "d19" | "d20";
  listingReturnTo?: string;
  bookingDate?: string;
  bookedEarlier?: boolean;
  focusTerms?: string[];
  onBook: (event: MouseEvent, doctor: DoctorListingItem, mode: ConsultationMode, includeSlot: boolean) => void;
  onDetails: (doctor: DoctorListingItem) => void;
  onHospitalChange?: (hospital: string) => void;
}

function formatAppointment(slot: Date) {
  const today = new Date();
  const day = indiaDate(slot) === indiaDate(today) ? "Today" : indiaDate(slot) === indiaDate(today, 1) ? "Tomorrow"
    : slot.toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const time = slot.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toUpperCase();
  return `${day}, ${time}`;
}

/** A compact portrait card with stable comparison sections and one booking mode. */
export default function DoctorCard({ doctor, mode, live, priority = false, cardDesign = "d17", listingReturnTo, bookingDate = "", bookedEarlier = false, focusTerms = [], onBook, onHospitalChange }: Props) {
  const doc = { ...doctor, name: presentationDoctorName(doctor.name) };
  const reduced = useReducedMotion();
  const spotlightX = useMotionValue(0);
  const spotlightY = useMotionValue(0);
  const spotlightBackground = useMotionTemplate`radial-gradient(circle var(--spotlight-radius) at ${spotlightX}px ${spotlightY}px, var(--spotlight-stops))`;
  const locations = doc.practiceLocations?.length ? doc.practiceLocations.map(location => location.hospital) : doctorHospitals(doc);
  const [selectedHospital, setSelectedHospital] = useState(doc.hospital);
  const [locOpen, setLocOpen] = useState(false);
  const [locationsAbove, setLocationsAbove] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const [profileCueOpen, setProfileCueOpen] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const popId = useId();
  const nameId = useId();
  const slotId = useId();
  const activeHospital = locations.includes(selectedHospital) ? selectedHospital : locations[0] ?? "";
  const hospitalNameSplit = activeHospital.lastIndexOf(" ");
  const activePractice = doc.practiceLocations?.find(location => location.hospital === activeHospital);
  const bookingDoctor = activePractice ? {
    ...doc, hospital: activePractice.hospital, city: activePractice.city,
    availability: activePractice.availability, fee: activePractice.fee,
  } : withSelectedDoctorHospital(doc, [activeHospital]);
  const travelInfo = mode === "hospital" ? getDesign16HospitalPreview(activeHospital) : null;
  const distanceKm = mode === "hospital" ? activePractice?.distanceKm ?? (!live ? travelInfo?.distanceKm : undefined) : undefined;
  const distanceLabel = distanceKm !== undefined ? `${distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "";
  const directionsLabel = `Directions to ${travelInfo?.directionsDestination ?? activeHospital} in Google Maps (opens in a new tab)`;
  const slot = nextSlot(bookingDoctor, mode);
  const [slotDay, slotTime] = slot ? formatAppointment(slot).split(", ") : [];
  const canBook = !live && doc.modes[mode] === true;
  // The card advertises availability; login and the booking page precede slot selection.
  const url = design17BookingUrl(bookingDoctor, mode, bookingDate, new Date(), cardDesign, listingReturnTo);
  const profileDate = new URLSearchParams(url.split("?")[1]).get("date") ?? "";
  const expertise = [...new Set(doc.expertise?.filter(Boolean) ?? [])];
  const specialities = doc.speciality.split(/\s*[,|/]\s*/).filter(Boolean);
  const specificExpertise = expertise.filter(value => !specialities.some(speciality => speciality.trim().toLocaleLowerCase() === value.trim().toLocaleLowerCase()));
  const normalizedFocus = focusTerms.map(value => value.trim().toLocaleLowerCase()).filter(Boolean);
  const matchesFocus = (value: string) => normalizedFocus.some(term => value.toLocaleLowerCase().includes(term));
  const visibleExpertise = [...specificExpertise.filter(matchesFocus), ...specificExpertise.filter(value => !matchesFocus(value))].slice(0, 2);
  const experienceYears = /^(\d+(?:\.\d+)?\+?)\s*(?:years?|yrs?)?$/i.exec(doc.experience.trim())?.[1];
  const experience = experienceYears ? `${experienceYears} ${experienceYears === "1" ? "year" : "years"} experience` : doc.experience;

  useEffect(() => { setSelectedHospital(doc.hospital); setLocOpen(false); setAnnouncement(""); }, [doc.hospital]);

  useEffect(() => { setAnnouncement(""); }, [mode]);

  const moveSpotlight = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || reduced || locOpen || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    // Motion values batch visual updates without re-rendering the card on pointer movement.
    spotlightX.set(event.clientX - bounds.left);
    spotlightY.set(event.clientY - bounds.top);
  };

  useEffect(() => {
    if (!profileCueOpen) return;
    const dismiss = (event: KeyboardEvent) => {
      if (event.key === "Escape") setProfileCueOpen(false);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [profileCueOpen]);

  const chooseLocation = (hospital: string) => {
    const practice = doc.practiceLocations?.find(location => location.hospital === hospital);
    const selected = practice ? { ...doc, ...practice } : withSelectedDoctorHospital(doc, [hospital]);
    const next = nextSlot(selected, mode);
    setSelectedHospital(hospital);
    setLocOpen(false);
    setAnnouncement(`${hospital} selected. ${next ? `Next appointment ${formatAppointment(next)}.` : "Check appointment availability."} ${selected.fee ? `Consultation fee from ${selected.fee}.` : "Contact NH to confirm the fee."}`);
    onHospitalChange?.(hospital);
    locationButtonRef.current?.focus({ preventScroll: true });
  };

  const toggleLocations = () => {
    if (!locOpen && locationRef.current) {
      const rect = locationRef.current.getBoundingClientRect();
      const panelHeight = Math.min(parseFloat(getComputedStyle(locationRef.current).getPropertyValue("--sp-16")) * 2, window.innerHeight / 2);
      const toolbarBottom = document.querySelector("[data-d3-search-bar]")?.getBoundingClientRect().bottom ?? 0;
      const spaceBelow = window.innerHeight - rect.bottom;
      setLocationsAbove(spaceBelow < panelHeight && rect.top - toolbarBottom > spaceBelow);
    }
    setLocOpen(!locOpen);
  };

  useEffect(() => {
    if (!locOpen) return;
    document.getElementById(popId)?.querySelector<HTMLButtonElement>('button[aria-pressed="true"]')?.focus({ preventScroll: true });
    const pointer = (event: PointerEvent) => {
      if (!locationRef.current?.contains(event.target as Node)) setLocOpen(false);
    };
    const keyboard = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLocOpen(false);
        locationButtonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => { document.removeEventListener("pointerdown", pointer); document.removeEventListener("keydown", keyboard); };
  }, [locOpen, popId]);

  return <motion.article aria-labelledby={nameId} className={styles.card} data-doctor-card data-locations-open={locOpen || undefined}
    layoutId={cardDesign === "d19" && !reduced ? `d19-card-${doc.id}` : undefined}
    onPointerEnter={moveSpotlight} onPointerMove={moveSpotlight}
    initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, ease: [.22, 1, .36, 1] }}>
    <motion.div className={styles.portrait} layoutId={cardDesign === "d19" && !reduced ? `d19-portrait-${doc.id}` : undefined}>
      {doc.img && failedImage !== doc.img
        ? <Image src={doc.img} alt="" fill sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1199px) 48vw, (max-width: 1519px) 36vw, 408px" loading={priority ? "eager" : "lazy"} className={styles.photo} onError={() => setFailedImage(doc.img)} />
        : <div className={styles.portraitFallback}><UserRound size={64} strokeWidth={1} aria-hidden /><span>Photo unavailable</span></div>}
    </motion.div>
    <span className={styles.scrim} aria-hidden />
    <motion.span className={styles.spotlight} style={{ background: spotlightBackground }} aria-hidden />
    <header className={styles.identity}>
      {(doc.isExecutive || bookedEarlier) && <div className={styles.tags}>
        {doc.isExecutive && <span className={`${styles.tag} ${styles.tagExecutive}`}><Zap size={13} aria-hidden />Executive</span>}
        {bookedEarlier && <span className={`${styles.tag} ${styles.tagBooked}`}><History size={13} aria-hidden />Previously consulted</span>}
      </div>}
      <div className={styles.identityText}>
        <motion.h2 id={nameId} className={styles.name} aria-label={doc.name} layoutId={cardDesign === "d19" && !reduced ? `d19-name-${doc.id}` : undefined}>
          <Link href={design17ProfileUrl(bookingDoctor, mode, profileDate, live, cardDesign, listingReturnTo)} className={styles.profileAction} onClick={() => setProfileCueOpen(false)}
            onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setProfileCueOpen(true); }} onBlur={() => setProfileCueOpen(false)}
            aria-label={`View profile of ${doc.name}`}>
            <span>{doc.name}</span><span className={styles.profileCue} aria-hidden
              onPointerEnter={event => { if (event.pointerType !== "touch") setProfileCueOpen(true); }}
              onPointerLeave={event => { if (!event.currentTarget.closest("a")?.matches(":focus-visible")) setProfileCueOpen(false); }}>
              <ArrowUpRight size={20} /><span className={styles.profileCueLabel} data-visible={profileCueOpen || undefined}>View profile</span>
            </span>
          </Link>
        </motion.h2>
        <div className={styles.identityMeta}>
          <motion.p className={styles.speciality} layoutId={cardDesign === "d19" && !reduced ? `d19-speciality-${doc.id}` : undefined}>{specialities[0] || "Speciality unavailable"}{specialities.length > 1 && <span> +{specialities.length - 1}</span>}</motion.p>
          {experience && <p className={styles.experience}>{experience}</p>}
        </div>
        {doc.designation && <p className={styles.designation}>{doc.designation}</p>}
        <div className={styles.clinicalDetails}>
          {doc.degrees && <CardSummary label="Qualifications" text={doc.degrees} singleLine />}
          {visibleExpertise.length > 0 && <CardSummary label="Expertise" text={visibleExpertise.join(", ")} showLabel />}
        </div>
      </div>
    </header>
    <div className={styles.body}>
      <div className={styles.location} ref={locationRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setLocOpen(false); }}>
        <div className={styles.hospitalRow}>
          {locations.length > 1 ? <button ref={locationButtonRef} type="button" className={`${styles.hospital} ${styles.hospitalSelector}`}
            aria-expanded={locOpen} aria-controls={popId}
            aria-label={`${activeHospital}. Change hospital for ${doc.name}, ${locations.length} locations`} onClick={toggleLocations}>
            <MapPin size={16} aria-hidden /><span>{activeHospital.slice(0, hospitalNameSplit + 1)}<span className={styles.hospitalNameEnd}>{activeHospital.slice(hospitalNameSplit + 1)}<ChevronDown className={styles.hospitalChevron} size={14} aria-hidden /></span></span>
          </button> : <p className={styles.hospital}><MapPin size={16} aria-hidden /><span>{activeHospital || "Contact NH for hospital details"}</span></p>}
          {travelInfo?.directionsUrl ? <a className={styles.directions} href={travelInfo.directionsUrl} target="_blank" rel="noopener noreferrer" title={directionsLabel} aria-label={`${distanceLabel ? `${distanceLabel}. ` : ""}${directionsLabel}`}>
            {distanceLabel && <span>{distanceLabel}</span>}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" /><path d="M8.5 15v-4h7m-3-3 3 3-3 3" />
            </svg>
          </a> : distanceLabel && <span className={styles.distance}>{distanceLabel}</span>}
        </div>
        <AnimatePresence>{locOpen && <motion.div id={popId} className={`${styles.locationsPopover} ${locationsAbove ? styles.locationsAbove : ""}`} role="region" aria-label={`Practice locations for ${doc.name}`} data-lenis-prevent
          initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15 }}>
          <p>Choose hospital</p>
          <ul>{locations.map(hospital => {
            const practice = doc.practiceLocations?.find(location => location.hospital === hospital);
            const distance = mode === "hospital" ? practice?.distanceKm ?? (!live ? getDesign16HospitalPreview(hospital)?.distanceKm : undefined) : undefined;
            return <li key={hospital}><button type="button" className={styles.locationOption} aria-pressed={hospital === activeHospital} onClick={() => chooseLocation(hospital)}>
              <MapPin size={16} aria-hidden /><span>{hospital}{distance !== undefined && <span className={styles.locationHint}>{distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km</span>}</span>
              <span className={styles.locationCheck} aria-hidden>{hospital === activeHospital && <Check size={12} strokeWidth={3} />}</span>
            </button></li>;
          })}</ul>
        </motion.div>}</AnimatePresence>
      </div>
      <div className={styles.bookingGroup}>
       <div className={styles.bookingFacts}>
        <div className={styles.availability} id={slotId}>
          <span className={styles.srOnly}>{mode === "hospital" ? "Hospital visit. " : "Video consultation. "}</span>
          <span className={styles.label}>{slot ? "Next available" : "Availability"}</span>
          <span className={styles.appointmentTime}>{slot ? <><span className={styles.appointmentValue}>{slotDay},</span>{" "}<span className={styles.appointmentValue}>{slotTime}</span></> : canBook ? "Check available times" : "Contact for availability"}</span>
        </div>
        <div className={styles.fee}><span className={styles.label}>{bookingDoctor.fee ? "From" : "Fee"}</span><span className={styles.feeAmount}>{bookingDoctor.fee || "Confirm with NH"}</span></div>
       </div>
      <footer className={styles.footer}>
        {canBook ? <Link href={url} data-book-doctor={doc.id} onClick={event => onBook(event, bookingDoctor, mode, false)} className={styles.book} aria-label={`Book appointment with ${doc.name}`} aria-describedby={slotId}>Book appointment<span className={styles.bookArrow} aria-hidden><ArrowRight /><ArrowRight /></span></Link>
          : <a href="tel:18602080208" className={styles.book} aria-label={`Contact Narayana Health about ${doc.name}`}>Contact NH<ArrowRight size={17} aria-hidden /></a>}
        <a href="tel:18602080208" className={styles.call} aria-label={`Call Narayana Health about ${doc.name}`} title="Call NH"><PhoneCall size={18} aria-hidden /></a>
      </footer>
      </div>
    </div>
    <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </motion.article>;
}

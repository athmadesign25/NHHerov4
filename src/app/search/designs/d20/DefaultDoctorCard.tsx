"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check, ChevronDown, History, UserRound, Zap } from "lucide-react";
import { indiaDate } from "@/features/booking/appointmentTime";
import { doctorHospitals, readListingParams, withSelectedDoctorHospital, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import { design17BookingUrl } from "@/features/search/design17Booking";
import { design17ProfileUrl } from "@/features/search/design17Profile";
import ProfileShare from "./ProfileShare";
import ExpertiseSummary from "./ExpertiseSummary";
import SpecialitySummary from "./SpecialitySummary";
import { getDesign20Availability } from "@/features/search/design20Availability";
import { getDesign20CardContent } from "@/features/search/design20CardContent";
import { appointmentPricing } from "@/features/booking/design17/pricing";
import styles from "./DefaultDoctorCard.module.css";
import { cardLayoutTransition } from "./cardMotion";

interface Props {
  doctor: DoctorListingItem;
  mode: ConsultationMode;
  live: boolean;
  priority?: boolean;
  cardDesign?: "d17" | "d17-lite" | "d18" | "d20";
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
  return `${day}, ${time.replace(" ", "\u00a0")}`;
}

/** Essential booking information first; clinical details stay available on demand. */
export default function DoctorCard({ doctor, mode, live, priority = false, cardDesign = "d17", listingReturnTo, bookingDate = "", bookedEarlier = false, focusTerms = [], onBook, onHospitalChange }: Props) {
  const doc = { ...doctor, name: presentationDoctorName(doctor.name) };
  const reduced = useReducedMotion();
  const officialPortrait = doc.img.startsWith("/images/doctors/d20-real/");
  const thumbnailPortrait = officialPortrait && !doc.img.includes("-profile.");
  const locations = doc.practiceLocations?.length ? doc.practiceLocations.map(location => location.hospital) : doctorHospitals(doc);
  const [selectedHospital, setSelectedHospital] = useState(doc.hospital);
  const [locOpen, setLocOpen] = useState(false);
  const [locationsAbove, setLocationsAbove] = useState(false);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");
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
  const travelInfo = getDesign16HospitalPreview(activeHospital);
  const distanceKm = activePractice?.distanceKm ?? (!live ? travelInfo?.distanceKm : undefined);
  const distanceLabel = distanceKm !== undefined ? `${distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "";
  const directionsLabel = `Directions to ${travelInfo?.directionsDestination ?? activeHospital} in Google Maps (opens in a new tab)`;
  const listingFilters = readListingParams(new URLSearchParams(listingReturnTo?.split("?")[1] ?? "")).filters;
  const availabilityFilter = listingFilters.availability;
  const consultationModes = ([mode, mode === "hospital" ? "video" : "hospital"] as ConsultationMode[])
    .filter(value => doc.modes[value] !== false);
  const availability = consultationModes.map(value => ({ mode: value, slot: getDesign20Availability(bookingDoctor, value, bookingDate, availabilityFilter) }));
  const canBook = !live && doc.modes[mode] === true;
  const selectedSlot = availability.find(option => option.mode === mode)?.slot;
  const requestedDate = bookingDate || (availabilityFilter === "today" ? indiaDate(new Date()) : availabilityFilter === "tomorrow" ? indiaDate(new Date(), 1) : selectedSlot ? indiaDate(selectedSlot) : indiaDate(new Date()));
  const url = design17BookingUrl(bookingDoctor, mode, requestedDate, new Date(), cardDesign, listingReturnTo);
  const profileDate = new URLSearchParams(url.split("?")[1]).get("date") ?? "";
  const profileUrl = design17ProfileUrl(bookingDoctor, mode, profileDate, live, cardDesign, listingReturnTo);
  const content = getDesign20CardContent(doc, { specialties: listingFilters.specialties, focusTerms, languages: listingFilters.languages });
  const experienceYears = content.experienceValue?.match(/\d+(?:\.\d+)?/)?.[0];
  const hasFee = /\d/.test(bookingDoctor.fee);
  const fee = hasFee ? appointmentPricing(bookingDoctor.fee).base : "Confirm fee";

  useEffect(() => { setSelectedHospital(doc.hospital); setLocOpen(false); setAnnouncement(""); }, [doc.hospital]);

  useEffect(() => { setAnnouncement(""); }, [mode]);

  const chooseLocation = (hospital: string) => {
    const practice = doc.practiceLocations?.find(location => location.hospital === hospital);
    const selected = practice ? { ...doc, ...practice } : withSelectedDoctorHospital(doc, [hospital]);
    const next = getDesign20Availability(selected, mode, bookingDate, availabilityFilter);
    setSelectedHospital(hospital);
    setLocOpen(false);
    setAnnouncement(`${hospital} selected. ${next ? `Next appointment ${formatAppointment(next)}.` : "Check appointment availability."} ${selected.fee ? `Consultation fee ${selected.fee}.` : "Contact NH to confirm the fee."}`);
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
    layoutId={cardDesign === "d20" && !reduced ? `d20-card-${doc.id}` : undefined}
    initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, ease: [.22, 1, .36, 1] }}>
    <motion.div className={`${styles.portrait} ${officialPortrait ? styles.officialPortrait : ""} ${thumbnailPortrait ? styles.thumbnailPortrait : ""}`} layoutId={cardDesign === "d20" && !reduced ? `d20-portrait-${doc.id}` : undefined}>
      {doc.img && failedImage !== doc.img
        ? <><div className={styles.photoFrame}><Image src={doc.img} alt="" fill sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1199px) 48vw, (max-width: 1519px) 36vw, 408px" loading={priority ? "eager" : "lazy"} className={styles.photo} onError={() => setFailedImage(doc.img)} /></div>
          {thumbnailPortrait && <Image src={doc.img} alt="" fill sizes="(max-width: 639px) 100vw, 408px" className={styles.photoAmbient} aria-hidden />}</>
        : <div className={styles.portraitFallback}><UserRound size={64} strokeWidth={1} aria-hidden /><span>Photo unavailable</span></div>}
    </motion.div>
    <span className={styles.scrim} aria-hidden />
    <ProfileShare className={styles.share} doctorName={doc.name} profileUrl={profileUrl} />
    <header className={styles.identity}>
      {(doc.isExecutive || bookedEarlier) && <div className={styles.tags}>
        {doc.isExecutive && <span className={`${styles.tag} ${styles.tagExecutive}`}><Zap size={13} aria-hidden />Executive</span>}
        {bookedEarlier && <span className={`${styles.tag} ${styles.tagBooked}`}><History size={13} aria-hidden />Previously consulted</span>}
      </div>}
      <div className={styles.identityText}>
        <h2 id={nameId} className={styles.name} aria-label={doc.name}>
          <motion.span layout={reduced ? false : "position"} layoutId={cardDesign === "d20" && !reduced ? `d20-name-${doc.id}` : undefined} transition={{ layout: cardLayoutTransition }}>{doc.name}</motion.span>
        </h2>
        {(content.speciality || content.experienceValue) && <div className={styles.identityMeta}>
          {content.speciality && <SpecialitySummary text={content.speciality}
            layoutId={cardDesign === "d20" && !reduced ? `d20-speciality-${doc.id}` : undefined} />}
          {experienceYears && <span className={styles.experience} aria-label={`${experienceYears}+ years ${content.experienceLabel}`}>
            {content.speciality && <span className={styles.metaSeparator} aria-hidden>·</span>}
            <strong>{experienceYears}+ yrs</strong>
          </span>}
        </div>}
        <ExpertiseSummary terms={content.fullExpertise} />
        {content.language && <p className={styles.languageMatch}>Speaks {content.language}</p>}
        <Link href={profileUrl} className={styles.profileLink} aria-label={`View profile of ${doc.name}`}>View profile <ArrowRight size={14} aria-hidden /></Link>
      </div>
    </header>
    <motion.div className={styles.body} layoutId={cardDesign === "d20" && !reduced ? `d20-summary-${doc.id}` : undefined} transition={{ layout: cardLayoutTransition }}>
      <div className={styles.location} ref={locationRef} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setLocOpen(false); }}>
        <div className={styles.hospitalRow}>
          {locations.length > 1 ? <button ref={locationButtonRef} type="button" className={`${styles.hospital} ${styles.hospitalSelector}`}
            aria-expanded={locOpen} aria-controls={popId}
            aria-label={`${activeHospital}. Change hospital for ${doc.name}, ${locations.length} locations`} onClick={toggleLocations}>
            <Image src="/icons/doctor-card/location.svg" alt="" width={16} height={16} className={styles.locationIcon} /><span>{activeHospital.slice(0, hospitalNameSplit + 1)}<span className={styles.hospitalNameEnd}>{activeHospital.slice(hospitalNameSplit + 1)}{" "}<span className={styles.moreLocations} aria-hidden>· +{locations.length - 1} more<ChevronDown className={styles.hospitalChevron} size={14} aria-hidden /></span></span></span>
          </button> : <p className={styles.hospital}><Image src="/icons/doctor-card/location.svg" alt="" width={16} height={16} className={styles.locationIcon} /><span>{activeHospital || "Contact NH for hospital details"}</span></p>}
          {travelInfo?.directionsUrl ? <a className={styles.directions} href={travelInfo.directionsUrl} target="_blank" rel="noopener noreferrer" title="Get directions" aria-label={`${distanceLabel ? `${distanceLabel}. ` : ""}${directionsLabel}`}>
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
              <Image src="/icons/doctor-card/location.svg" alt="" width={16} height={16} className={styles.locationIcon} /><span>{hospital}{distance !== undefined && <span className={styles.locationHint}>{distance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km</span>}</span>
              <span className={styles.locationCheck} aria-hidden>{hospital === activeHospital && <Check size={12} strokeWidth={3} />}</span>
            </button></li>;
          })}</ul>
        </motion.div>}</AnimatePresence>
      </div>
      <div className={styles.bookingGroup}>
        <div className={styles.availability} id={slotId}>
          <p className={styles.availabilityLabel}><Image src="/icons/doctor-card/slot.svg" alt="" width={16} height={16} />Next available at</p>
          <div className={styles.consultationOptions} role="list" aria-label={`Next availability for ${doc.name}`}>
            {availability.map(option => {
              const label = option.mode === "hospital" ? "Hospital" : "Video";
              const time = option.slot ? formatAppointment(option.slot) : doc.modes[option.mode] === true ? (availabilityFilter === "week" && !bookingDate ? "No slots this week" : bookingDate || availabilityFilter !== "any" ? "No slots for this date" : "Check availability") : "Contact hospital";
              return <div key={option.mode} className={styles.consultationOption} role="listitem" title={`${label}: ${time}`}>
                <Image src={`/icons/doctor-card/${option.mode}.svg`} alt="" width={16} height={16} className={styles.consultationIcon} /><span className={styles.srOnly}>{label}: </span>
                <span className={styles.appointmentTime}>{time}</span>
              </div>;
            })}
          </div>
        </div>
        <footer className={styles.footer}>
          <motion.div layout={reduced ? false : "position"} layoutId={cardDesign === "d20" && !reduced ? `d20-fee-${doc.id}` : undefined} transition={{ layout: cardLayoutTransition }} className={styles.fee} aria-label={`${fee}${hasFee ? " onwards" : ""}`}><span className={styles.feeAmount}>{fee}</span>{hasFee && <span className={styles.label}>onwards</span>}</motion.div>
          <motion.div className={styles.bookSlot} layout={reduced ? false : "position"} layoutId={cardDesign === "d20" && !reduced ? `d20-action-${doc.id}` : undefined} transition={{ layout: cardLayoutTransition }}>
            {canBook ? <Link href={url} data-book-doctor={doc.id} onClick={event => onBook(event, bookingDoctor, mode, false)} className={styles.book} aria-label={`Book appointment with ${doc.name}`} aria-describedby={slotId}><span className={styles.bookContent}>Book appointment<span className={styles.bookArrow} aria-hidden><ArrowRight /><ArrowRight /></span></span></Link>
            : <a href="tel:18602080208" className={styles.book} aria-label={`Contact hospital about ${doc.name}`}><span className={styles.bookContent}>Contact hospital<ArrowRight size={17} aria-hidden /></span></a>}
          </motion.div>
        </footer>
      </div>
    </motion.div>
    <p className={styles.srOnly} role="status" aria-live="polite" aria-atomic="true">{announcement}</p>
  </motion.article>;
}

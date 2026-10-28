"use client";

import { useEffect, useId, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Building2, Check, ChevronDown, History, MapPin, PhoneCall, UserRound, Video } from "lucide-react";
import { indiaDate } from "@/features/booking/appointmentTime";
import { bookingUrl, doctorHospitals, nextSlot, withSelectedDoctorHospital, type ConsultationMode, type DoctorListingItem } from "@/features/search/doctorListing";
import { getDesign3CityDoctor } from "@/features/search/design3CityDoctors";
import { presentationDoctorName } from "@/features/design-preview/presentationCopy";
import { getDesign16HospitalPreview } from "@/features/search/design16HospitalPreview";
import styles from "./DoctorCard.module.css";

interface Props {
  doctor: DoctorListingItem;
  previewVariant?: "d6" | "d16";
  mode: ConsultationMode;
  live: boolean;
  bookedEarlier?: boolean;
  demoBookedEarlier?: boolean;
  onBook: (event: MouseEvent, doctor: DoctorListingItem, mode: ConsultationMode, includeSlot: boolean) => void;
  onDetails: (doctor: DoctorListingItem) => void;
  onHospitalChange?: (hospital: string) => void;
}

function formatAppointment(slot: Date) {
  const today = new Date();
  const day = indiaDate(slot) === indiaDate(today) ? "Today" : indiaDate(slot) === indiaDate(today, 1) ? "Tomorrow"
    : slot.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "Asia/Kolkata" });
  const time = slot.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "Asia/Kolkata" }).toUpperCase();
  return `${day}, ${time}`;
}

/** Design 6: full-bleed portraits, gradient identity and a frosted details panel. */
export default function DoctorCard({ doctor, previewVariant = "d6", mode, live, bookedEarlier = false, demoBookedEarlier = false, onBook, onDetails, onHospitalChange }: Props) {
  const doc = previewVariant === "d16" ? { ...doctor, name: presentationDoctorName(doctor.name) } : doctor;
  const reduced = useReducedMotion();
  const detailsOnly = live || Boolean(getDesign3CityDoctor(doc.id));
  const practiceLocations = previewVariant === "d16" ? doc.practiceLocations : undefined;
  const locations = practiceLocations?.length ? practiceLocations.map(location => location.hospital) : doctorHospitals(doc);
  const specialities = doc.speciality.split(/\s*[,|/]\s*/).filter(Boolean);
  const [locOpen, setLocOpen] = useState(false);
  const [locationsAbove, setLocationsAbove] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState(doc.hospital);
  const [failedImage, setFailedImage] = useState<string | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const locationButtonRef = useRef<HTMLButtonElement>(null);
  const popId = useId();
  const nameId = useId();
  const slotId = useId();
  const offeredModes = (["hospital", "video"] as const).filter(value => doc.modes[value] === true);
  const bookingMode = mode;
  const activeHospital = locations.includes(selectedHospital) ? selectedHospital : locations[0] ?? "";
  const activePractice = practiceLocations?.find(location => location.hospital === activeHospital);
  const bookingDoctor = activePractice ? {
    ...doc, hospital: activePractice.hospital, city: activePractice.city,
    availability: activePractice.availability, fee: activePractice.fee,
  } : withSelectedDoctorHospital(doc, [activeHospital]);
  const travelInfo = previewVariant === "d16" && mode === "hospital" ? getDesign16HospitalPreview(activeHospital) : null;
  const distanceKm = mode === "hospital" ? activePractice?.distanceKm ?? (!live ? travelInfo?.distanceKm : undefined) : undefined;
  const distanceLabel = distanceKm !== undefined ? `${distanceKm.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km` : "";
  const directionsLabel = `Directions to ${travelInfo?.directionsDestination ?? activeHospital} in Google Maps (opens in a new tab)`;
  const slot = nextSlot(bookingDoctor, bookingMode);
  const url = `${bookingUrl(bookingDoctor, bookingMode, Boolean(slot))}&design=${previewVariant}`;
  const expertise = [...new Set(doc.expertise?.filter(Boolean) ?? [])];
  const profileLabel = "View profile";
  const experienceYears = /^(\d+(?:\.\d+)?\+?)\s*(?:years?|yrs?)?$/i.exec(doc.experience.trim())?.[1];
  const bookingTagDescription = bookedEarlier ? "Saved booking in this preview session" : "Preview example for stakeholder demonstration";

  // A hospital filter takes precedence over the card’s local location choice.
  useEffect(() => { setSelectedHospital(doc.hospital); setLocOpen(false); }, [doc.hospital]);

  const chooseLocation = (hospital: string, fromPopover = false) => {
    setSelectedHospital(hospital);
    setLocOpen(false);
    onHospitalChange?.(hospital);
    if (fromPopover) locationButtonRef.current?.focus({ preventScroll: true });
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
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
    };
  }, [locOpen, popId]);

  const profileContent = <><span>{doc.name}</span><span className={styles.profileCue}><ArrowUpRight size={20} aria-hidden /></span></>;
  return <motion.article aria-labelledby={nameId} className={styles.card} data-doctor-card data-locations-open={locOpen || undefined}
    initial={reduced ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .25, ease: [.22, 1, .36, 1] }}>
    <div className={styles.portrait}>
      {doc.img && failedImage !== doc.img
        ? <Image src={doc.img} alt="" fill sizes="(max-width: 639px) 96vw, (max-width: 1023px) 48vw, (max-width: 1439px) 35vw, 28vw" loading="lazy" className={styles.photo} onError={() => setFailedImage(doc.img)} />
        : <div className={styles.portraitFallback}><UserRound size={80} strokeWidth={1} aria-hidden /><span>Photo unavailable</span></div>}
    </div>
    <span className={styles.scrim} aria-hidden />
    <header className={styles.identity}>
      {(doc.isExecutive || bookedEarlier || demoBookedEarlier) && <div className={styles.tags}>
        {(bookedEarlier || demoBookedEarlier) && <span className={`${styles.tag} ${styles.tagBooked}`} title={bookingTagDescription}><History size={13} aria-hidden />Booked earlier<span className={styles.srOnly}> — {bookingTagDescription}</span></span>}
        {doc.isExecutive && <span className={`${styles.tag} ${styles.tagExecutive}`}>Executive</span>}
      </div>}
      <div className={styles.identityText}>
        <h2 id={nameId} className={styles.name} aria-label={doc.name}>
          {detailsOnly
            ? <button type="button" className={styles.profileAction} onClick={() => onDetails(doc)} aria-label={`${profileLabel} of ${doc.name}`}>{profileContent}</button>
            : <Link className={styles.profileAction} href={`/doctors/${encodeURIComponent(doc.id)}?design=${previewVariant}`} aria-label={`${profileLabel} of ${doc.name}`}>{profileContent}</Link>}
        </h2>
        <div className={styles.speciality}>
          <span>{specialities[0] || "Speciality unavailable"}</span>
          {specialities.length > 1 && <button type="button" className={styles.moreSpecialities} onClick={() => onDetails(doc)} aria-label={`View all ${specialities.length} specialities for ${doc.name}`}>+{specialities.length - 1}</button>}
        </div>
        <p className={styles.experience}>
          {experienceYears ? <><strong>{experienceYears}</strong> {experienceYears === "1" ? "year" : "years"} of experience</> : doc.experience || "Experience not provided"}
        </p>
      </div>
    </header>
    <div className={styles.body}>
      <dl className={styles.clinicalDetails}>
        <div><dt className={styles.srOnly}>Qualifications</dt><dd>{doc.degrees || "Qualifications not provided"}</dd></div>
        <div className={styles.expertise}><dt>Expertise</dt><dd>{expertise.length ? expertise.join(" · ") : "Not provided"}</dd></div>
      </dl>
      <div className={styles.location} ref={locationRef} onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setLocOpen(false);
      }}>
        <div className={styles.srOnly}>Location</div>
        <div className={styles.locationSummary}>
          <p className={styles.singleLocation}><MapPin size={16} aria-hidden /><span>{activeHospital || "Hospital information unavailable"}</span></p>
          {locations.length > 1 && <button ref={locationButtonRef} type="button" className={styles.moreLocations} aria-expanded={locOpen} aria-controls={popId}
            aria-label={`Show ${locations.length - 1} more practice locations for ${doc.name}`} onClick={toggleLocations}>
            +{locations.length - 1}<ChevronDown size={14} aria-hidden />
          </button>}
        </div>
        {(distanceKm !== undefined || travelInfo?.directionsUrl) && <div className={styles.travelDetails}>
          {travelInfo?.directionsUrl ? <a className={styles.directions} href={travelInfo.directionsUrl} target="_blank" rel="noopener noreferrer"
            title={directionsLabel} aria-label={`${distanceLabel ? `${distanceLabel}. ` : ""}${directionsLabel}`}>
            {distanceLabel && <span className={styles.distance}>{distanceLabel}</span>}
            <svg className={styles.directionsIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
              <path d="m10.6 2.6-8 8a2 2 0 0 0 0 2.8l8 8a2 2 0 0 0 2.8 0l8-8a2 2 0 0 0 0-2.8l-8-8a2 2 0 0 0-2.8 0Z" />
              <path d="M8.5 15v-4h7m-3-3 3 3-3 3" />
            </svg>
          </a> : <span className={styles.distance}>{distanceLabel}</span>}
        </div>}
        <AnimatePresence>
          {locOpen && <motion.div id={popId} className={`${styles.locationsPopover} ${locationsAbove ? styles.locationsAbove : ""}`} role="region" aria-label={`Practice locations for ${doc.name}`} data-lenis-prevent
            initial={reduced ? false : { opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : .15 }}>
            <p>Select a location</p>
            <ul>{locations.map(hospital => {
              const locationDistance = previewVariant === "d16" && mode === "hospital"
                ? practiceLocations?.find(location => location.hospital === hospital)?.distanceKm ?? (!live ? getDesign16HospitalPreview(hospital)?.distanceKm : undefined)
                : undefined;
              return <li key={hospital}>
                <button type="button" className={styles.locationOption} aria-pressed={hospital === activeHospital} onClick={() => chooseLocation(hospital, true)}>
                  <MapPin size={16} aria-hidden /><span>{hospital}
                    {locationDistance !== undefined && <span className={styles.locationDistance}>{locationDistance.toLocaleString("en-IN", { maximumFractionDigits: 1 })} km</span>}
                  </span>
                  <span className={styles.locationCheck} aria-hidden>{hospital === activeHospital && <Check size={12} strokeWidth={3} />}</span>
                </button>
              </li>;
            })}</ul>
          </motion.div>}
        </AnimatePresence>
      </div>
      <dl className={styles.availability} id={slotId} aria-label={`Next available appointments for ${doc.name}`}>
        {offeredModes.length ? offeredModes.map(value => {
          const ModeIcon = value === "hospital" ? Building2 : Video;
          const label = value === "hospital" ? "Hospital visit" : "Video consultation";
          const availableSlot = nextSlot(bookingDoctor, value);
          return <div key={value} className={styles.consultationInfo}>
            <dt className={styles.mode}><ModeIcon size={16} aria-hidden /><span>{label}</span></dt>
            <dd className={styles.appointmentTime} data-available={Boolean(availableSlot) || undefined}>{availableSlot ? previewVariant === "d16" ? formatAppointment(availableSlot) : doc.availability[value]?.replace(/, 0(\d:\d\d)/, ", $1") : "Times not listed"}</dd>
          </div>;
        }) : <div className={styles.availabilityUnknown}><dt>Consultation availability</dt><dd>Contact NH for appointment times</dd></div>}
      </dl>
      <footer className={styles.footer}>
        <div className={styles.fee}>
          {bookingDoctor.fee ? <><span className={styles.feeAmount}>{bookingDoctor.fee}</span><span className={styles.feeCaption}>onwards</span></>
            : <><span className={styles.feeUnknown}>Confirm fee</span><span className={styles.feeCaption}>with NH</span></>}
        </div>
        <a href="tel:18602080208" className={styles.call} aria-label={`Call Narayana Health about ${doc.name}`}><PhoneCall size={18} aria-hidden /></a>
        {live || offeredModes.length === 0 ? <button type="button" onClick={() => onDetails(doc)} className={styles.book} aria-haspopup="dialog" aria-label={`Book Appointment with ${doc.name}: contact NH`}>Book appointment</button>
          : <Link href={url} onClick={(event) => onBook(event, bookingDoctor, bookingMode, Boolean(nextSlot(bookingDoctor, bookingMode)))} className={styles.book} aria-label={`Book Appointment with ${doc.name}`} aria-describedby={slotId}>Book appointment</Link>}
      </footer>
    </div>
  </motion.article>;
}

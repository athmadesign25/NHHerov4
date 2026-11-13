"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useIsPresent } from "framer-motion";
import { ArrowLeft, ChevronRight, ChevronDown, MapPin, User, TriangleAlert, Search } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import { duration, ease } from "@/lib/motion";
import { DESKTOP_NAV_ITEMS } from "./menu-data";
import EditorialMegaMenu from "./EditorialMegaMenu";
import { HOSPITAL_LOCALITIES as HOSPITAL_CITIES } from "./hospital-data";
import { DOCTOR_CONDITIONS } from "./doctor-conditions";
import { DOCTOR_SPECIALTIES } from "./doctor-specialties";
import ServicesMegaMenu from "./ServicesMegaMenu";
import { doctorNavUrl } from "@/features/search/navigationEntries";
import { mobileMenuLabel } from "./mobile-menu-label";
import patterns from "./MobileMenuPatterns.module.css";
import styles from "./MobileMegaMenu.module.css";
import AccountMenu, { type AccountMember } from "../AccountMenu";

type Page = "main" | "find-a-doctor" | "hospitals" | "specialities" | "health-library" | "about-us" | "specialty" | "city" | "condition" | "sunday" | "today";
const titles: Record<Page, string> = {
  main: "How can we help?", "find-a-doctor": "Find a doctor", hospitals: "Find hospital", specialities: "Services",
  "health-library": "Health library", "about-us": "About us",
  specialty: "Find a doctor by specialty", city: "Find a doctor by location", condition: "Find a doctor by disease / condition",
  sunday: "Find a doctor available on Sunday", today: "Find a doctor available today",
};
const descriptions = ["By specialty, city or condition", "Explore our hospitals by city", "Specialist care, tests and more", "Articles, stories and videos", "Our people and our purpose"];
const doctorChoices: { page: Page; label: string }[] = [
  { page: "specialty", label: "By specialty" }, { page: "city", label: "By location" },
  { page: "condition", label: "By disease / condition" }, { page: "sunday", label: "Doctors available on Sunday" },
  { page: "today", label: "Doctors available today" },
];

interface MobileMegaMenuProps {
  onClose: () => void;
  onLogin: () => void;
  isLoggedIn: boolean;
  memberId: string;
  members?: AccountMember[];
  memberLocked?: boolean;
  onMemberChange: (id: string) => void;
  onLogout: () => void;
}

export default function MobileMegaMenu({ onClose, onLogin, isLoggedIn, memberId, members, memberLocked, onMemberChange, onLogout }: MobileMegaMenuProps) {
  const [history, setHistory] = useState<Page[]>(["main"]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const page = history[history.length - 1];
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const panel = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const go = (next: Page) => { setDirection(1); setQuery(""); setCity(null); setHistory([...history, next]); };
  const back = () => { setDirection(-1); setQuery(""); setCity(null); setHistory(history.slice(0, -1)); };

  useEffect(() => {
    if (!present) return;
    const nav = panel.current?.closest("nav");
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const keydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); onClose(); return; }
      if (event.key !== "Tab" || !nav) return;
      const elements = [...nav.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),input,[tabindex="0"]')].filter(e => e.getClientRects().length && !e.closest('[inert]'));
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && (document.activeElement === first || document.activeElement === title.current)) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener("keydown", keydown);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", keydown); nav?.querySelector<HTMLButtonElement>('[aria-controls="mobile-navigation-menu"]')?.focus(); };
  }, [onClose, present]);
  useEffect(() => { title.current?.focus({ preventScroll: true }); panel.current?.scrollTo(0, 0); }, [page]);

  const availability = page === "sunday" || page === "today";
  const directory = page === "hospitals" || availability;
  const searchable = page === "specialty" || page === "city" || page === "condition" || directory;
  const labels = page === "specialty" ? DOCTOR_SPECIALTIES.flat().sort() : page === "condition" ? DOCTOR_CONDITIONS : HOSPITAL_CITIES.map(c => c.city);
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());
  const cities = HOSPITAL_CITIES.filter(c => matches(c.city) || c.hospitals.some(h => matches(h.label)));
  const availabilityQuery = page === "sunday" ? "Doctors available on Sunday" : "Doctors available today";
  // Keep the demo's booking filters, matching the desktop availability links.
  const availabilityHref = (cityName?: string) => {
    const target = new URL(doctorNavUrl(page === "sunday" ? "sunday" : "today"), "https://nh.local");
    if (cityName) target.searchParams.set("location", cityName);
    return `${target.pathname}?${target.searchParams}`;
  };
  const searchPlaceholder = directory ? "Search city or locality" : `Search ${page === "specialty" ? "specialties" : page === "condition" ? "conditions" : "cities"}`;

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out }} className={styles.menu} inert={!present} id="mobile-navigation-menu" data-lenis-prevent>
    <div className={styles.location}><MapPin aria-hidden="true" /><span>Bangalore</span></div>
    <div className={styles.actions}>
      <div className={styles.contactActions}>
        <a href="tel:18003090309" className={styles.callUs}><PhoneCall animate aria-hidden="true" />Call us</a>
        <Link href="/emergency" onClick={onClose} className={styles.emergency}><TriangleAlert aria-hidden="true" />Emergency</Link>
      </div>
    </div>
    <div className={styles.heading}>
      {page !== "main" && <button type="button" className={styles.back} onClick={back} aria-label="Back to previous menu"><ArrowLeft aria-hidden="true" /></button>}
      <h2 ref={title} tabIndex={-1} id="mobile-menu-title">{titles[page]}</h2>
    </div>
    {searchable && <label className={styles.search}><Search aria-hidden="true" /><input aria-label={searchPlaceholder} placeholder={searchPlaceholder} value={query} onChange={e => setQuery(e.target.value)} /></label>}
    <div className={styles.scroll} ref={panel}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div key={page} custom={direction} variants={{ enter: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * 20 }), show: { opacity: 1, x: 0 }, exit: (d: number) => ({ opacity: 0, x: reduced ? 0 : d * -20 }) }} initial="enter" animate="show" exit="exit" transition={{ duration: reduced ? 0 : duration.base, ease: ease.out }}>
          {page === "main" && <ul className={`${styles.list} ${styles.rootList}`}>
            {DESKTOP_NAV_ITEMS.map((item, index) => <li key={item.id}><button className={styles.mainRow} onClick={() => go(item.id)}><span><strong>{titles[item.id]}</strong><small>{descriptions[index]}</small></span><ChevronRight aria-hidden="true" /></button></li>)}
          </ul>}
          {page === "find-a-doctor" && <ul className={`${styles.list} ${patterns.surface}`}>
            {doctorChoices.map(item => <li key={item.page}><button className={styles.row} onClick={() => go(item.page)}>{item.label}<ChevronRight aria-hidden="true" /></button></li>)}
          </ul>}
          {(page === "specialty" || page === "city" || page === "condition") && <>
            {labels.some(matches) ? <ul className={patterns.surface}>
              {labels.filter(matches).map(label => <li key={label}><Link className={patterns.link} href={doctorNavUrl(page === "specialty" ? "specialty" : page === "city" ? "location" : "condition", label)} onClick={onClose}>{page === "city" ? label : mobileMenuLabel(label)}</Link></li>)}
            </ul> : <p className={styles.empty}>No matches. Try another name.</p>}
            <Link href={doctorNavUrl()} onClick={onClose} className={styles.viewAll}>View all {page === "specialty" ? "specialties" : "doctors"}</Link>
          </>}
          {directory && <>
            <ul className={styles.list} aria-label={availability ? `${availabilityQuery} by city and locality` : "Hospitals by city and locality"}>
              {cities.map(c => {
                const expanded = city === c.slug || !!query.trim();
                return <li key={c.slug}>
                  <button className={styles.row} aria-expanded={expanded} aria-controls={`mobile-${page}-${c.slug}`} onClick={() => setCity(city === c.slug ? null : c.slug)}>{c.city}<ChevronDown className={expanded ? styles.rotated : undefined} aria-hidden="true" /></button>
                  {expanded && <ul className={patterns.surface} id={`mobile-${page}-${c.slug}`}>
                    {c.hospitals.filter(h => matches(c.city) || matches(h.label)).map(h => <li key={h.label}><Link className={patterns.link} href={availability ? availabilityHref(c.city) : h.href} onClick={onClose}>{h.label}</Link></li>)}
                  </ul>}
                </li>;
              })}
            </ul>
            {!cities.length && <p className={styles.empty}>No matches. Try another city or locality.</p>}
            <Link className={styles.viewAll} href={availability ? availabilityHref() : "https://www.narayanahealth.org/hospitals-clinics"} onClick={onClose}>{availability ? (page === "sunday" ? "View all doctors available on Sunday" : "View all doctors available today") : "View all hospitals & clinics"}</Link>
          </>}
          {page === "specialities" && <ServicesMegaMenu onNavigate={onClose} mobile />}
          {(page === "health-library" || page === "about-us") && <EditorialMegaMenu kind={page} onNavigate={onClose} mobile />}
        </motion.div>
      </AnimatePresence>
    </div>
    {isLoggedIn ? <AccountMenu mobile tone="dark" memberId={memberId} members={members} memberLocked={memberLocked} onMemberChange={onMemberChange} onLogout={onLogout} onNavigate={onClose} /> : <button type="button" onClick={onLogin} className={styles.login}><User aria-hidden="true" />Login</button>}
  </motion.div>;
}

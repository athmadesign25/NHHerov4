"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion, useIsPresent } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronRight, ChevronDown, MapPin, User, TriangleAlert, Search } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import { duration, ease } from "@/lib/motion";
import { DESKTOP_NAV_ITEMS, OTHER_MENU_GROUPS } from "./menu-data";
import { HOSPITAL_LOCALITIES as HOSPITAL_CITIES } from "./hospital-data";
import { DOCTOR_CONDITIONS } from "./doctor-conditions";
import { DOCTOR_SPECIALTIES } from "./doctor-specialties";
import { SERVICE_CENTRES, SERVICE_TILES } from "./service-menu-data";
import styles from "./MobileMegaMenu.module.css";

type Page = "main" | "find-a-doctor" | "hospitals" | "specialities" | "health-library" | "about-us" | "specialty" | "city" | "condition" | "sunday" | "today";
const titles: Record<Page, string> = { main: "How can we help?", "find-a-doctor": "Find a Doctor", hospitals: "Find Hospital", specialities: "Services", "health-library": "Health Library", "about-us": "About Us", specialty: "By specialty", city: "By location", condition: "By disease / condition", sunday: "Doctors available on Sunday", today: "Doctors available today" };
const descriptions = ["By specialty, city or condition", "Explore our hospitals by city", "Specialist care, tests and more", "Articles, stories and videos", "Our people and our purpose"];
const doctorChoices: { page: Page; label: string }[] = [{page:"specialty",label:"By specialty"},{page:"city",label:"By location"},{page:"condition",label:"By disease / condition"},{page:"sunday",label:"Doctors available on Sunday"},{page:"today",label:"Doctors available today"}];

export default function MobileMegaMenu({ onClose, onLogin }: { onClose: () => void; onLogin: () => void }) {
  const [history, setHistory] = useState<Page[]>(["main"]);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState<string | null>(null);
  const [direction, setDirection] = useState(1);
  const page = history[history.length - 1];
  const reduced = useReducedMotion();
  const present = useIsPresent();
  const panel = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const go = (next: Page) => { setDirection(1); setQuery(""); setHistory([...history, next]); };
  const back = () => { setDirection(-1); setQuery(""); setHistory(history.slice(0, -1)); };

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

  const searchable = page === "specialty" || page === "city" || page === "condition" || page === "hospitals";
  const labels = page === "specialty" ? DOCTOR_SPECIALTIES.flat().sort() : page === "condition" ? DOCTOR_CONDITIONS : HOSPITAL_CITIES.map(c => c.city);
  const matches = (text: string) => text.toLowerCase().includes(query.trim().toLowerCase());

  return <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:reduced?0:duration.emphasis,ease:ease.out}} className={styles.menu} inert={!present} id="mobile-navigation-menu" data-lenis-prevent>
    <div className={styles.location}><MapPin aria-hidden="true" /><span>Bangalore</span></div>
    <div className={styles.actions}>
      <div className={styles.primaryActions}>
        <a href="tel:18003090309" className={styles.emergency}><TriangleAlert aria-hidden="true" />24/7 Emergency</a>
      </div>
      <div className={styles.secondaryActions}>
        <a href="tel:18003090309"><PhoneCall animate />Call Us</a>
      </div>
    </div>
    <div className={styles.heading}>
      {page !== "main" && <button type="button" className={styles.back} onClick={back} aria-label="Back to previous menu"><ArrowLeft aria-hidden="true" /></button>}
      <h2 ref={title} tabIndex={-1} id="mobile-menu-title">{titles[page]}</h2>
    </div>
    {searchable && <label className={styles.search}><Search aria-hidden="true" /><input aria-label={`Search ${titles[page]}`} placeholder={page === "hospitals" ? "Search city or hospital" : `Search ${page === "specialty" ? "specialties" : page === "condition" ? "conditions" : "cities"}`} value={query} onChange={e => setQuery(e.target.value)} /></label>}
    <div className={styles.scroll} ref={panel}>
      <AnimatePresence initial={false} mode="wait" custom={direction}>
        <motion.div key={page} custom={direction} variants={{enter:(d:number)=>({opacity:0,x:reduced?0:d*20}),show:{opacity:1,x:0},exit:(d:number)=>({opacity:0,x:reduced?0:d*-20})}} initial="enter" animate="show" exit="exit" transition={{duration:reduced?0:duration.base,ease:ease.out}}>
          {page === "main" && <>
            <ul className={`${styles.list} ${styles.rootList}`}>{DESKTOP_NAV_ITEMS.map((item,index)=><li key={item.id}><button className={styles.mainRow} onClick={()=>go(item.id)}><span><strong>{item.label}</strong><small>{descriptions[index]}</small></span><ChevronRight aria-hidden="true" /></button></li>)}</ul>
          </>}
          {page === "find-a-doctor" && <><div className={styles.feature}><Image src="/nav-doctor-speciality.png" alt="Doctor consulting a patient" fill sizes="100vw"/><span>Find the right care<br/>for you.</span></div><ul className={styles.list}>{doctorChoices.map(item=><li key={item.page}><button className={styles.row} onClick={()=>go(item.page)}>{item.label}<ChevronRight aria-hidden="true" /></button></li>)}</ul></>}
          {(page === "specialty" || page === "city" || page === "condition") && <><ul className={styles.list}>{labels.filter(matches).map(label=><li key={label}><Link className={styles.row} href={`/search?q=${encodeURIComponent(label)}`} onClick={onClose}>{label}<ChevronRight aria-hidden="true" /></Link></li>)}</ul>{!labels.some(matches)&&<p className={styles.empty}>No matches. Try another name.</p>}<Link href={page==="specialty"?"/specialities":"/search"} onClick={onClose} className={styles.viewAll}>View all {page==="specialty"?"specialties":"doctors"}<ArrowUpRight aria-hidden="true" /></Link></>}
          {page === "hospitals" && <><ul className={styles.list}>{HOSPITAL_CITIES.filter(c=>matches(c.city)||c.hospitals.some(h=>matches(h.label))).map(c=><li key={c.slug}><button className={styles.row} aria-expanded={city===c.slug||!!query.trim()} aria-controls={`mobile-hospitals-${c.slug}`} onClick={()=>setCity(city===c.slug?null:c.slug)}>{c.city}<ChevronDown className={city===c.slug?styles.rotated:undefined} aria-hidden="true" /></button>{(city===c.slug||!!query.trim())&&<ul className={styles.nested} id={`mobile-hospitals-${c.slug}`}>{c.hospitals.filter(h=>matches(c.city)||matches(h.label)).map(h=><li key={h.label}><Link href={h.href} onClick={onClose}>{h.label}<ArrowUpRight aria-hidden="true" /></Link></li>)}</ul>}</li>)}</ul>{!HOSPITAL_CITIES.some(c=>matches(c.city)||c.hospitals.some(h=>matches(h.label)))&&<p className={styles.empty}>No matches. Try another city or hospital.</p>}<Link className={styles.viewAll} href="/hospitals" onClick={onClose}>View all hospitals & clinics<ArrowUpRight aria-hidden="true" /></Link></>}
          {page === "specialities" && <><details className={styles.centres}><summary>Centres of Excellence<ChevronDown aria-hidden="true" /></summary><ul className={styles.nested}>{SERVICE_CENTRES.map(c=><li key={c.href}><Link href={c.href} onClick={onClose}>{c.label}<ChevronRight aria-hidden="true" /></Link></li>)}</ul><Link href="/specialities" onClick={onClose} className={styles.viewAll}>View all centres<ArrowUpRight aria-hidden="true" /></Link></details><div className={styles.tiles}>{SERVICE_TILES.map(s=><Link href={s.href} key={s.label} onClick={onClose} className={styles.tile}><div><Image src={s.image} alt="" fill sizes="50vw"/></div><span>{s.label}<ArrowUpRight aria-hidden="true" /></span></Link>)}</div></>}
          {(page==="health-library"||page==="about-us")&&<ul className={styles.list}>{OTHER_MENU_GROUPS[page].flatMap(g=>g.links).map(l=><li key={l.href}><Link href={l.href} onClick={onClose} className={styles.row}>{l.label}<ChevronRight aria-hidden="true" /></Link></li>)}</ul>}
          {(page==="sunday"||page==="today")&&<p className={styles.empty}>need content</p>}
        </motion.div>
      </AnimatePresence>
    </div>
    <button type="button" onClick={onLogin} className={styles.login}><User aria-hidden="true" />Login</button>
  </motion.div>;
}

"use client";

import { useState, type KeyboardEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import styles from "./DoctorMegaMenu.module.css";
import DoctorLocations from "./DoctorLocations";
import DoctorAvailabilityMenu from "./DoctorAvailabilityMenu";
import { DOCTOR_SPECIALTIES as specialties } from "./doctor-specialties";
import { DOCTOR_CONDITIONS } from "./doctor-conditions";

const splitColumns = (items: string[]) => {
  const length = Math.ceil(items.length / 3);
  return Array.from({ length: 3 }, (_, index) => items.slice(index * length, (index + 1) * length));
};
const sections = [
  { id: "speciality", label: "Find Doctor By Speciality", columns: specialties, viewAll: "View All Specialities", href: "/specialities" },
  { id: "location", label: "Find Doctor By Location", columns: [], viewAll: "View All Doctors", href: "/doctors" },
  { id: "condition", label: "Find Doctor By Disease/Condition", columns: splitColumns(DOCTOR_CONDITIONS), viewAll: "Look up a condition or disease", href: "/search" },
  { id: "sunday", label: "Doctors Available on Sunday", columns: [], viewAll: "", href: "/doctors" },
  { id: "today", label: "Doctors Available Today", columns: [], viewAll: "", href: "/doctors" },
];

export default function DoctorMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const [selected, setSelected] = useState(0);
  const section = sections[selected];
  const handleKeys = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = event.key === "ArrowDown" ? (index + 1) % sections.length
      : event.key === "ArrowUp" ? (index + sections.length - 1) % sections.length
      : event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    setSelected(next);
    const tabs = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    tabs?.[next]?.focus();
  };
  const itemHref = (label: string) => `/search?q=${encodeURIComponent(label)}`;
  const isAvailability = section.id === "sunday" || section.id === "today";
  const isLocation = section.id === "location";
  const isCondition = section.id === "condition";
  const openConditionSearch = () => {
    onNavigate();
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } })));
  };

  return (
    <div className={styles.menu}>
      <div className={styles.rail} role="tablist" aria-label="Find a doctor by" aria-orientation="vertical">
        {sections.map((item, index) => (
          <button key={item.id} id={`doctor-menu-tab-${item.id}`} type="button" role="tab"
            aria-selected={selected === index} aria-controls="doctor-menu-panel" tabIndex={selected === index ? 0 : -1}
            className={styles.tab} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)} onKeyDown={(event) => handleKeys(event, index)}>
            {item.id === "condition" ? <>Find Doctor By <span>Disease/Condition</span></> : <span>{item.label}</span>}
          </button>
        ))}
      </div>
      <div className={`${styles.panel} ${isLocation || isAvailability ? styles.singlePanel : ""} ${isAvailability ? styles.availabilityPanel : ""} ${isCondition ? styles.conditionPanel : ""}`} id="doctor-menu-panel" role="tabpanel" aria-labelledby={`doctor-menu-tab-${section.id}`}>
        {isLocation ? <DoctorLocations onNavigate={onNavigate} /> : isAvailability ? (
          <DoctorAvailabilityMenu availability={section.id === "sunday" ? "sunday" : "today"} onNavigate={onNavigate} />
        ) : <>
          <div className={styles.imageWrap}>
            <Image src={section.id === "speciality" ? "/nav-doctor-speciality.png" : "/bento-patient-first.jpg"} alt={section.id === "speciality" ? "A doctor speaking with a patient during a consultation" : "Patient-first support and compassionate care"} fill sizes="(min-width: 1600px) 28vw, 24vw" className={styles.image} />
          </div>
          <ul className={styles.columns}>
            {section.columns.flat().map(label => <li key={label}><Link href={itemHref(label)} title={label} className={styles.item} onClick={onNavigate}><strong>{label.charAt(0)}</strong>{label.slice(1)}</Link></li>)}
          </ul>
          {!isCondition && <Link href={section.href} className={styles.viewAll} onClick={onNavigate}>{section.viewAll}</Link>}
          {isCondition && <button type="button" className={styles.conditionSearch} onClick={openConditionSearch}><Search aria-hidden="true" />Look up a condition or disease</button>}
        </>}
      </div>
    </div>
  );
}

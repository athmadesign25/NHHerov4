"use client";

import { useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { doctorNavUrl } from "@/features/search/navigationEntries";
import { Search } from "lucide-react";
import styles from "./DoctorMegaMenu.module.css";
import DoctorLocations from "./DoctorLocations";
import DoctorAvailabilityMenu from "./DoctorAvailabilityMenu";
import { DOCTOR_SPECIALTIES as specialties } from "./doctor-specialties";
import { DOCTOR_CONDITIONS } from "./doctor-conditions";
import MenuAction from "./MenuAction";
import MenuImageCard from "./MenuImageCard";
import patterns from "./MegaMenuPatterns.module.css";

const splitColumns = (items: string[]) => {
  const length = Math.ceil(items.length / 3);
  return Array.from({ length: 3 }, (_, index) => items.slice(index * length, (index + 1) * length));
};
const sections = [
  { id: "speciality", label: "Find Doctor By Speciality", columns: specialties, viewAll: "View All Specialties", href: "/specialities" },
  { id: "location", label: "Find Doctor By Location", columns: [], viewAll: "View All Doctors", href: "/doctors" },
  { id: "condition", label: "Find Doctor By Disease/Condition", columns: splitColumns(DOCTOR_CONDITIONS), viewAll: "Search a condition or disease", href: "/search" },
  { id: "sunday", label: "Doctors Available on Sunday", columns: [], viewAll: "", href: "/doctors" },
  { id: "today", label: "Doctors Available Today", columns: [], viewAll: "", href: "/doctors" },
];

export default function DoctorMegaMenu({ onNavigate }: { onNavigate: () => void }) {
  const router = useRouter();
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
  const itemHref = (label: string) => doctorNavUrl(section.id === "speciality" ? "specialty" : "condition", label);
  const isAvailability = section.id === "sunday" || section.id === "today";
  const isLocation = section.id === "location";
  const isCondition = section.id === "condition";
  const openConditionSearch = () => {
    onNavigate();
    if (!/^\/(?:L[12]banner)?\/?$/.test(window.location.pathname)) {
      router.push(doctorNavUrl("condition"));
      return;
    }
    requestAnimationFrame(() => window.dispatchEvent(new CustomEvent("nh:open-search", { detail: { scrollY: window.scrollY } })));
  };

  return (
    <div className={patterns.submenu}>
      <div className={patterns.rail} role="tablist" aria-label="Find a doctor by" aria-orientation="vertical">
        {sections.map((item, index) => (
          <button key={item.id} id={`doctor-menu-tab-${item.id}`} type="button" role="tab"
            aria-selected={selected === index} aria-controls="doctor-menu-panel" tabIndex={selected === index ? 0 : -1}
            className={patterns.tab} onMouseEnter={() => setSelected(index)} onFocus={() => setSelected(index)}
            onClick={() => setSelected(index)} onKeyDown={(event) => handleKeys(event, index)}>
            {item.id === "condition" ? <>Find Doctor By <span>Disease/Condition</span></> : <span>{item.label}</span>}
          </button>
        ))}
      </div>
      <div className={`${patterns.panel} ${styles.panel} ${isLocation || isAvailability ? styles.singlePanel : ""} ${isCondition ? styles.conditionPanel : ""}`} id="doctor-menu-panel" role="tabpanel" aria-labelledby={`doctor-menu-tab-${section.id}`}>
        {isLocation ? <DoctorLocations onNavigate={onNavigate} /> : isAvailability ? (
          <DoctorAvailabilityMenu availability={section.id === "sunday" ? "sunday" : "today"} onNavigate={onNavigate} />
        ) : <>
          <MenuImageCard title="Find a Doctor" description={isCondition ? "By disease or condition" : "By specialty"} image={isCondition ? "/patient-first-support.png" : "/navigation/portraits/specialty-doctor-v4.webp"} imageSizes="(min-width: 1100px) 1000px, 100vw" alt={isCondition ? "A heart-care specialist explaining an anatomical heart to a patient" : "Woman specialist doctor in a naturally lit hospital consultation room"} portrait className={styles.imageCard} />
          <ul className={styles.columns}>
            {section.columns.flat().map(label => <li key={label}><Link href={itemHref(label)} title={label} className={styles.item} onClick={onNavigate}><span><strong>{label.charAt(0)}</strong>{label.slice(1)}</span></Link></li>)}
          </ul>
          <div className={styles.footer}>
            {isCondition
              ? <MenuAction label={section.viewAll} context={section.viewAll} icon={<Search aria-hidden="true" />} onClick={openConditionSearch} />
              : <MenuAction label={section.viewAll} href={doctorNavUrl()} context={section.viewAll} onClick={onNavigate} />}
          </div>
        </>}
      </div>
    </div>
  );
}

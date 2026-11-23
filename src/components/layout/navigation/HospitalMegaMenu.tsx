"use client";

import { useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { FACILITY_CITIES, getFacilitiesForCity, type Facility } from "@/lib/data/facilities";
import mobilePatterns from "./MobileMenuPatterns.module.css";
import styles from "./HospitalMegaMenu.module.css";

// The four marks the network holds, each with its own artwork in
// /public/accreditations. "JCI Enterprise" was reusing the JCI seal, so this is
// back to NABL — the same four this menu carried before.
const accreditations = [
  { label: "JCI Accredited", lines: ["JCI", "Accredited"], logo: "/accreditations/jci-new.png" },
  { label: "NABH Certified Nursing Services", lines: ["NABH Certified", "Nursing Services"], logo: "/accreditations/nabh-new.png" },
  { label: "NABL Accredited Laboratories", lines: ["NABL Accredited", "Laboratories"], logo: "/accreditations/nabl-new.png" },
  { label: "CAP Accredited", lines: ["CAP", "Accredited"], logo: "/accreditations/cap-clean.png" },
];

const COLUMN_COUNT = 5;

// Approximate rendered height of a city block in px, used only to decide where
// the columns break. Constants mirror the stylesheet: city title, type tag,
// gap between units, facility row, gap after the city.
function cityWeight(city: string) {
  const facilities = getFacilitiesForCity(city);
  const types = (["hospital", "clinic"] as const).filter(type => facilities.some(facility => facility.type === type));
  return 28 + types.length * 25 + (types.length - 1) * 12 + facilities.length * 22 + 20;
}

// Spread the cities over the columns so each one ends at roughly the same
// height, keeping them in order so the list still reads down then across.
function balanceColumns(cities: readonly string[]) {
  const weights = cities.map(cityWeight);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const columns: string[][] = [];
  let current: string[] = [];
  let filled = 0;
  let placed = 0;

  cities.forEach((city, index) => {
    const weight = weights[index];
    const remaining = COLUMN_COUNT - columns.length;
    const target = (total - placed) / remaining;
    // Break when taking this city overshoots the target by more than leaving
    // it for the next column would undershoot it.
    if (current.length && remaining > 1 && filled + weight - target > target - filled) {
      columns.push(current);
      placed += filled;
      current = [];
      filled = 0;
    }
    current.push(city);
    filled += weight;
  });

  columns.push(current);
  while (columns.length < COLUMN_COUNT) columns.push([]);
  return columns;
}

function FacilityGroups({ city, onNavigate }: {
  city: string; onNavigate: () => void;
}) {
  const id = useId();
  const facilities = getFacilitiesForCity(city);
  const groups = (["hospital", "clinic"] as const)
    .map(type => ({ type, facilities: facilities.filter(facility => facility.type === type) }))
    .filter(group => group.facilities.length);

  // One label per type, always singular, so every city tag reads the same.
  const label = (type: Facility["type"]) => (type === "hospital" ? "Hospital" : "Clinic");
  return <div className={styles.typeGroups}>
    {groups.map(group => <section key={group.type} aria-labelledby={`${id}-${group.type}`}>
      <h4 id={`${id}-${group.type}`} className={styles.typeHeading}>{label(group.type)}</h4>
      <ul className={styles.facilityList} aria-label={`${city} ${label(group.type).toLowerCase()}s`}>
        {group.facilities.map(facility => <li key={facility.id}>
          <Link href={facility.href} className={styles.facilityLink} onClick={onNavigate}
            title={facility.suffix ? `${facility.locality} · ${facility.suffix}` : facility.locality}>
            <span>{facility.locality}</span>
            {facility.suffix && <span className={styles.suffix}>{" · "}{facility.suffix}</span>}
          </Link>
        </li>)}
      </ul>
    </section>)}
  </div>;
}

function HospitalAccreditationBand() {
  return <section className={styles.band} aria-label="Accreditations">
    <ul className={styles.badges}>
      {accreditations.map(badge => <li key={badge.label} className={styles.accreditation}>
        <span className={styles.badgeIcon}>
          <Image src={badge.logo} alt={badge.label} width={32} height={32} sizes="32px" loading="eager" />
        </span>
        {/* The mark already carries the name, so the stacked caption is decorative. */}
        <span className={styles.badgeLabel} aria-hidden="true">
          {badge.lines.map(line => <span key={line}>{line}</span>)}
        </span>
      </li>)}
    </ul>
  </section>;
}

export default function HospitalMegaMenu({ onNavigate, mobile = false, detectedCity }: {
  onNavigate: () => void; mobile?: boolean; detectedCity?: string;
}) {
  const id = useId();
  const defaultCity = FACILITY_CITIES.find(city => city.toLowerCase() === detectedCity?.trim().toLowerCase()) ?? "Bangalore";
  const [expanded, setExpanded] = useState<string | null>(defaultCity);
  const mobileCities = [defaultCity, ...FACILITY_CITIES.filter(city => city !== defaultCity)];

  if (mobile) return <div className={styles.mobile} data-hospital-menu>
    {mobileCities.map((city, index) => <section key={city} className={styles.mobileCity}>
      <h3 className={mobilePatterns.heading}><button type="button" className={mobilePatterns.toggle}
        aria-expanded={expanded === city} aria-controls={`${id}-mobile-${index}`}
        onClick={() => setExpanded(expanded === city ? null : city)}>
        {city}<ChevronDown aria-hidden="true" />
      </button></h3>
      <div id={`${id}-mobile-${index}`} hidden={expanded !== city} className={styles.mobileContent}>
        <FacilityGroups city={city} onNavigate={onNavigate} />
      </div>
    </section>)}
  </div>;

  // Bangalore leads, the rest stay alphabetical.
  const columns = balanceColumns(["Bangalore", ...FACILITY_CITIES.filter(city => city !== "Bangalore")]);

  return <div className={styles.menu} data-hospital-menu>
    <div className={styles.directory} role="region" aria-label="Hospitals and clinics by city">
      {columns.map((column, columnIndex) => <div key={columnIndex} className={styles.column}>
        {column.map(city => <section key={city} className={styles.cityGroup} aria-labelledby={`${id}-city-${city}`}>
          <h3 id={`${id}-city-${city}`} className={styles.cityHeading}>{city}</h3>
          <FacilityGroups city={city} onNavigate={onNavigate} />
        </section>)}
      </div>)}
    </div>
    <HospitalAccreditationBand />
  </div>;
}

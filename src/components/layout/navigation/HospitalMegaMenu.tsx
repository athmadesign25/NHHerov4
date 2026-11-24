"use client";

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import MenuImageCard from "./MenuImageCard";
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
function balanceColumns(cities: readonly string[], columnCount = COLUMN_COUNT, weightForCity = cityWeight) {
  const weights = cities.map(weightForCity);
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  const columns: string[][] = [];
  let current: string[] = [];
  let filled = 0;
  let placed = 0;

  cities.forEach((city, index) => {
    const weight = weights[index];
    const remaining = columnCount - columns.length;
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
  while (columns.length < columnCount) columns.push([]);
  return columns;
}

// Fill unused column space with the next city that fits, keeping each city's
// localities together. A small allowance avoids stranding a whole short city.
function packInlineColumns(cities: readonly string[]) {
  const count = 4;
  const weights = cities.map(city => 28 + getFacilitiesForCity(city).length * 26 + 24);
  const capacity = Math.max(...weights, weights.reduce((sum, weight) => sum + weight, 0) / count * 1.1);
  const columns: string[][] = Array.from({ length: count }, () => []);
  const heights = Array<number>(count).fill(0);

  cities.forEach((city, index) => {
    const available = heights.findIndex(height => height + weights[index] <= capacity);
    const column = available >= 0 ? available : heights.indexOf(Math.min(...heights));
    columns[column].push(city);
    heights[column] += weights[index];
  });
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

  // Hospital entries sit directly below the city; only clinics need a type tag.
  const label = (type: Facility["type"]) => (type === "hospital" ? "Hospital" : "Clinic");
  return <div className={styles.typeGroups}>
    {groups.map(group => <section key={group.type}
      aria-labelledby={group.type === "clinic" ? `${id}-${group.type}` : undefined}
      aria-label={group.type === "hospital" ? `${city} hospitals` : undefined}>
      {group.type === "clinic" && <h4 id={`${id}-${group.type}`} className={styles.typeHeading}>Clinic</h4>}
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

// Variations share the facility registry and link behavior with the original.
function FacilityRows({ city, onNavigate, type, showClinicTag = false }: {
  city: string; onNavigate: () => void; type?: Facility["type"]; showClinicTag?: boolean;
}) {
  const facilities = getFacilitiesForCity(city).filter(facility => !type || facility.type === type);
  return <ul className={styles.facilityList} aria-label={`${city}${type ? ` ${type}s` : " facilities"}`}>
    {facilities.map(facility => <li key={facility.id}>
      <Link href={facility.href} className={`${styles.facilityLink} ${styles.variantLink}`} onClick={onNavigate}
        title={facility.suffix ? `${facility.locality} · ${facility.suffix}` : facility.locality}>
        <span className={styles.locality}>
          {facility.locality}
          {facility.suffix && <span className={styles.suffix}>{" · "}{facility.suffix}</span>}
        </span>
        {showClinicTag && facility.type === "clinic" && <span className={styles.clinicTag}>Clinic</span>}
      </Link>
    </li>)}
  </ul>;
}

function HospitalAccreditationCard() {
  const reduced = useReducedMotion();
  const [active, setActive] = useState(0);
  const groups = [accreditations.slice(0, 2), accreditations.slice(2)];

  useEffect(() => {
    if (reduced) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive(index => (index + 1) % 2);
    }, duration.slowest * 1000 * 5);
    return () => window.clearInterval(timer);
  }, [reduced]);

  return <MenuImageCard title="Accreditations" captionPosition="top"
    image="/navigation/hospitals/cardiac-sciences-original.png"
    imageSizes="(min-width: 1100px) 1400px, 100vw"
    alt="Narayana Institute of Cardiac Sciences hospital building" className={styles.imageCard}>
    <div className={styles.badgeStage} role="img" aria-label={accreditations.map(badge => badge.label).join("; ")}>
      {groups.map((group, index) => <motion.div key={index} className={styles.imageBadges} aria-hidden="true"
        initial={false} animate={{ opacity: active === index ? 1 : 0 }}
        transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.standard }}>
        {group.map(badge => <div key={badge.label} className={styles.accreditation}>
          <span className={styles.badgeIcon}><Image src={badge.logo} alt="" width={32} height={32} sizes="32px" loading="eager" /></span>
          <span className={styles.badgeLabel}>{badge.lines.map(line => <span key={line}>{line}</span>)}</span>
        </div>)}
      </motion.div>)}
    </div>
  </MenuImageCard>;
}

function FacilityTypeDirectory({ onNavigate, mobile, defaultCity }: {
  onNavigate: () => void; mobile: boolean; defaultCity: string;
}) {
  const id = useId();
  const [expanded, setExpanded] = useState<string | null>(defaultCity);
  return <div className={mobile ? styles.mobile : `${styles.menu} ${styles.withImage}`} data-hospital-menu data-hospital-variant="by-type">
    {!mobile && <HospitalAccreditationCard />}
    <div className={styles.typeDirectory} role="region" aria-label="Hospitals and clinics grouped by type">
      {(["hospital", "clinic"] as const).map(type => {
        const cities = [defaultCity, ...FACILITY_CITIES.filter(city => city !== defaultCity)]
          .filter(city => getFacilitiesForCity(city).some(facility => facility.type === type));
        const columns = balanceColumns(cities, type === "hospital" ? 3 : 2,
          city => 28 + getFacilitiesForCity(city).filter(facility => facility.type === type).length * 22 + 20);
        const cityBlock = (city: string) => {
          const cityId = `${id}-${type}-${city.replaceAll(" ", "-")}`;
          return <section key={city} className={mobile ? styles.mobileCity : styles.cityGroup} aria-labelledby={`${cityId}-title`}>
            <h4 id={`${cityId}-title`} className={mobile ? mobilePatterns.heading : styles.cityHeading}>
              {mobile ? <button type="button" className={mobilePatterns.toggle}
                aria-expanded={expanded === city} aria-controls={`${cityId}-content`}
                onClick={() => setExpanded(expanded === city ? null : city)}>
                {city}<ChevronDown aria-hidden="true" />
              </button> : city}
            </h4>
            <div id={`${cityId}-content`} hidden={mobile && expanded !== city} className={mobile ? styles.mobileContent : undefined}>
              <FacilityRows city={city} type={type} onNavigate={onNavigate} />
            </div>
          </section>;
        };
        return <section key={type} className={styles.typeSection} aria-labelledby={`${id}-${type}-title`}>
          <h3 id={`${id}-${type}-title`} className={styles.sectionEyebrow}>{type === "hospital" ? "Hospital" : "Clinics"}</h3>
          {mobile ? cities.map(cityBlock) : <div className={type === "hospital" ? styles.hospitalColumns : styles.clinicColumns}>
            {columns.map((column, index) => <div key={index} className={styles.column}>{column.map(cityBlock)}</div>)}
          </div>}
        </section>;
      })}
    </div>
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
  const pathname = usePathname();
  // The selected city-column design is now the default. Keep the previous
  // original menu available at /nav-v2 for comparison.
  const byType = pathname === "/nav-v3";
  const inlineClinics = pathname !== "/nav-v2" && !byType;
  const defaultCity = FACILITY_CITIES.find(city => city.toLowerCase() === detectedCity?.trim().toLowerCase()) ?? "Bangalore";
  const [expanded, setExpanded] = useState<string | null>(defaultCity);
  const mobileCities = [defaultCity, ...FACILITY_CITIES.filter(city => city !== defaultCity)];

  if (byType) return <FacilityTypeDirectory onNavigate={onNavigate} mobile={mobile} defaultCity={defaultCity} />;

  if (mobile) return <div className={styles.mobile} data-hospital-menu data-hospital-variant={inlineClinics ? "inline-clinics" : "default"}>
    {mobileCities.map((city, index) => <section key={city} className={styles.mobileCity}>
      <h3 className={mobilePatterns.heading}><button type="button" className={mobilePatterns.toggle}
        aria-expanded={expanded === city} aria-controls={`${id}-mobile-${index}`}
        onClick={() => setExpanded(expanded === city ? null : city)}>
        {city}<ChevronDown aria-hidden="true" />
      </button></h3>
      <div id={`${id}-mobile-${index}`} hidden={expanded !== city} className={styles.mobileContent}>
        {inlineClinics ? <FacilityRows city={city} onNavigate={onNavigate} showClinicTag /> : <FacilityGroups city={city} onNavigate={onNavigate} />}
      </div>
    </section>)}
  </div>;

  // Bangalore leads, the rest stay alphabetical.
  const cities = ["Bangalore", ...FACILITY_CITIES.filter(city => city !== "Bangalore")];
  const columns = inlineClinics ? packInlineColumns(cities) : balanceColumns(cities);

  return <div className={inlineClinics ? `${styles.menu} ${styles.withImage} ${styles.inlineDirectoryMenu}` : styles.menu} data-hospital-menu data-hospital-variant={inlineClinics ? "inline-clinics" : "default"}>
    {inlineClinics && <HospitalAccreditationCard />}
    <div className={styles.directory} role="region" aria-label="Hospitals and clinics by city">
      {columns.map((column, columnIndex) => <div key={columnIndex} className={styles.column}>
        {column.map(city => <section key={city} className={styles.cityGroup} aria-labelledby={`${id}-city-${city}`}>
          <h3 id={`${id}-city-${city}`} className={styles.cityHeading}>{city}</h3>
          {inlineClinics ? <FacilityRows city={city} onNavigate={onNavigate} showClinicTag /> : <FacilityGroups city={city} onNavigate={onNavigate} />}
        </section>)}
      </div>)}
    </div>
    {!inlineClinics && <HospitalAccreditationBand />}
  </div>;
}

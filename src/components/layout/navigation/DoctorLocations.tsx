"use client";

import Image from "next/image";
import Link from "next/link";
import styles from "./DoctorLocations.module.css";
import MenuAction from "./MenuAction";

const cities = [
  { name: "Bangalore", slug: "bangalore" },
  { name: "Kolkata", slug: "kolkata" },
  { name: "Jamshedpur", slug: "jamshedpur" },
  { name: "Delhi", slug: "delhi" },
  { name: "Guwahati", slug: "guwahati" },
  { name: "Davangere", slug: "davangere" },
  { name: "Barasat", slug: "barasat" },
  { name: "Mysore", slug: "mysore" },
  { name: "Mumbai", slug: "mumbai" },
  { name: "Jaipur", slug: "jaipur" },
  { name: "Gurugram", slug: "gurugram" },
  { name: "Hosur", slug: "hosur" },
  { name: "Raipur", slug: "raipur" },
  { name: "Kolar", slug: "kolar" },
  { name: "Howrah", slug: "howrah" },
];

export default function DoctorLocations({ onNavigate }: { onNavigate: () => void }) {
  return (
    <div className={styles.locations}>
      <ul className={styles.grid} aria-label="Find doctors by city">
        {cities.map((city) => (
          <li key={city.slug}>
            <Link href={`/search?q=${encodeURIComponent(city.name)}`} onClick={onNavigate} className={styles.tile}>
              <Image src={`/navigation/cities/${city.slug}.webp`} alt="" fill sizes="(min-width: 1600px) 18vw, 16vw" className={styles.image} />
              <span className={styles.wash} aria-hidden="true" />
              <span className={styles.caption}>
                <span className={styles.name}>{city.name}</span>
              </span>
              <span className={styles.pattern} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.footer}>
        <a className={styles.credits} href="/navigation/cities/credits.json" target="_blank" rel="noopener noreferrer">Photo credits</a>
        <MenuAction label="View All Locations" href="/doctors" context="View all doctor locations" onClick={onNavigate} />
      </div>
    </div>
  );
}

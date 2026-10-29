"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, MapPin, Search, X } from "lucide-react";
import { NH_CITIES } from "@/lib/searchService";
import styles from "./SearchHeader.module.css";

interface Props {
  query: string; location: string;
  onQuery: (query: string) => void; onLocation: (location: string) => void;
}

export default function SearchHeader({ query, location, onQuery, onLocation }: Props) {
  const [navVisible, setNavVisible] = useState(true);
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const current = window.scrollY;
      if (current < 120) setNavVisible(true);
      else if (Math.abs(current - last) > 12) setNavVisible(current < last);
      if (Math.abs(current - last) > 12) last = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return <>
    <div className={styles.navGap} aria-hidden />
    <header className={`${styles.header} ${!navVisible ? styles.navHidden : ""}`}>
      <div className={styles.container}>
        <form role="search" className={styles.form} onSubmit={(event) => { event.preventDefault(); document.getElementById("d3-results-title")?.focus({ preventScroll: true }); }}>
          <div className={styles.searchField}>
            <Search size={20} aria-hidden />
            <label className={styles.srOnly} htmlFor="d3-search">Search Narayana Health</label>
            <input id="d3-search" type="search" value={query} autoComplete="off" enterKeyHint="search"
              placeholder="Search doctors, hospitals, specialities…" onChange={(event) => onQuery(event.target.value)} />
            {query && <button type="button" className={styles.clear} aria-label="Clear search" onClick={() => { onQuery(""); document.getElementById("d3-search")?.focus(); }}><X size={18} aria-hidden /></button>}
          </div>
          <label className={styles.location}><MapPin size={18} aria-hidden /><span className={styles.srOnly}>Search location</span>
            <select value={location} onChange={(event) => onLocation(event.target.value)}><option value="All">All locations</option>{NH_CITIES.map((city) => <option key={city.id} value={city.value}>{city.label}</option>)}</select>
          </label>
          <button className={styles.submit} type="submit">Search <ArrowUpRight size={18} aria-hidden /></button>
        </form>
      </div>
    </header>
  </>;
}

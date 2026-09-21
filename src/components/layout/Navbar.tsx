"use client";

import { useState, useEffect, useRef, Fragment } from "react";
import Link from "next/link";
import LoginModal from "@/features/auth/LoginModal";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ChevronDown, MapPin, Search, Menu, ChevronRight, ChevronLeft, X, User , UserCog , CalendarCheck , FileText , LogOut , Users , Check, Phone, Stethoscope, Activity, Building2, Globe } from "lucide-react";
import styles from "./Navbar.module.css";

// Emergency siren icon (custom, not in lucide-react) for the 24/7 Emergency
// nav button. Fixed red (see .emergencyIcon) rather than currentColor —
// unlike the label beside it, this doesn't follow the navbar's dynamic
// light/dark text color.
function EmergencyIcon({ size = 18 }: { size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="currentColor" viewBox="0 0 256 256">
      <path d="M120,16V8a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm80,32a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,200,48ZM50.34,45.66A8,8,0,0,0,61.66,34.34l-8-8A8,8,0,0,0,42.34,37.66ZM232,176v24a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V176a16,16,0,0,1,16-16V128a88,88,0,0,1,88.67-88c48.15.36,87.33,40.29,87.33,89v31A16,16,0,0,1,232,176ZM134.68,87.89C153.67,91.08,168,108.32,168,128a8,8,0,0,0,16,0c0-27.4-20.07-51.43-46.68-55.89a8,8,0,1,0-2.64,15.78ZM216,200V176H40v24H216Z"></path>
    </svg>
  );
}

const MOCK_FAMILY_MEMBERS = [
  { id: 1, name: "Toshib", img: "https://i.pravatar.cc/150?img=11" },
  { id: 2, name: "Aarav", img: "https://i.pravatar.cc/150?img=12" },
  { id: 3, name: "Neha", img: "https://i.pravatar.cc/150?img=5" },
  { id: 4, name: "Rahul", img: "https://i.pravatar.cc/150?img=8" },
];

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePane, setActivePane] = useState<string>('main');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  
  useEffect(() => {
    if (!isMobileMenuOpen) {
      setTimeout(() => setActivePane('main'), 300); // Reset pane when drawer closes
    }
  }, [isMobileMenuOpen]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsLoggedIn(localStorage.getItem('isLoggedIn') === 'true');
    }
  }, []);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const [activeUserId, setActiveUserId] = useState(1);
  const activeUser = MOCK_FAMILY_MEMBERS.find(m => m.id === activeUserId) || MOCK_FAMILY_MEMBERS[0];
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
        setIsMembersExpanded(false); // Reset on close
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isOverLightBackground, setIsOverLightBackground] = useState(false);
  const isOverLightRef = useRef(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    // Real-time theme probe directly under the navbar's center (y = 35px).
    // Deliberately unconditional — it used to live inside the show/hide
    // logic below and only ran once a scroll had traveled past a 120px
    // threshold AND cleared a 12px dead-zone (both tuned for the hide-on-
    // scroll-down behavior, not for theme accuracy). That meant the very
    // first ~120px of scroll, and any small/slow scroll movement anywhere
    // on the page, never re-checked the theme at all — so the navbar could
    // sit on a dark section still showing dark (low-contrast) text, or
    // vice versa, until a big enough scroll happened to also pass the
    // unrelated hide/show gate. Running it on every scroll tick (plus once
    // on mount) keeps it in sync with whatever is actually under it.
    const probeTheme = () => {
      if (typeof document === "undefined") return;
      const probeX = window.innerWidth / 2;
      const probeY = 35;
      const elements = document.elementsFromPoint(probeX, probeY);
      let detectedTheme = "light";

      for (const el of elements) {
        if (el.closest("nav")) continue;
        const themeEl = el.closest("[data-nav-theme]");
        if (themeEl) {
          detectedTheme = themeEl.getAttribute("data-nav-theme") || "light";
          break;
        }
      }

      const isLight = detectedTheme !== "dark";
      if (isLight !== isOverLightRef.current) {
        isOverLightRef.current = isLight;
        setIsOverLightBackground(isLight);
      }
    };

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      probeTheme();

      // Always show navbar near the top
      if (currentScrollY < 120) {
        setIsVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }

      const delta = currentScrollY - lastScrollY.current;

      // Dead zone: ignore tiny scroll movements / Lenis momentum jitter (less than 12px)
      if (Math.abs(delta) < 12) {
        return;
      }

      if (delta > 0) {
        // Sustained downward scroll
        setIsVisible(false);
      } else {
        // Sustained upward scroll
        setIsVisible(true);
      }

      // Update baseline after a meaningful scroll distance
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isNavbarActive = !isHomePage || scrolled || isMobileMenuOpen;

  return (
    <nav
      style={{
        position: "fixed",
        top: "0px",
        zIndex: isMobileMenuOpen ? 10000000 : 1000,
        width: "100%",
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition: "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        "--nav-fg-color": (!isMobileMenuOpen && isOverLightBackground) ? "var(--color-text, #0f172a)" : "#ffffff"
      } as React.CSSProperties}
    >
      <div
        className={styles.navBackdrop}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          backgroundColor: isMobileMenuOpen
            ? "rgba(15, 23, 42, 0.95)"
            : (isNavbarActive
                ? (isOverLightBackground ? "rgba(255, 255, 255, 0.82)" : "rgba(8, 15, 28, 0.55)")
                : "transparent"),
          backdropFilter: (isNavbarActive || isMobileMenuOpen) ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: (isNavbarActive || isMobileMenuOpen) ? "blur(24px) saturate(180%)" : "none",
          borderBottom: isMobileMenuOpen
            ? "1px solid rgba(255, 255, 255, 0.1)"
            : (isNavbarActive
                ? (isOverLightBackground ? "1px solid rgba(0, 0, 0, 0.08)" : "1px solid rgba(255, 255, 255, 0.22)")
                : "1px solid rgba(255, 255, 255, 0)"),
          transition: "background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
          pointerEvents: "none"
        }}
      />
      <div className={`container ${styles.navContainer}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }} className={styles.desktopOnly}>
          <Link aria-label="Narayana Health Home" style={{ flexShrink: 0 }} href="/">
            <div style={{ position: "relative", width: "108px", height: "34px", display: "flex", alignItems: "center" }}>
              <Image alt="Narayana Health" width={108} height={34} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: isOverLightBackground ? 1 : 0, transition: "opacity 0.4s ease" }} src="/NH-logo.svg" priority />
              <Image alt="Narayana Health" width={108} height={34} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", opacity: isOverLightBackground ? 0 : 1, transition: "opacity 0.4s ease" }} src="/NH-logo-white.svg" priority />
            </div>
          </Link>
          <ul style={{ display: "flex", listStyle: "none", gap: "16px", alignItems: "center", margin: 0 }} className={styles.desktopNav}>
          <li className={styles.navItem}
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("find-a-doctor")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link className={styles.navLink} href="/search">
              Find a Doctor<ChevronDown size={14} />
            </Link>
            {activeDropdown === "find-a-doctor" && (
              <div style={{ position: "absolute", top: "100%", left: "0px", background: "rgb(255, 255, 255)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))", padding: "var(--sp-4, 32px)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4, 32px)", minWidth: "640px", border: "1px solid var(--color-border, #E2E8F0)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Top Specialties</div>
                  <Link href="/search?q=cardiologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiologist</Link>
                  <Link href="/search?q=orthopaedician" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Orthopaedician</Link>
                  <Link href="/search?q=oncologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Oncologist</Link>
                  <Link href="/search?q=neurologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Neurologist</Link>
                  <Link href="/search?q=pediatrician" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Pediatrician</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Surgical Specialists</div>
                  <Link href="/search?q=cardiac%20surgeon" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiac Surgeon</Link>
                  <Link href="/search?q=general%20surgeon" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>General Surgeon</Link>
                  <Link href="/search?q=vascular%20surgeon" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Vascular Surgeon</Link>
                  <Link href="/search?q=plastic%20surgeon" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Plastic Surgeon</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Internal Medicine</div>
                  <Link href="/search?q=gastroenterologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Gastroenterologist</Link>
                  <Link href="/search?q=pulmonologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Pulmonologist</Link>
                  <Link href="/search?q=endocrinologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Endocrinologist</Link>
                  <Link href="/search?q=nephrologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Nephrologist</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Other Specialists</div>
                  <Link href="/search?q=urologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Urologist</Link>
                  <Link href="/search?q=gynecologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Gynecologist</Link>
                  <Link href="/search?q=ent%20specialist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>ENT Specialist</Link>
                  <Link href="/search?q=dermatologist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Dermatologist</Link>
                  <Link href="/search?q=dentist" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Dentist</Link>
                </div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border, #E2E8F0)", paddingTop: "var(--sp-3, 24px)", display: "flex", justifyContent: "flex-end" }}>
                  <Link href="/search" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #034EA2)", display: "flex", alignItems: "center", gap: "2px" }}>
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </li>
          <li className={styles.navItem}
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("hospitals")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link className={styles.navLink} href="/hospitals">
              Hospitals & Clinics<ChevronDown size={14} />
            </Link>
            {activeDropdown === "hospitals" && (
              <div style={{ position: "absolute", top: "100%", left: "0px", background: "rgb(255, 255, 255)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))", padding: "var(--sp-4, 32px)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4, 32px)", minWidth: "720px", border: "1px solid var(--color-border, #E2E8F0)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>SOUTH INDIA</div>
                  <Link href="/hospitals/bengaluru-health-city" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Bengaluru — Health City</Link>
                  <Link href="/hospitals/bengaluru-mazumdar-shaw" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Bengaluru —<br />Mazumdar Shaw</Link>
                  <Link href="/hospitals/mysuru" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Mysuru</Link>
                  <Link href="/hospitals/dharwad" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Dharwad</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>EAST INDIA</div>
                  <Link href="/hospitals/kolkata" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Kolkata</Link>
                  <Link href="/hospitals/jamshedpur" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Jamshedpur</Link>
                  <Link href="/hospitals/raipur" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Raipur</Link>
                  <Link href="/hospitals/guwahati" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Guwahati</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>NORTH INDIA</div>
                  <Link href="/hospitals/delhi-ncr" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Delhi NCR</Link>
                  <Link href="/hospitals/gurugram" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Gurugram</Link>
                  <Link href="/hospitals/jaipur" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Jaipur</Link>
                  <Link href="/hospitals/jammu" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Jammu</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>INTERNATIONAL</div>
                  <Link href="/hospitals/cayman-islands" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cayman Islands</Link>
                  <Link href="/hospitals/bangladesh-helpdesk" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Bangladesh<br />Helpdesk</Link>
                </div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border, #E2E8F0)", paddingTop: "var(--sp-3, 24px)", display: "flex", justifyContent: "flex-end" }}>
                  <Link href="/hospitals" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #034EA2)", display: "flex", alignItems: "center", gap: "2px" }}>
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </li>
          <li className={styles.navItem}
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("specialities")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link className={styles.navLink} href="/specialities">
              Treatment & Specialities<ChevronDown size={14} />
            </Link>
            {activeDropdown === "specialities" && (
              <div style={{ position: "absolute", top: "100%", left: "0px", background: "rgb(255, 255, 255)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))", padding: "var(--sp-4, 32px)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4, 32px)", minWidth: "720px", border: "1px solid var(--color-border, #E2E8F0)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>HEART & VASCULAR</div>
                  <Link href="/specialities/cardiology" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiology</Link>
                  <Link href="/specialities/cardiac-surgery" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiac Surgery</Link>
                  <Link href="/specialities/vascular-surgery" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Vascular Surgery</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>CANCER CARE</div>
                  <Link href="/specialities/medical-oncology" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Medical Oncology</Link>
                  <Link href="/specialities/surgical-oncology" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Surgical Oncology</Link>
                  <Link href="/specialities/radiation-oncology" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Radiation Oncology</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>BRAIN & SPINE</div>
                  <Link href="/specialities/neurology" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Neurology</Link>
                  <Link href="/specialities/neurosurgery" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Neurosurgery</Link>
                  <Link href="/specialities/spine-surgery" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Spine Surgery</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>BONES & JOINTS</div>
                  <Link href="/specialities/orthopaedics" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Orthopaedics</Link>
                  <Link href="/specialities/joint-replacement" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Joint Replacement</Link>
                  <Link href="/specialities/sports-medicine" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Sports Medicine</Link>
                </div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border, #E2E8F0)", paddingTop: "var(--sp-3, 24px)", display: "flex", justifyContent: "flex-end" }}>
                  <Link href="/specialities" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #034EA2)", display: "flex", alignItems: "center", gap: "2px" }}>
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </li>
          <li className={styles.navItem}
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("health-checks")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link className={styles.navLink} href="/health-checks">
              Health Checkups<ChevronDown size={14} />
            </Link>
            {activeDropdown === "health-checks" && (
              <div style={{ position: "absolute", top: "100%", left: "0px", background: "rgb(255, 255, 255)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))", padding: "var(--sp-4, 32px)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4, 32px)", minWidth: "640px", border: "1px solid var(--color-border, #E2E8F0)" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Health Packages for Women</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <Link href="/specialities/vital-care-(below-40-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Vital Care (below 40 years)</Link>
                    <Link href="/specialities/prime-health-(40-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Prime Health (40-45 years)</Link>
                    <Link href="/specialities/enhanced-health-(above-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Enhanced Health (above 45 years)</Link>
                    <Link href="/specialities/comprehensive-health-(above-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Comprehensive Health (above 45 years)</Link>
                  </div>
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Health Packages for Men</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <Link href="/specialities/vital-care-(below-35-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Vital Care (below 35 years)</Link>
                    <Link href="/specialities/prime-health-(35-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Prime Health (35-45 years)</Link>
                    <Link href="/specialities/enhanced-health-(35-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Enhanced Health (35-45 years)</Link>
                    <Link href="/specialities/comprehensive-health-(above-45-years)" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Comprehensive Health (above 45 years)</Link>
                  </div>
                </div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border, #E2E8F0)", paddingTop: "var(--sp-3, 24px)", display: "flex", justifyContent: "flex-end" }}>
                  <Link href="/health-checks" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #034EA2)", display: "flex", alignItems: "center", gap: "2px" }}>
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </li>

          </ul>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3, 12px)" }} className={styles.desktopOnly}>
          <Link
            href="/emergency"
            className={`${styles.emergencyBtn} ${isOverLightBackground ? styles.emergencyBtnOnLight : ""}`}
          >
            <span className={styles.emergencyIcon}>
              <EmergencyIcon size={18} />
            </span>
            {/* Red over light sections, white over dark — flipping on the
                same signal the rest of the navbar's labels use, since white
                on the pale red glass has nothing to sit against there. */}
            <span className={styles.emergencyLabelText}>24/7 Emergency</span>
          </Link>

          {isLoggedIn ? (
            <div style={{ position: "relative" }} ref={profileDropdownRef}>
              <button 
                onClick={() => {
                  setIsProfileDropdownOpen(!isProfileDropdownOpen);
                  if (isProfileDropdownOpen) setIsMembersExpanded(false);
                }}
                className={styles.loginBtnResponsive}
                style={{ 
                  cursor: "pointer", 
                  fontFamily: "inherit", 
                  padding: "6px 12px 6px 6px", 
                  display: "flex", 
                  alignItems: "center", 
                  gap: "8px",
                  background: isProfileDropdownOpen 
                    ? (isOverLightBackground ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.22)") 
                    : (isOverLightBackground ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.16)"),
                  color: "var(--nav-fg-color)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: isOverLightBackground ? "1px solid rgba(15, 23, 42, 0.2)" : "1px solid rgba(255, 255, 255, 0.45)",
                  borderRadius: "100px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => { 
                  if (!isProfileDropdownOpen) {
                    e.currentTarget.style.background = isOverLightBackground ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.22)";
                  }
                }}
                onMouseLeave={(e) => { 
                  if (!isProfileDropdownOpen) {
                    e.currentTarget.style.background = isOverLightBackground ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.16)";
                  }
                }}
              >
                <img src={activeUser.img} alt={activeUser.name} style={{ width: "28px", height: "28px", borderRadius: "50%", objectFit: "cover" }} />
                <span style={{ fontWeight: 600, fontSize: "15px" }}>{activeUser.name}</span>
                <ChevronDown size={16} strokeWidth={2.5} style={{ opacity: 0.7, transform: isProfileDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
              </button>
              
              {isProfileDropdownOpen && (
                <div style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: "240px",
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  border: "1px solid var(--color-border, #e2e8f0)",
                  overflow: "hidden",
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column"
                }}>
                  <div style={{ padding: "12px 8px", borderBottom: "1px solid var(--color-border, #e2e8f0)", background: "#f8fafc" }}>
                    <div style={{ padding: "0 8px 8px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h4 style={{ margin: 0, fontSize: "12px", color: "var(--color-text-secondary, #475569)", textTransform: "uppercase", letterSpacing: "0.5px" }}>Switch Accounts</h4>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxHeight: isMembersExpanded ? "300px" : "none", overflowY: "auto" }}>
                      {MOCK_FAMILY_MEMBERS.slice(0, isMembersExpanded ? MOCK_FAMILY_MEMBERS.length : 3).map((member) => {
                        const isActive = member.id === activeUserId;
                        return (
                          <button 
                            key={member.id}
                            onClick={() => {
                              setActiveUserId(member.id);
                              setIsProfileDropdownOpen(false);
                              setIsMembersExpanded(false);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              width: "100%",
                              padding: "8px",
                              background: isActive ? "#e0efff" : "transparent",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              transition: "background 0.2s"
                            }}
                            onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#f1f5f9" }}
                            onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent" }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              <img src={member.img} alt={member.name} style={{ width: "24px", height: "24px", borderRadius: "50%", objectFit: "cover" }} />
                              <span style={{ fontSize: "14px", fontWeight: isActive ? 600 : 500, color: isActive ? "var(--color-primary)" : "var(--color-text, #0f172a)" }}>
                                {member.name} {isActive && "(You)"}
                              </span>
                            </div>
                            {isActive && <Check size={16} color="var(--color-primary)" />}
                          </button>
                        );
                      })}
                    </div>
                    {MOCK_FAMILY_MEMBERS.length > 3 && (
                      <button 
                        onClick={() => setIsMembersExpanded(!isMembersExpanded)}
                        style={{ 
                          marginTop: "8px", 
                          padding: "8px", 
                          width: "100%", 
                          background: "none", 
                          border: "none", 
                          color: "var(--color-primary)", 
                          fontSize: "13px", 
                          fontWeight: 600, 
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        {isMembersExpanded ? "View fewer members" : `View all ${MOCK_FAMILY_MEMBERS.length} members`}
                      </button>
                    )}
                  </div>
                  
                  <div style={{ padding: "8px" }}>
                    <Link href="/profile" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text, #0f172a)", textDecoration: "none", fontSize: "14px", fontWeight: 500, borderRadius: "8px", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <User size={18} style={{ color: "var(--color-text-secondary, #475569)" }} /> My account
                    </Link>
                    <Link href="/bookings" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text, #0f172a)", textDecoration: "none", fontSize: "14px", fontWeight: 500, borderRadius: "8px", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <CalendarCheck size={18} style={{ color: "var(--color-text-secondary, #475569)" }} /> My bookings
                    </Link>
                    <Link href="/records" onClick={() => setIsProfileDropdownOpen(false)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-text, #0f172a)", textDecoration: "none", fontSize: "14px", fontWeight: 500, borderRadius: "8px", transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "#f1f5f9"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <FileText size={18} style={{ color: "var(--color-text-secondary, #475569)" }} /> Health records
                    </Link>
                  </div>
                  
                  <div style={{ borderTop: "1px solid var(--color-border, #e2e8f0)", padding: "8px" }}>
                    <button 
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        setIsLoggedIn(false); localStorage.removeItem('isLoggedIn');
                      }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "12px 16px", color: "var(--color-emergency, #ef4444)", background: "transparent", border: "none", fontSize: "14px", fontWeight: 500, borderRadius: "8px", cursor: "pointer", transition: "background 0.2s" }} 
                      onMouseEnter={(e) => e.currentTarget.style.background = "#fef2f2"} 
                      onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                    >
                      <LogOut size={18} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={styles.loginBtnResponsive}
              onClick={() => setIsLoginModalOpen(true)}
              style={{ 
                cursor: "pointer", 
                fontFamily: "inherit",
                background: isOverLightBackground ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.16)",
                color: "var(--nav-fg-color)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: isOverLightBackground ? "1px solid rgba(15, 23, 42, 0.2)" : "1px solid rgba(255, 255, 255, 0.45)",
                padding: "8px 24px",
                borderRadius: "var(--radius-md)",
                fontWeight: 600,
                fontSize: "14px",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => { 
                e.currentTarget.style.background = isOverLightBackground ? "rgba(15, 23, 42, 0.1)" : "rgba(255, 255, 255, 0.22)";
              }}
              onMouseLeave={(e) => { 
                e.currentTarget.style.background = isOverLightBackground ? "rgba(15, 23, 42, 0.04)" : "rgba(255, 255, 255, 0.16)";
              }}
            >
              Login
            </button>
          )}
          <Link 
            href="/login" 
            className={styles.loginIconResponsive} 
            style={{ 
              color: "var(--nav-fg-color)", 
              padding: "8px", 
              alignItems: "center", 
              justifyContent: "center",
              transition: "color 0.4s ease"
            }}
          >
            <User size={18} strokeWidth={2.5} />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu" style={{ color: "var(--nav-fg-color)", padding: "8px", display: "none", cursor: "pointer", background: "none", border: "none", transition: "color 0.4s ease" }} className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>

        {/* ─── Mobile Navbar (<= 1024px): [ NH Logo ] [ Search ] [ Book Appointment ] [ Menu ] ─── */}
        <div className={styles.mobileNav}>
          <Link aria-label="Narayana Health Home" href="/" className={styles.mobileLogoLink}>
            <div className={styles.mobileLogoContainer}>
              <Image 
                alt="Narayana Health" 
                src="/NH-logo.svg" 
                width={112} 
                height={35} 
                className={styles.mobileLogoImg}
                style={{ 
                  opacity: (!isMobileMenuOpen && isOverLightBackground) ? 1 : 0, 
                  transition: "opacity 0.4s ease" 
                }} 
                priority 
              />
              <Image 
                alt="Narayana Health" 
                src="/NH-logo-white.svg" 
                width={112} 
                height={35} 
                className={styles.mobileLogoImg}
                style={{ 
                  opacity: (isMobileMenuOpen || !isOverLightBackground) ? 1 : 0, 
                  transition: "opacity 0.4s ease" 
                }} 
                priority 
              />
            </div>
          </Link>

          <div className={styles.mobileActionGroup}>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.button 
                  className={styles.navCityBtn} 
                  aria-label="Select City"
                  initial={{ opacity: 0, width: 0, overflow: "hidden", padding: 0 }}
                  animate={{ opacity: 1, width: "auto", overflow: "visible", padding: "0 4px" }}
                  exit={{ opacity: 0, width: 0, overflow: "hidden", padding: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <MapPin size={16} strokeWidth={2.5} />
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>BLR</span>
                  <ChevronDown size={14} style={{ opacity: 0.7 }} />
                </motion.button>
              )}
            </AnimatePresence>
            <button 
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className={styles.mobileSearchBtn}
              aria-label="Search doctors, specialities, or hospitals"
            >
              <Search size={20} strokeWidth={2} />
            </button>

            {/* Apple-Style Morphing 2-Line Animated Hamburger Button */}
            <button 
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={styles.appleHamburgerBtn}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <span className={`${styles.hamburgerLine} ${styles.lineTop} ${isMobileMenuOpen ? styles.lineTopOpen : ""}`} />
              <span className={`${styles.hamburgerLine} ${styles.lineBottom} ${isMobileMenuOpen ? styles.lineBottomOpen : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* ─── Premium Dark Mode Mobile Menu (Sliding Panes) ─── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            className={styles.darkDrawerOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <AnimatePresence mode="wait">
              
              {/* --- MAIN PANE --- */}
              {activePane === 'main' && (
                <motion.div 
                  key="main"
                  className={styles.darkDrawerPane}
                  initial={{ x: "-20%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "-20%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.darkDrawerScroll}>
                    
                    {/* Main Unified Navigation List */}
                    <motion.div 
                      className={styles.coreNavList}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <Link href="/book" onClick={() => setIsMobileMenuOpen(false)} className={styles.coreNavLink}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <CalendarCheck size={18} color="#94a3b8" />
                          <span className={styles.coreNavTitle}>Book Visit</span>
                        </div>
                        <ChevronRight size={20} className={styles.coreNavChevron} />
                      </Link>

                      <button onClick={() => setActivePane('search')} className={styles.coreNavLink}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Search size={18} color="#94a3b8" />
                          <span className={styles.coreNavTitle}>Find Doctor</span>
                        </div>
                        <ChevronRight size={20} className={styles.coreNavChevron} />
                      </button>

                      {[
                        { title: "Treatments & Specialities", pane: "specialities", icon: <Stethoscope size={18} color="#94a3b8" /> },
                        { title: "Health Checkups", pane: "health-checks", icon: <Activity size={18} color="#94a3b8" /> },
                        { title: "Hospitals & Clinics", href: "/hospitals", icon: <Building2 size={18} color="#94a3b8" /> },
                        { title: "International Patients", href: "/international-patients", icon: <Globe size={18} color="#94a3b8" /> },
                      ].map((item) => (
                        <Fragment key={item.title}>
                          {item.pane ? (
                            <button onClick={() => setActivePane(item.pane)} className={styles.coreNavLink}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {item.icon}
                                <span className={styles.coreNavTitle}>{item.title}</span>
                              </div>
                              <ChevronRight size={20} className={styles.coreNavChevron} />
                            </button>
                          ) : (
                            <Link href={item.href!} onClick={() => setIsMobileMenuOpen(false)} className={styles.coreNavLink}>
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                {item.icon}
                                <span className={styles.coreNavTitle}>{item.title}</span>
                              </div>
                              <ChevronRight size={20} className={styles.coreNavChevron} />
                            </Link>
                          )}
                        </Fragment>
                      ))}

                      <a href="tel:18003090309" className={styles.coreNavLink}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          <Phone size={18} color="#f87171" />
                          <span className={styles.coreNavTitle} style={{ color: "#f87171" }}>24/7 Emergency (1800 309 0309)</span>
                        </div>
                      </a>
                    </motion.div>

                    {/* Bottom Utility Dock */}
                    <motion.div 
                      className={styles.utilityDock}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginModalOpen(true); }} className={styles.utilityRow}>
                        <div className={styles.utilityIconWrap}><User size={16} /></div>
                        <span>Login</span>
                      </button>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* --- SUB-PANE: FIND A DOCTOR (SEARCH) --- */}
              {activePane === 'search' && (
                <motion.div 
                  key="search"
                  className={styles.darkDrawerPane}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.paneHeader}>
                    <button onClick={() => setActivePane('main')} className={styles.backBtn}>
                      <ChevronLeft size={22} />
                    </button>
                    <span className={styles.paneTitle}>Find a Doctor</span>
                  </div>
                  <div className={styles.darkDrawerScroll}>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>Top Specialties</div>
                      <Link href="/search?q=cardiologist" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Cardiologist</Link>
                      <Link href="/search?q=orthopaedician" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Orthopaedician</Link>
                      <Link href="/search?q=oncologist" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Oncologist</Link>
                      <Link href="/search?q=neurologist" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Neurologist</Link>
                      <Link href="/search?q=pediatrician" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Pediatrician</Link>
                    </div>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>Surgical Specialists</div>
                      <Link href="/search?q=cardiac%20surgeon" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Cardiac Surgeon</Link>
                      <Link href="/search?q=general%20surgeon" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>General Surgeon</Link>
                      <Link href="/search?q=vascular%20surgeon" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Vascular Surgeon</Link>
                      <Link href="/search?q=plastic%20surgeon" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Plastic Surgeon</Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- SUB-PANE: SPECIALITIES --- */}
              {activePane === 'specialities' && (
                <motion.div 
                  key="specialities"
                  className={styles.darkDrawerPane}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.paneHeader}>
                    <button onClick={() => setActivePane('main')} className={styles.backBtn}>
                      <ChevronLeft size={22} />
                    </button>
                    <span className={styles.paneTitle}>Specialities</span>
                  </div>
                  <div className={styles.darkDrawerScroll}>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>Heart Care</div>
                      <Link href="/specialities/cardiology" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Cardiology</Link>
                      <Link href="/specialities/cardiac-surgery" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Cardiac Surgery</Link>
                      <Link href="/specialities/vascular-surgery" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Vascular Surgery</Link>
                    </div>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>Brain & Spine</div>
                      <Link href="/specialities/neurology" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Neurology</Link>
                      <Link href="/specialities/neurosurgery" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Neurosurgery</Link>
                      <Link href="/specialities/spine-surgery" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Spine Surgery</Link>
                    </div>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>Bones & Joints</div>
                      <Link href="/specialities/orthopaedics" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Orthopaedics</Link>
                      <Link href="/specialities/joint-replacement" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Joint Replacement</Link>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* --- SUB-PANE: HEALTH CHECKUPS --- */}
              {activePane === 'health-checks' && (
                <motion.div 
                  key="health-checks"
                  className={styles.darkDrawerPane}
                  initial={{ x: "100%", opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: "100%", opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className={styles.paneHeader}>
                    <button onClick={() => setActivePane('main')} className={styles.backBtn}>
                      <ChevronLeft size={22} />
                    </button>
                    <span className={styles.paneTitle}>Health Checkups</span>
                  </div>
                  <div className={styles.darkDrawerScroll}>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>For Women</div>
                      <Link href="/specialities/vital-care-women" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Vital Care (below 40 years)</Link>
                      <Link href="/specialities/prime-health-women" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Prime Health (40-45 years)</Link>
                      <Link href="/specialities/enhanced-health-women" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Enhanced Health (above 45 years)</Link>
                    </div>
                    <div className={styles.subCategoryGroup}>
                      <div className={styles.subCategoryLabel}>For Men</div>
                      <Link href="/specialities/vital-care-men" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Vital Care (below 35 years)</Link>
                      <Link href="/specialities/prime-health-men" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Prime Health (35-45 years)</Link>
                      <Link href="/specialities/enhanced-health-men" onClick={() => setIsMobileMenuOpen(false)} className={styles.subCategoryLink}>Enhanced Health (above 45 years)</Link>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {isSearchOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: "100vh", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "20px" }} onClick={() => setIsSearchOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "rgb(255, 255, 255)", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(0,0,0,0.1)", position: "relative", width: "100%", maxWidth: "1100px" }}>
            <button aria-label="Close search" onClick={() => setIsSearchOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: "#666" }}>
              <X size={24} strokeWidth={2.5} />
            </button>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Search Doctors, Specialities or Hospitals</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} strokeWidth={2} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                  <input placeholder="Search for doctors, treatments and specialities, conditions or procedures" style={{ width: "100%", padding: "16px 16px 16px 44px", border: "1px solid #ddd", borderRadius: "9999px", background: "#f8f9fa", fontSize: "15px", outline: "none", transition: "border 0.15s" }} />
                </div>
              </div>
              <button style={{ backgroundColor: "rgb(3, 78, 162)", color: "rgb(255, 255, 255)", border: "none", borderRadius: "9999px", padding: "16px 32px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
                <Search size={18} strokeWidth={2} />Search
              </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "#666", fontWeight: 600 }}>Popular:</span>
              <button style={{ background: "#e6f0fa", color: "rgb(3, 78, 162)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cardiologist</button>
              <button style={{ background: "#e6f0fa", color: "rgb(3, 78, 162)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Orthopaedic Surgeon</button>
              <button style={{ background: "#e6f0fa", color: "rgb(3, 78, 162)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Neurologist</button>
              <button style={{ background: "#e6f0fa", color: "rgb(3, 78, 162)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Oncologist</button>
            </div>

            <div style={{ borderRadius: "12px", border: "1px solid #eee", background: "rgb(255, 255, 255)", padding: "24px", marginTop: "24px", width: "100%" }}>
              <h3 style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#666", marginBottom: "12px", letterSpacing: "0.05em", textTransform: "uppercase" }}>You can also find treatments &amp; procedures by first letter</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => (
                  <Link key={letter} href={`/search?letter=${letter.toLowerCase()}`} style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "1px solid #eee", color: "#333", background: "rgb(255, 255, 255)", textDecoration: "none" }}>{letter}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={() => { setIsLoggedIn(true); localStorage.setItem('isLoggedIn', 'true'); }} />
    </nav>
  );
}

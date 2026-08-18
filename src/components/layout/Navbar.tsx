"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, MapPin, Search, Menu, ChevronRight, X, User } from "lucide-react";
import styles from "./Navbar.module.css";

export default function Navbar() {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearchIcon, setShowSearchIcon] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Show search icon after scrolling by the search bar on homepage (approx. 350px), or always on other pages
      if (!isHomePage || window.scrollY > 350) {
        setShowSearchIcon(true);
      } else {
        setShowSearchIcon(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  const isNavbarActive = !isHomePage || scrolled;

  return (
    <nav
      className={isNavbarActive ? "scrolled" : ""}
      style={{
        position: "fixed",
        top: "0px",
        zIndex: 1000,
        width: "100%",
        backgroundColor: isNavbarActive ? "#FFFFFF" : "transparent",
        backdropFilter: isNavbarActive ? "blur(12px)" : "none",
        WebkitBackdropFilter: isNavbarActive ? "blur(12px)" : "none",
        boxShadow: isNavbarActive ? "rgba(0, 0, 0, 0.08) 0px 1px 3px" : "none",
        transition: "all 0.3s ease"
      }}
    >
      <div className={`container ${styles.navContainer}`}>
        <div style={{ display: "flex", alignItems: "center", gap: "40px" }}>
          <Link aria-label="Narayana Health Home" style={{ flexShrink: 0 }} href="/">
            <div style={{ width: "108px", height: "auto", display: "flex", alignItems: "center" }}>
              <Image alt="Narayana Health" width={108} height={34} style={{ color: "transparent", width: "100%", height: "auto" }} src={isNavbarActive ? "/logos/NH-logo.svg" : "/logos/NH_Logo_white_1.png"} priority />
            </div>
          </Link>
          <ul style={{ display: "flex", listStyle: "none", gap: "16px", alignItems: "center", margin: 0 }} className="desktop-nav">
          <li 
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("find-a-doctor")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link style={{ color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", fontSize: "14px", fontWeight: 500, padding: "8px 12px", borderRadius: "var(--radius-sm, 4px)", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s", whiteSpace: "nowrap", position: "relative" }} href="/search?q=Dr.&location=All">
              Find a Doctor<ChevronDown size={14} />
            </Link>
            {activeDropdown === "find-a-doctor" && (
              <div style={{ position: "absolute", top: "100%", left: "0px", background: "rgb(255, 255, 255)", borderRadius: "var(--radius-md)", boxShadow: "var(--shadow-md, 0 4px 16px rgba(0,0,0,0.1))", padding: "var(--sp-4, 32px)", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "var(--sp-4, 32px)", minWidth: "640px", border: "1px solid var(--color-border, #E2E8F0)" }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Top Specialties</div>
                  <Link href="/search?q=Cardiologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiologist</Link>
                  <Link href="/search?q=Orthopaedician&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Orthopaedician</Link>
                  <Link href="/search?q=Oncologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Oncologist</Link>
                  <Link href="/search?q=Neurologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Neurologist</Link>
                  <Link href="/search?q=Pediatrician&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Pediatrician</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Surgical Specialists</div>
                  <Link href="/search?q=Cardiac%20Surgeon&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Cardiac Surgeon</Link>
                  <Link href="/search?q=General%20Surgeon&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>General Surgeon</Link>
                  <Link href="/search?q=Vascular%20Surgeon&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Vascular Surgeon</Link>
                  <Link href="/search?q=Plastic%20Surgeon&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Plastic Surgeon</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Internal Medicine</div>
                  <Link href="/search?q=Gastroenterologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Gastroenterologist</Link>
                  <Link href="/search?q=Pulmonologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Pulmonologist</Link>
                  <Link href="/search?q=Endocrinologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Endocrinologist</Link>
                  <Link href="/search?q=Nephrologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Nephrologist</Link>
                </div>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--color-primary, #034EA2)", marginBottom: "10px", borderLeft: "3px solid var(--color-emergency, #ED1C24)", paddingLeft: "8px" }}>Other Specialists</div>
                  <Link href="/search?q=Urologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Urologist</Link>
                  <Link href="/search?q=Gynecologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Gynecologist</Link>
                  <Link href="/search?q=ENT%20Specialist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>ENT Specialist</Link>
                  <Link href="/search?q=Dermatologist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Dermatologist</Link>
                  <Link href="/search?q=Dentist&location=All" style={{ display: "block", fontSize: "13px", color: "var(--color-text-secondary, #4A5568)", padding: "4px 0px 4px 11px", borderRadius: "var(--radius-sm)", transition: "color 0.15s" }}>Dentist</Link>
                </div>
                <div style={{ gridColumn: "1 / -1", borderTop: "1px solid var(--color-border, #E2E8F0)", paddingTop: "var(--sp-3, 24px)", display: "flex", justifyContent: "flex-end" }}>
                  <Link href="/search?q=Dr.&location=All" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary, #034EA2)", display: "flex", alignItems: "center", gap: "2px" }}>
                    View all <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            )}
          </li>
          <li 
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("hospitals")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link style={{ color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", fontSize: "14px", fontWeight: 500, padding: "8px 12px", borderRadius: "var(--radius-sm, 4px)", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s", whiteSpace: "nowrap", position: "relative" }} href="/hospitals">
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
          <li 
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("specialities")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link style={{ color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", fontSize: "14px", fontWeight: 500, padding: "8px 12px", borderRadius: "var(--radius-sm, 4px)", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s", whiteSpace: "nowrap", position: "relative" }} href="/specialities">
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
          <li 
            style={{ position: "relative" }}
            onMouseEnter={() => setActiveDropdown("health-checks")}
            onMouseLeave={() => setActiveDropdown(null)}
          >
            <Link style={{ color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", fontSize: "14px", fontWeight: 500, padding: "8px 12px", borderRadius: "var(--radius-sm, 4px)", display: "flex", alignItems: "center", gap: "4px", transition: "all 0.15s", whiteSpace: "nowrap", position: "relative" }} href="/health-checks">
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
        <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3, 12px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", padding: "8px", color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF" }}>
            <MapPin size={18} strokeWidth={2.5} />
            <span className={styles.locationText} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ fontSize: "14px", fontWeight: 500 }}>Bangalore</span>
              <ChevronDown size={14} />
            </span>
          </div>
          <button
            aria-label="Search"
            onClick={() => setIsSearchOpen(true)}
            style={{
              padding: showSearchIcon ? "8px" : "0px",
              width: showSearchIcon ? "34px" : "0px",
              opacity: showSearchIcon ? 1 : 0,
              visibility: showSearchIcon ? "visible" : "hidden",
              pointerEvents: showSearchIcon ? "auto" : "none",
              cursor: "pointer",
              background: "transparent",
              border: "none",
              color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
              overflow: "hidden",
            }}
          >
            <Search size={18} strokeWidth={2.5} style={{ flexShrink: 0 }} />
          </button>
          <Link 
            className={`${styles.loginBtnResponsive} ${isNavbarActive ? styles.loginBtnActive : styles.loginBtnInactive}`} 
            href="/login"
          >
            Login
          </Link>
          <Link 
            href="/login" 
            className={styles.loginIconResponsive} 
            style={{ 
              color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", 
              padding: "8px", 
              alignItems: "center", 
              justifyContent: "center" 
            }}
          >
            <User size={18} strokeWidth={2.5} />
          </Link>
          <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu" style={{ color: isNavbarActive ? "var(--text-primary, #333)" : "#FFFFFF", padding: "8px", display: "none", cursor: "pointer", background: "none", border: "none" }} className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100vh", backgroundColor: "#fff", zIndex: 1001, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px", borderBottom: "1px solid #eee" }}>
            <Image alt="Narayana Health" width={108} height={34} style={{ width: "108px", height: "auto" }} src="/logos/NH-logo.svg" />
            <button onClick={() => setIsMobileMenuOpen(false)} style={{ background: "none", border: "none", padding: "8px", cursor: "pointer" }}>
              <X size={24} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", padding: "16px", gap: "16px" }}>
            <Link href="/search?q=Dr.&location=All" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "16px", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>Find a Doctor <ChevronRight size={16} /></Link>
            <Link href="/hospitals" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "16px", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>Hospitals & Clinics <ChevronRight size={16} /></Link>
            <Link href="/health-checks" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "16px", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>Health Checkups <ChevronRight size={16} /></Link>
            <Link href="/specialities" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "16px", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>Treatments & Specialities <ChevronRight size={16} /></Link>
            <Link href="/international-patients" onClick={() => setIsMobileMenuOpen(false)} style={{ fontSize: "16px", fontWeight: 600, padding: "12px 0", borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>International Patients <ChevronRight size={16} /></Link>
            
            <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} style={{ width: "100%", padding: "14px", textAlign: "center", border: "1px solid var(--color-primary, #034EA2)", color: "var(--color-primary, #034EA2)", borderRadius: "8px", fontWeight: 600 }}>Login / Register</Link>
              <Link href="/book" onClick={() => setIsMobileMenuOpen(false)} style={{ width: "100%", padding: "14px", textAlign: "center", background: "var(--color-emergency, #ED1C24)", color: "#fff", borderRadius: "8px", fontWeight: 600 }}>Book Appointment</Link>
            </div>
          </div>
        </div>
      )}

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
    </nav>
  );
}

"use client";

import { useState, useEffect, useLayoutEffect, useRef, useCallback, useSyncExternalStore } from "react";
import Link from "next/link";
import LoginModal from "@/features/auth/NavbarLoginModal";
import { useAuthState } from "@/features/auth/hooks/useAuthState";
import AccountMenu from "./AccountMenu";
import { chooseBookingMember, getBookingMemberSelection, getServerBookingMemberSelection, resetBookingMemberSelection, subscribeBookingMembers } from "@/features/booking/design20/memberSelection";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Search, Menu, X } from "lucide-react";
import styles from "./Navbar.module.css";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import { TriangleAlert } from "@/components/animate-ui/icons/hugeicons/triangle-alert";

import MobileMegaMenu from "./navigation/MobileMegaMenu";
import DesktopMegaMenu from "./navigation/DesktopMegaMenu";
import { DESKTOP_NAV_ITEMS } from "./navigation/menu-data";

const MotionLink = motion.create(Link);

export default function Navbar() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const lastMenuIndex = useRef(0);
  const [menuDirection, setMenuDirection] = useState(1);
  const openDropdown = (key: string) => {
    const index = DESKTOP_NAV_ITEMS.findIndex((item) => item.id === key);
    setMenuDirection(index >= lastMenuIndex.current ? 1 : -1);
    lastMenuIndex.current = index;
    setActiveDropdown(key);
  };
  const menuFocusRequested = useRef(false);
  useLayoutEffect(() => {
    if (!activeDropdown || !menuFocusRequested.current) return;
    menuFocusRequested.current = false;
    const panel = navRef.current?.querySelector<HTMLElement>('[data-desktop-menu-content="active"]');
    panel?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"], a, button')?.focus();
  }, [activeDropdown]);
  useLayoutEffect(() => {
    const measure = () => {
      const nav = navRef.current;
      const firstLink = nav?.querySelector<HTMLElement>("[data-desktop-links] > li > a");
      if (!nav || !firstLink) return;
      const inset = firstLink.getBoundingClientRect().left + Number.parseFloat(getComputedStyle(firstLink).paddingLeft);
      nav.style.setProperty("--desktop-menu-inset", `${inset}px`);
      document.documentElement.style.setProperty("--nav-find-doctor-left", `${inset}px`);
      if (window.innerWidth < 1100) setActiveDropdown(null);
      else setIsMobileMenuOpen(false);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  useEffect(() => {
    if (!activeDropdown) return;
    const dismiss = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      const trigger = navRef.current?.querySelector<HTMLAnchorElement>('[data-desktop-links] > li > a[aria-expanded="true"]');
      trigger?.focus();
      setActiveDropdown(null);
    };
    document.addEventListener("keydown", dismiss);
    return () => document.removeEventListener("keydown", dismiss);
  }, [activeDropdown]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), [setIsMobileMenuOpen]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginAfterMobileClose, setLoginAfterMobileClose] = useState(false);

  // Search theme state ("dark" | "white") for stakeholder simulation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // The in-navbar toggle is gone, but a mode saved from before still
      // applies — the search reads this attribute, not any navbar state.
      const saved = localStorage.getItem('nh_search_theme') as "dark" | "white" | null;
      if (saved === 'white' || saved === 'dark') {
        document.documentElement.setAttribute('data-search-theme', saved);
      }
    }
  }, []);


  const { isUserLoggedIn: isLoggedIn, setIsUserLoggedIn: setIsLoggedIn } = useAuthState();
  const bookingMembers = useSyncExternalStore(subscribeBookingMembers, getBookingMemberSelection, getServerBookingMemberSelection);
  const activeUserId = bookingMembers.selectedId ?? bookingMembers.members[0]?.id ?? "existing-self";
  const signOut = () => {
    setIsLoggedIn(false);
    resetBookingMemberSelection();
  };
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
        if (el.closest("nav") || el.closest('[class*="programmeTabsWrapper"]') || el.closest("footer")) continue;
        const themeEl = el.closest("[data-nav-theme]");
        if (themeEl) {
          detectedTheme = themeEl.getAttribute("data-nav-theme") || "light";
          break;
        }
      }

      const isLight = detectedTheme !== "dark";
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-nav-theme-active", isLight ? "light" : "dark");
      }
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
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-nav-visible", "true");
        }
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
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-nav-visible", "false");
        }
      } else {
        // Sustained upward scroll
        setIsVisible(true);
        if (typeof document !== "undefined") {
          document.documentElement.setAttribute("data-nav-visible", "true");
        }
      }

      // Update baseline after a meaningful scroll distance
      lastScrollY.current = currentScrollY;
    };

    const initialScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    if (initialScrollY < 120) {
      setIsVisible(true);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-nav-visible", "true");
      }
    } else {
      setIsVisible(false);
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-nav-visible", "false");
      }
    }

    const lenis = (window as unknown as { lenis?: { on?: (evt: string, fn: () => void) => void; off?: (evt: string, fn: () => void) => void } }).lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen || activeDropdown !== null) {
      if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-nav-visible", "true");
      }
    }
  }, [isMobileMenuOpen, activeDropdown]);

  // Every route uses the same scroll, section-theme and menu behavior.
  const isNavbarActive = scrolled || isMobileMenuOpen || activeDropdown !== null;
  const isNavbarLight = isOverLightBackground || activeDropdown !== null;

  return (
    <nav
      ref={navRef}
      data-site-nav
      data-nav-hidden={!isVisible && !activeDropdown ? "true" : "false"}
      role={isMobileMenuOpen ? "dialog" : undefined}
      aria-modal={isMobileMenuOpen || undefined}
      aria-labelledby={isMobileMenuOpen ? "mobile-menu-title" : undefined}
      className={activeDropdown ? styles.menuOpen : undefined}
      onMouseLeave={() => setActiveDropdown(null)}
      onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setActiveDropdown(null); }}
      onKeyDown={(event) => {
        const trigger = (event.target as HTMLElement).closest<HTMLAnchorElement>("[data-menu-trigger]");
        if (event.key !== "ArrowDown" || !trigger) return;
        event.preventDefault();
        const key = trigger.dataset.menuTrigger ?? null;
        if (activeDropdown === key) {
          navRef.current?.querySelector<HTMLElement>('[data-desktop-menu-content="active"] [role="tab"][aria-selected="true"], [data-desktop-menu-content="active"] a, [data-desktop-menu-content="active"] button')?.focus();
        } else {
          menuFocusRequested.current = true;
          if (key) openDropdown(key);
        }
      }}
      onClick={(event) => { if ((event.target as HTMLElement).closest("a")) setActiveDropdown(null); }}
      style={{
        position: "fixed",
        // An announcement band, where one is present, publishes its measured
        // height as --band-height on <html> and the navbar drops below it.
        // Routes without a band never set it, so they stay at 0.
        top: "var(--band-height, 0px)",
        zIndex: isMobileMenuOpen ? 10000000 : 1000,
        width: "100%",
        transform: isVisible || activeDropdown ? "translateY(0)" : "translateY(-100%)",
        // `top` transitions too, so when the announcement band scrolls away
        // the navbar rides up with it instead of snapping the instant the
        // band's height drops to 0.
        transition:
          "transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), top 0.35s cubic-bezier(0.22, 1, 0.36, 1)",
        "--nav-fg-color": (!isMobileMenuOpen && isNavbarLight) ? "var(--color-text, var(--slate-900))" : "var(--white)"
      } as React.CSSProperties}
    >
      <div
        className={styles.navBackdrop}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: -1,
          backgroundColor: activeDropdown ? "var(--color-surface)" : isMobileMenuOpen
            ? "rgba(var(--slate-900-rgb), 0.95)"
            : (isNavbarActive
                ? (isNavbarLight ? "rgba(var(--white-rgb), 0.8)" : "rgba(8, 15, 28, 0.55)")
                : "transparent"),
          backdropFilter: (isNavbarActive || isMobileMenuOpen) ? "blur(24px) saturate(180%)" : "none",
          WebkitBackdropFilter: (isNavbarActive || isMobileMenuOpen) ? "blur(24px) saturate(180%)" : "none",
          borderBottom: isMobileMenuOpen
            ? "1px solid rgba(var(--white-rgb), 0.1)"
            : (isNavbarActive
                ? (isNavbarLight ? "1px solid rgba(var(--black-rgb), 0.08)" : "1px solid rgba(var(--white-rgb), 0.2)")
                : "1px solid rgba(var(--white-rgb), 0)"),
          transition: "background-color 0.4s ease, backdrop-filter 0.4s ease, border-color 0.4s ease",
          pointerEvents: "none"
        }}
      />
      {activeDropdown && <>
        <button type="button" className={styles.navMenuOverlay} aria-label="Close navigation menu"
          tabIndex={-1} onMouseEnter={() => setActiveDropdown(null)} onClick={() => setActiveDropdown(null)} />
        <div className={styles.menuBridge} aria-hidden="true" />
      </>}
      <div className={`container ${styles.navContainer}`}>
        <div className={`${styles.desktopOnly} ${styles.desktopBrandNav}`}>
          <Link aria-label="Narayana Health Home" style={{ flexShrink: 0 }} href="/">
            <div style={{ position: "relative", width: "140px", height: "44px", display: "flex", alignItems: "center" }}>
              <Image alt="Narayana Health" width={140} height={44} style={{ position: "absolute", inset: 0, width: "70%", height: "100%", objectFit: "contain", opacity: (!isNavbarActive || isNavbarLight) ? 1 : 0, transition: "opacity 0.4s ease" }} src="/NH-logo.svg" priority />
              <Image alt="Narayana Health" width={140} height={44} style={{ position: "absolute", inset: 0, width: "70%", height: "100%", objectFit: "contain", opacity: (!isNavbarActive || isNavbarLight) ? 0 : 1, transition: "opacity 0.4s ease" }} src="/NH-logo-white.svg" priority />
            </div>
          </Link>
          <ul className={styles.desktopNav} data-desktop-links>
            {DESKTOP_NAV_ITEMS.map((item) => (
              <li key={item.id} className={styles.navItem} onMouseEnter={() => openDropdown(item.id)} onFocus={() => openDropdown(item.id)}>
                <Link className={styles.navLink} href={item.href} data-menu-trigger={item.id}
                  aria-expanded={activeDropdown === item.id} aria-controls="desktop-navigation-panel">
                  {item.label}<ChevronDown size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className={`${styles.desktopOnly} ${styles.desktopActions}`} onMouseEnter={() => setActiveDropdown(null)}>
          <motion.a href="tel:18003090309" className={styles.callUs} initial="initial" whileHover="animate" whileFocus="animate">
            <PhoneCall animateOnHover />
            <span>Call Us</span>
          </motion.a>

          <MotionLink
            href="/emergency"
            initial="initial"
            whileHover="animate"
            whileFocus="animate"
            className={`${styles.emergencyBtn} ${styles.emergencyBtnSolid}`}
          >
            <span className={styles.emergencyIcon}>
              <TriangleAlert animateOnHover />
            </span>
            <span className={styles.emergencyLabelText}>24/7 Emergency</span>
          </MotionLink>

          {isLoggedIn ? (
            <AccountMenu memberId={activeUserId} onMemberChange={chooseBookingMember} members={bookingMembers.members} memberLocked={!!bookingMembers.confirmed} onLogout={signOut}
              tone={isNavbarLight ? "light" : "dark"} onOpen={() => setActiveDropdown(null)} />
          ) : (
            <button type="button" className={`${styles.loginBtnResponsive} ${styles.desktopLogin}`}
              onClick={() => { setActiveDropdown(null); setIsLoginModalOpen(true); }}>Login</button>
          )}
          <button onClick={() => setIsMobileMenuOpen(true)} aria-label="Open navigation menu" style={{ color: "var(--nav-fg-color)", padding: "8px", display: "none", cursor: "pointer", background: "none", border: "none", transition: "color 0.4s ease" }} className="mobile-menu-btn">
            <Menu size={24} />
          </button>
        </div>

        {/* Mobile navbar: logo, contact shortcuts and menu toggle. */}
        <div className={styles.mobileNav}>
          <Link aria-label="Narayana Health Home" href="/" className={styles.mobileLogoLink}>
            <div
              className={styles.mobileLogoContainer}
              data-theme={!isMobileMenuOpen && (!isNavbarActive || isNavbarLight) ? "light" : "dark"}
            >
              <Image
                alt="Narayana Health"
                src="/NH-logo.svg"
                width={84}
                height={40}
                sizes="96px"
                className={`${styles.mobileLogoImg} ${styles.mobileLogoDefault}`}
                priority
              />
              <Image
                alt=""
                aria-hidden="true"
                src="/NH-logo-white.svg"
                width={84}
                height={40}
                sizes="96px"
                className={`${styles.mobileLogoImg} ${styles.mobileLogoWhite}`}
                priority
              />
            </div>
          </Link>

          <div className={styles.mobileActionGroup}>
            {!isMobileMenuOpen && <>
              <motion.a href="tel:18003090309" className={`${styles.callUs} ${styles.mobileCallUs}`} initial="initial" whileHover="animate" whileFocus="animate">
                <PhoneCall animateOnHover /><span>Call Us</span>
              </motion.a>
              <Link href="/emergency" className={styles.mobileEmergency} aria-label="Emergency">
                <TriangleAlert size={16} /><span>Emergency</span>
              </Link>
            </>}
            {/* No search affordance in the mobile bar: the hero composer
                docks into the bottom action bar on scroll and carries search
                from there, so a second entry point up here was a duplicate. */}

            {/* Apple-Style Morphing 2-Line Animated Hamburger Button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={styles.appleHamburgerBtn}
              aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              <span className={`${styles.hamburgerLine} ${styles.lineTop} ${isMobileMenuOpen ? styles.lineTopOpen : ""}`} />
              <span className={`${styles.hamburgerLine} ${styles.lineBottom} ${isMobileMenuOpen ? styles.lineBottomOpen : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {activeDropdown && <DesktopMegaMenu activeMenu={activeDropdown} direction={menuDirection} onNavigate={() => setActiveDropdown(null)} />}

      {/* Local mobile-menu exploration; the closed navbar stays unchanged. */}
      <AnimatePresence onExitComplete={() => {
        if (loginAfterMobileClose) { setLoginAfterMobileClose(false); setIsLoginModalOpen(true); }
      }}>
        {isMobileMenuOpen && <MobileMegaMenu isLoggedIn={isLoggedIn} memberId={activeUserId} members={bookingMembers.members} memberLocked={!!bookingMembers.confirmed} onMemberChange={chooseBookingMember} onLogout={signOut} onClose={closeMobileMenu} onLogin={() => { setLoginAfterMobileClose(true); closeMobileMenu(); }} />}
      </AnimatePresence>

      {isSearchOpen && (
        <div style={{ position: "absolute", top: "100%", left: 0, width: "100%", height: "100vh", backgroundColor: "rgba(var(--black-rgb), 0.5)", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "20px" }} onClick={() => setIsSearchOpen(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "var(--color-surface)", borderRadius: "16px", padding: "32px", boxShadow: "0 10px 40px rgba(var(--black-rgb), 0.1)", position: "relative", width: "100%", maxWidth: "1100px" }}>
            <button aria-label="Close search" onClick={() => setIsSearchOpen(false)} style={{ position: "absolute", top: "16px", right: "16px", background: "transparent", border: "none", cursor: "pointer", padding: "8px", color: "var(--grey-500)" }}>
              <X size={24} strokeWidth={2.5} />
            </button>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "12px", alignItems: "end" }}>
              <div style={{ position: "relative" }}>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--grey-500)", marginBottom: "6px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Search Doctors, Specialities or Hospitals</label>
                <div style={{ position: "relative" }}>
                  <Search size={18} strokeWidth={2} style={{ position: "absolute", left: "16px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
                  <input placeholder="Search for doctors, treatments and specialities, conditions or procedures" style={{ width: "100%", padding: "16px 16px 16px 44px", border: "1px solid #ddd", borderRadius: "9999px", background: "#f8f9fa", fontSize: "15px", outline: "none", transition: "border 0.15s" }} />
                </div>
              </div>
              <button style={{ backgroundColor: "var(--blue-brand)", color: "var(--color-text-inverse)", border: "none", borderRadius: "9999px", padding: "16px 32px", fontWeight: 700, fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px", whiteSpace: "nowrap" }}>
                <Search size={18} strokeWidth={2} />Search
              </button>
            </div>

            <div style={{ marginTop: "24px", display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: "13px", color: "var(--grey-500)", fontWeight: 600 }}>Popular:</span>
              <button style={{ background: "#e6f0fa", color: "var(--blue-brand)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Cardiologist</button>
              <button style={{ background: "#e6f0fa", color: "var(--blue-brand)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Orthopaedic Surgeon</button>
              <button style={{ background: "#e6f0fa", color: "var(--blue-brand)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Neurologist</button>
              <button style={{ background: "#e6f0fa", color: "var(--blue-brand)", border: "1px solid #cce0f5", borderRadius: "9999px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Oncologist</button>
            </div>

            <div style={{ borderRadius: "12px", border: "1px solid #eee", background: "var(--color-surface)", padding: "24px", marginTop: "24px", width: "100%" }}>
              <h3 style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--grey-500)", marginBottom: "12px", letterSpacing: "0.05em", textTransform: "uppercase" }}>You can also find treatments &amp; procedures by first letter</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").map(letter => (
                  <Link key={letter} href={`/search?letter=${letter.toLowerCase()}`} style={{ width: "30px", height: "30px", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "6px", fontSize: "12px", fontWeight: 700, border: "1px solid #eee", color: "#333", background: "var(--color-surface)", textDecoration: "none" }}>{letter}</Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} onLoginSuccess={() => setIsLoggedIn(true)} />
    </nav>
  );
}

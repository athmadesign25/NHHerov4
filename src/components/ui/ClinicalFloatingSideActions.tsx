"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Stethoscope, FlaskConical, FileCheck2 } from "lucide-react";
import Lottie from "lottie-react";
import pulseAnimation from "../../../public/assets/pulse animation.json";
import PulseAIWorkspace from "@/features/pulse-ai/PulseAIWorkspace";
import styles from "./ClinicalFloatingSideActions.module.css";

interface ClinicalFloatingSideActionsProps {
  consultHref?: string;
  consultLabel?: string;
  conditionTitle?: string;
  pulseQuery?: string;
  supportPhone?: string;
  secondOpinionHref?: string;
  isScrolled?: boolean;
}

export default function ClinicalFloatingSideActions({
  consultHref,
  consultLabel,
  conditionTitle,
  pulseQuery,
  supportPhone = "18003090309",
  secondOpinionHref = "/book-an-appointment?flow=second-opinion",
  isScrolled: propIsScrolled,
}: ClinicalFloatingSideActionsProps) {
  const pathname = usePathname() || "/";
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [isPulseOpen, setIsPulseOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Page-aware defaults based on current route
  const pageContext = useMemo(() => {
    if (pathname.startsWith("/diagnostics") || pathname.startsWith("/lab-tests")) {
      return {
        href: "/diagnostics",
        desktopLabel: "Book\nLab Test",
        mobileLabel: "Book Test",
        icon: "lab" as const,
        title: "Diagnostic Tests",
        query: "Help me understand diagnostic lab tests, preparation requirements, and report timelines at Narayana Health.",
      };
    }
    if (pathname.startsWith("/book-an-appointment") || pathname.startsWith("/doctors")) {
      return {
        href: pathname.startsWith("/doctors/") ? "#book-appointment-btn" : "/book-an-appointment",
        desktopLabel: "Book\nAppointment",
        mobileLabel: "Book Now",
        icon: "calendar" as const,
        title: "Doctor Consultation",
        query: "Help me find the right specialist doctor and book an appointment at Narayana Health.",
      };
    }
    if (pathname.startsWith("/symptoms")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Symptom Evaluation",
        query: "I am experiencing symptoms and want clinical guidance on warning signs and which specialist to consult.",
      };
    }
    if (pathname.startsWith("/diseases") || pathname.startsWith("/disease")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Condition Care",
        query: "I want to learn about condition management, treatment options, and specialists at Narayana Health.",
      };
    }
    if (pathname.startsWith("/treatments") || pathname.startsWith("/procedures")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Procedures & Care",
        query: "I want to know about surgical procedures, recovery timelines, and specialist consultations at Narayana Health.",
      };
    }
    if (pathname.startsWith("/specialities")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Clinical Specialities",
        query: "Help me explore clinical specialities, treatments, and leading specialists at Narayana Health.",
      };
    }
    if (pathname.startsWith("/hospitals")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Narayana Health Hospitals",
        query: "Help me find the nearest Narayana Health hospital, emergency care, and available specialists.",
      };
    }
    if (pathname.startsWith("/blog") || pathname.startsWith("/articles")) {
      return {
        href: "/book-an-appointment",
        desktopLabel: "Find a\nSpecialist",
        mobileLabel: "Find Specialist",
        icon: "specialist" as const,
        title: "Health Guides",
        query: "I have questions about a health topic or want to consult a Narayana Health specialist.",
      };
    }
    return {
      href: "/book-an-appointment",
      desktopLabel: "Find a\nSpecialist",
      mobileLabel: "Find Specialist",
      icon: "specialist" as const,
      title: "Narayana Health Care",
      query: "I want clinical guidance on symptoms, diagnosis, and finding a specialist at Narayana Health.",
    };
  }, [pathname]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== "undefined" && window.innerWidth <= 640);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile, { passive: true });
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (propIsScrolled !== undefined) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      setInternalScrolled(scrollPos > 280);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [propIsScrolled]);

  const showActions = propIsScrolled !== undefined ? propIsScrolled : internalScrolled;

  // Normalize generic "Book\nConsultation" to page-aware label so all pages share consistent context-aware phrasing
  const isGenericConsultLabel =
    !consultLabel ||
    consultLabel === "Book\nConsultation" ||
    consultLabel === "Book Consultation";

  const resolvedDesktopLabel = isGenericConsultLabel ? pageContext.desktopLabel : consultLabel;
  const resolvedMobileLabel = isGenericConsultLabel
    ? pageContext.mobileLabel
    : consultLabel.replace("\n", " ");
  const resolvedHref = consultHref && consultHref !== "/doctors" ? consultHref : pageContext.href;
  const resolvedConditionTitle = conditionTitle || pageContext.title;
  const defaultQuery =
    pulseQuery ||
    (conditionTitle
      ? `I want to know about ${conditionTitle}: clinical guidance, diagnosis, and treatment options.`
      : pageContext.query);

  // Render label with <br /> if newline is present on desktop, inline on mobile
  const renderLabel = (text: string) => {
    if (isMobile) {
      return text.replace("\n", " ");
    }
    const parts = text.split("\n");
    return (
      <>
        {parts.map((p, idx) => (
          <React.Fragment key={idx}>
            {p}
            {idx < parts.length - 1 && <br />}
          </React.Fragment>
        ))}
      </>
    );
  };

  const renderPrimaryIcon = () => {
    if (pageContext.icon === "lab") return <FlaskConical size={18} />;
    if (pageContext.icon === "calendar") return <Calendar size={18} />;
    return <Stethoscope size={18} />;
  };

  return (
    <>
      <AnimatePresence>
        {showActions && (
          <motion.div
            className={styles.floatingSideBoxes}
            initial={isMobile ? { opacity: 0, y: 30 } : { opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            animate={isMobile ? { opacity: 1, y: 0 } : { opacity: 1, x: 0, y: "-50%", scale: 1 }}
            exit={isMobile ? { opacity: 0, y: 30 } : { opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="region"
            aria-label="Quick clinical actions"
          >
            {/* Box 1: Page-Aware Primary Action (e.g. Find a Specialist / Book Lab Test / Book Appointment) */}
            <Link
              href={resolvedHref}
              className={`${styles.floatingBoxItem} ${styles.floatingBoxPrimary}`}
              title={`${resolvedDesktopLabel.replace("\n", " ")} — ${resolvedConditionTitle}`}
              aria-label={resolvedDesktopLabel.replace("\n", " ")}
            >
              <div className={styles.boxIconWrap}>
                {renderPrimaryIcon()}
              </div>
              <span className={styles.boxLabel}>
                {isMobile ? resolvedMobileLabel : renderLabel(resolvedDesktopLabel)}
              </span>
            </Link>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 2: Second Opinion CTA Floater */}
            <Link
              href={secondOpinionHref}
              className={styles.floatingBoxItem}
              title={`Request a Second Opinion — ${resolvedConditionTitle}`}
              aria-label="Request a Second Opinion"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconSecondOpinion}`}>
                <FileCheck2 size={17} />
              </div>
              <span className={styles.boxLabel}>
                {isMobile ? "2nd Opinion" : <>Second<br />Opinion</>}
              </span>
            </Link>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 3: Ask Pulse AI */}
            <button
              type="button"
              className={styles.floatingBoxItem}
              onClick={() => setIsPulseOpen(true)}
              title={`Ask Pulse AI about ${resolvedConditionTitle}`}
              aria-label="Ask Pulse AI"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconPulse}`}>
                <div className={styles.pulseLottieBox}>
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
              </div>
              <span className={styles.boxLabel}>
                {isMobile ? "Ask Pulse" : <>Ask<br />Pulse</>}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PULSE AI OVERLAY ────────────────────────────────────────────── */}
      {isPulseOpen && (
        <PulseAIWorkspace
          onClose={() => setIsPulseOpen(false)}
          initialQuery={defaultQuery}
          backLabel={`Back to ${resolvedConditionTitle}`}
        />
      )}
    </>
  );
}

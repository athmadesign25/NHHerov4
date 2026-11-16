"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, PhoneCall, ArrowRight, ShieldCheck } from "lucide-react";
import styles from "./BlogCtaBanner.module.css";

export interface BlogCtaBannerProps {
  bg?: "white" | "dark" | "transparent";
  eyebrow?: string;
  eyebrowIcon?: React.ReactNode;
  title?: string;
  subtitle?: string;
  primaryBtn?: {
    href: string;
    text: string;
    icon?: React.ReactNode;
  };
  secondaryBtn?: {
    href: string;
    text: string;
    icon?: React.ReactNode;
  };
  phoneText?: string;
  phoneMobileLabel?: string;
  phoneHref?: string;
  className?: string;
}

export default function BlogCtaBanner({
  bg = "white",
  eyebrow,
  eyebrowIcon,
  title,
  subtitle,
  primaryBtn,
  secondaryBtn,
  phoneText,
  phoneMobileLabel,
  phoneHref = "tel:18003090309",
  className,
}: BlogCtaBannerProps) {
  const pathname = usePathname() || "/";

  const defaults = useMemo(() => {
    if (pathname.startsWith("/symptoms")) {
      return {
        eyebrow: "EXPERIENCING THESE SYMPTOMS?",
        title: "Consult a Narayana Health Specialist Today",
        subtitle:
          "Early clinical evaluation ensures accurate diagnosis and faster recovery. Connect with our experienced specialists across 30+ super-specialities.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/diagnostics", text: "Explore Lab Tests" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call 24×7 Helpline",
      };
    }
    if (pathname.startsWith("/diseases") || pathname.startsWith("/disease")) {
      return {
        eyebrow: "PERSONALIZED CONDITION CARE",
        title: "Connect with a Narayana Health Specialist Today",
        subtitle:
          "Get comprehensive diagnostic evaluation, second opinions, and evidence-based treatment plans from our multidisciplinary clinical teams.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/treatments", text: "Explore Treatments" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call 24×7 Helpline",
      };
    }
    if (pathname.startsWith("/treatments") || pathname.startsWith("/procedures")) {
      return {
        eyebrow: "ADVANCED SURGICAL & CLINICAL CARE",
        title: "Plan Your Procedure with Leading Specialists",
        subtitle:
          "Speak with our senior surgeons and care coordinators for procedure guidance, second opinions, and personalized recovery pathways.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/hospitals", text: "Explore Care Centres" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call Surgical Helpline",
      };
    }
    if (pathname.startsWith("/diagnostics") || pathname.startsWith("/lab-tests")) {
      return {
        eyebrow: "NABL & NABH ACCREDITED DIAGNOSTICS",
        title: "Book a Diagnostic Test or Consult a Specialist",
        subtitle:
          "High-precision imaging, pathology, and preventive health screenings with rapid turnaround times and specialist clinical review.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/health-packages", text: "Explore Health Packages" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call Diagnostics Desk",
      };
    }
    if (pathname.startsWith("/specialities")) {
      return {
        eyebrow: "CENTRES OF CLINICAL EXCELLENCE",
        title: "Connect with a Narayana Health Specialist Today",
        subtitle:
          "Whether you need a primary clinical consultation, second opinion, or specialized surgical care — our 4,500+ specialists are here for you.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/hospitals", text: "Explore Hospitals" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call 24×7 Helpline",
      };
    }
    if (pathname.startsWith("/hospitals")) {
      return {
        eyebrow: "PAN-INDIA HOSPITAL NETWORK",
        title: "Find a Specialist at a Hospital Near You",
        subtitle:
          "Access 24×7 emergency care, state-of-the-art ICUs, and senior consultants across our accredited hospital network.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/specialities", text: "Explore Specialities" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call 24×7 Emergency",
      };
    }
    if (pathname.startsWith("/book-an-appointment") || pathname.startsWith("/doctors")) {
      return {
        eyebrow: "DEDICATED APPOINTMENT ASSISTANCE",
        title: "Need Help Finding the Right Specialist?",
        subtitle:
          "Our care coordinators can help you choose the right specialist, compare hospital units, and schedule an in-person or video consultation.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/specialities", text: "Explore Specialities" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call Booking Helpline",
      };
    }
    if (pathname.startsWith("/blog") || pathname.startsWith("/articles")) {
      return {
        eyebrow: "NEED PERSONALIZED MEDICAL ADVICE?",
        title: "Connect with a Narayana Health Specialist Today",
        subtitle:
          "Whether you are seeking a primary clinical opinion, advanced surgery evaluation, or preventive screening — our specialists are here to guide you.",
        primary: { href: "/book-an-appointment", text: "Find a Specialist" },
        secondary: { href: "/health-packages", text: "Explore Health Packages" },
        phoneDesktop: "Call 24×7: 1800 309 0309",
        phoneMobile: "Call 24×7 Helpline",
      };
    }
    return {
      eyebrow: "NEED PERSONALIZED MEDICAL ADVICE?",
      title: "Connect with a Narayana Health Specialist Today",
      subtitle:
        "Whether you are seeking a primary clinical opinion, advanced surgery evaluation, or specialized preventive health screening — our 4,500+ world-class consultants are here for you.",
      primary: { href: "/book-an-appointment", text: "Find a Specialist" },
      secondary: { href: "/health-packages", text: "Explore Health Packages" },
      phoneDesktop: "Call 24×7: 1800 309 0309",
      phoneMobile: "Call 24×7 Helpline",
    };
  }, [pathname]);

  const resolvedEyebrow = eyebrow || defaults.eyebrow;
  const resolvedTitle = title || defaults.title;
  const resolvedSubtitle = subtitle || defaults.subtitle;
  const resolvedPrimaryBtn: { href: string; text: string; icon?: React.ReactNode } =
    primaryBtn || defaults.primary;
  const resolvedSecondaryBtn: { href: string; text: string; icon?: React.ReactNode } =
    secondaryBtn || defaults.secondary;
  const resolvedPhoneDesktop = phoneText || defaults.phoneDesktop;
  const resolvedPhoneMobile = phoneMobileLabel || defaults.phoneMobile;

  const bgClass =
    bg === "dark"
      ? styles.bgDark
      : bg === "transparent"
      ? styles.bgTransparent
      : styles.bgWhite;

  return (
    <section className={`${styles.ctaSection} ${bgClass} ${className || ""}`} data-nav-theme="dark">
      <div className={styles.container}>
        <div className={styles.ctaCard}>
          {/* Subtle Ambient Radial Glow */}
          <div className={styles.glowRadial} />

          <div className={styles.cardContent}>
            <div className={styles.eyebrowBadge}>
              {eyebrowIcon || <ShieldCheck size={14} />}
              <span>{resolvedEyebrow}</span>
            </div>

            <h2 className={styles.ctaTitle}>{resolvedTitle}</h2>

            <p className={styles.ctaSubtitle}>{resolvedSubtitle}</p>

            <div className={styles.actionsRow}>
              {resolvedPrimaryBtn && (
                <Link href={resolvedPrimaryBtn.href} className={styles.primaryBtn}>
                  {resolvedPrimaryBtn.icon || <Stethoscope size={17} />}
                  <span>{resolvedPrimaryBtn.text}</span>
                </Link>
              )}

              {resolvedSecondaryBtn && (
                <Link href={resolvedSecondaryBtn.href} className={styles.secondaryBtn}>
                  <span>{resolvedSecondaryBtn.text}</span>
                  {resolvedSecondaryBtn.icon || <ArrowRight size={15} />}
                </Link>
              )}

              <a
                href={phoneHref}
                className={styles.phoneLink}
                aria-label="Tap to call Narayana Health 24×7 helpline"
              >
                <PhoneCall size={16} />
                <span className={styles.phoneDesktopLabel}>{resolvedPhoneDesktop}</span>
                <span className={styles.phoneMobileLabel}>{resolvedPhoneMobile}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


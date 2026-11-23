"use client";

import { defaultDoctorListingUrl } from "@/features/design-preview/doctorJourney";
import React from "react";
import Link from "next/link";
import { Calendar, PhoneCall, ArrowRight, ShieldCheck } from "lucide-react";
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
  phoneHref?: string;
  className?: string;
}

export default function BlogCtaBanner({
  bg = "white",
  eyebrow = "NEED PERSONALIZED MEDICAL ADVICE?",
  eyebrowIcon,
  title = "Connect with a Narayana Health Specialist Today",
  subtitle = "Whether you are seeking a primary clinical opinion, advanced surgery evaluation, or specialized preventive health screening — our 4,500+ world-class consultants are here for you.",
  primaryBtn = {
    href: "/doctors",
    text: "Book Doctor Appointment",
    icon: <Calendar size={17} />,
  },
  secondaryBtn = {
    href: "/health-packages",
    text: "Explore Health Packages",
    icon: <ArrowRight size={15} />,
  },
  phoneText = "Call 24×7: 1800 309 0309",
  phoneHref = "tel:18003090309",
  className,
}: BlogCtaBannerProps) {
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
              <span>{eyebrow}</span>
            </div>

            <h2 className={styles.ctaTitle}>{title}</h2>

            <p className={styles.ctaSubtitle}>{subtitle}</p>

            <div className={styles.actionsRow}>
              {primaryBtn && (
                <Link href={primaryBtn.href === "/doctors" ? defaultDoctorListingUrl(new URLSearchParams()) : primaryBtn.href} className={styles.primaryBtn}>
                  {primaryBtn.icon || <Calendar size={17} />}
                  <span>{primaryBtn.text}</span>
                </Link>
              )}

              {secondaryBtn && (
                <Link href={secondaryBtn.href === "/health-packages" ? "/health-checkups" : secondaryBtn.href} className={styles.secondaryBtn}>
                  <span>{secondaryBtn.text}</span>
                  {secondaryBtn.icon || <ArrowRight size={15} />}
                </Link>
              )}

              {phoneText && (
                <a href={phoneHref} className={styles.phoneLink}>
                  <PhoneCall size={16} />
                  <span>{phoneText}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

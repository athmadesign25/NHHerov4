"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, PhoneCall } from "lucide-react";
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
  isScrolled?: boolean;
}

export default function ClinicalFloatingSideActions({
  consultHref = "/doctors",
  consultLabel = "Book\nConsultation",
  conditionTitle = "your condition",
  pulseQuery,
  supportPhone = "18003090309",
  isScrolled: propIsScrolled,
}: ClinicalFloatingSideActionsProps) {
  const [internalScrolled, setInternalScrolled] = useState(false);
  const [isPulseOpen, setIsPulseOpen] = useState(false);

  useEffect(() => {
    if (propIsScrolled !== undefined) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      setInternalScrolled(scrollPos > 320);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [propIsScrolled]);

  const showActions = propIsScrolled !== undefined ? propIsScrolled : internalScrolled;

  const defaultQuery = pulseQuery || `I want to know about ${conditionTitle}: clinical guidance, diagnosis, and treatment options.`;

  // Render label with <br /> if newline is present
  const renderLabel = (text: string) => {
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

  return (
    <>
      <AnimatePresence>
        {showActions && (
          <motion.div
            className={styles.floatingSideBoxes}
            initial={{ opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            animate={{ opacity: 1, x: 0, y: "-50%", scale: 1 }}
            exit={{ opacity: 0, x: 45, y: "-50%", scale: 0.94 }}
            transition={{ type: "spring", stiffness: 380, damping: 28 }}
            role="region"
            aria-label="Quick clinical actions"
          >
            {/* Box 1: Book / Find Consultation */}
            <Link
              href={consultHref}
              className={styles.floatingBoxItem}
              title={`${consultLabel.replace("\n", " ")} for ${conditionTitle}`}
              aria-label={consultLabel.replace("\n", " ")}
            >
              <div className={styles.boxIconWrap}>
                <Calendar size={18} />
              </div>
              <span className={styles.boxLabel}>{renderLabel(consultLabel)}</span>
            </Link>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 2: Contact Support */}
            <a
              href={`tel:${supportPhone}`}
              className={styles.floatingBoxItem}
              title={`Contact Support: ${supportPhone}`}
              aria-label="Contact Support"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconSupport}`}>
                <PhoneCall size={17} />
              </div>
              <span className={styles.boxLabel}>Contact<br />Support</span>
            </a>

            <div className={styles.boxDivider} aria-hidden="true" />

            {/* Box 3: Ask Pulse AI */}
            <button
              type="button"
              className={styles.floatingBoxItem}
              onClick={() => setIsPulseOpen(true)}
              title={`Ask Pulse AI about ${conditionTitle}`}
              aria-label="Ask Pulse AI"
            >
              <div className={`${styles.boxIconWrap} ${styles.boxIconPulse}`}>
                <div className={styles.pulseLottieBox}>
                  <Lottie animationData={pulseAnimation} loop={true} />
                </div>
              </div>
              <span className={styles.boxLabel}>Ask<br />Pulse</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── PULSE AI OVERLAY ────────────────────────────────────────────── */}
      {isPulseOpen && (
        <PulseAIWorkspace
          onClose={() => setIsPulseOpen(false)}
          initialQuery={defaultQuery}
          backLabel={`Back to ${conditionTitle}`}
        />
      )}
    </>
  );
}

"use client";

import Image from "next/image";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { Award, FlaskConical, ShieldCheck, HeartHandshake, UserRound, Headset, Star } from "lucide-react";
import styles from "./WhyChooseNH.module.css";
import React from "react";


/* Interactive Bento Card with hover glow */
function BentoCard({ children, className, id, delay = 0, onMouseEnter, onMouseLeave }: { children: React.ReactNode, className: string, id: string, delay?: number, onMouseEnter?: () => void, onMouseLeave?: () => void }) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.div
      className={`${styles.card} ${className}`}
      id={id}
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      whileHover="hover"
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <motion.div
        className={styles.glow}
        style={{
          background: useMotionTemplate`radial-gradient(450px circle at ${mouseX}px ${mouseY}px, var(--card-glow-color, rgba(255,255,255,0.12)), transparent 40%)`,
        }}
      />
      <motion.div 
        className={styles.cardInner}
        variants={{
          hover: { scale: 1.02 }
        }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

export default function WhyChooseNH() {
  return (
    <section className={`section ${styles.section}`} id="why-choose-nh">
      <div className="container">
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="section-eyebrow">
            BEST IN HEALTHCARE
          </div>
          <h2 className={styles.title}>Why Choose Narayana Health?</h2>
          <p className={styles.subtitle}>
            Where your health &amp; well-being comes first, always.
          </p>
        </motion.div>

        {/* Bento Grid */}
        <div className={styles.grid}>
          {/* Left Column */}
          <div className={styles.colStack}>
            {/* JCI Enterprise */}
            <BentoCard
              className={`${styles.tallCard} ${styles.cardJciEnterprise}`}
              id="why-jci-enterprise"
              delay={0}
            >
              <div className={styles.iconBadgeBlue}>
                <Award size={28} strokeWidth={2.5} />
              </div>
              <div className={styles.contentBottom}>
                <h3 className={styles.cardTitle}>JCI Enterprise</h3>
                <p className={styles.cardDesc}>Network-wide global<br/>quality standard</p>
              </div>
            </BentoCard>

            {/* NABH */}
            <BentoCard
              className={`${styles.normalCard} ${styles.cardNabh}`}
              id="why-nabh"
              delay={0.1}
            >
              <div className={styles.iconBadgeGreen}>
                <ShieldCheck size={28} strokeWidth={2.5} />
              </div>
              <div className={styles.contentBottom}>
                <h3 className={styles.cardTitle}>NABH Accredited</h3>
                <p className={styles.cardDesc}>India&apos;s recognised<br/>hospital quality norms</p>
              </div>
            </BentoCard>
          </div>

          {/* Right Column */}
          <div className={styles.colStack}>
            {/* JCI Hospitals */}
            <BentoCard
              className={`${styles.normalCard} ${styles.cardJciHospitals}`}
              id="why-jci-hospitals"
              delay={0.2}
            >
              <div className={styles.iconBadgeGold}>
                <Star size={28} strokeWidth={2.5} />
              </div>
              <div className={styles.contentBottom}>
                <h3 className={styles.cardTitle}>JCI Accredited Hospitals</h3>
                <p className={styles.cardDesc}>International patient safety<br/>benchmarks</p>
              </div>
            </BentoCard>

            {/* CAP Labs */}
            <BentoCard
              className={`${styles.tallCard} ${styles.cardCapLabs}`}
              id="why-cap-labs"
              delay={0.3}
            >
              <div className={styles.iconBadgeGold}>
                <FlaskConical size={28} strokeWidth={2.5} className={styles.iconBadgePurpleText} />
              </div>
              <div className={styles.contentBottom}>
                <h3 className={styles.cardTitle}>CAP Accredited Labs</h3>
                <p className={styles.cardDesc}>Accurate, reliable<br/>diagnostic reports</p>
              </div>
            </BentoCard>
          </div>

          {/* Features Column (Right side rectangular cards) */}
          <div className={`${styles.colStack} ${styles.featuresColumn}`}>
            {/* Expert Doctors */}
            <BentoCard
              className={styles.featureCard}
              id="why-feature-doctors"
              delay={0.15}
            >
              <div className={styles.featureCardInner}>
                <div className={styles.iconBadgeBlueMini}>
                  <UserRound size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className={styles.featureCardTitle}>Expert Doctors</h4>
                  <p className={styles.featureCardDesc}>Highly skilled &amp; compassionate care</p>
                </div>
              </div>
            </BentoCard>

            {/* Advanced Technology */}
            <BentoCard
              className={styles.featureCard}
              id="why-feature-tech"
              delay={0.2}
            >
              <div className={styles.featureCardInner}>
                <div className={styles.iconBadgeBlueMini}>
                  <HeartHandshake size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className={styles.featureCardTitle}>Advanced Technology</h4>
                  <p className={styles.featureCardDesc}>Cutting-edge facilities for better outcomes</p>
                </div>
              </div>
            </BentoCard>

            {/* Patient Safety */}
            <BentoCard
              className={styles.featureCard}
              id="why-feature-safety"
              delay={0.25}
            >
              <div className={styles.featureCardInner}>
                <div className={styles.iconBadgeBlueMini}>
                  <ShieldCheck size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className={styles.featureCardTitle}>Patient Safety</h4>
                  <p className={styles.featureCardDesc}>Your safety is our top priority</p>
                </div>
              </div>
            </BentoCard>

            {/* Always Here */}
            <BentoCard
              className={styles.featureCard}
              id="why-feature-always"
              delay={0.3}
            >
              <div className={styles.featureCardInner}>
                <div className={styles.iconBadgeBlueMini}>
                  <Headset size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <h4 className={styles.featureCardTitle}>Always Here</h4>
                  <p className={styles.featureCardDesc}>24x7 care &amp; support</p>
                </div>
              </div>
            </BentoCard>
          </div>
        </div>

        {/* Mobile Features (Only visible on screens <= 768px) */}
        <div className={styles.mobileFeatures}>
          <div className={styles.mobileFeatureItem}>
            <div className={styles.iconBadgeBlueMini}>
              <UserRound size={22} strokeWidth={2.5} />
            </div>
            <div className={styles.mobileFeatureText}>
              <h4 className={styles.mobileFeatureTitle}>Expert Doctors</h4>
              <p className={styles.mobileFeatureDesc}>Highly skilled &amp; compassionate care</p>
            </div>
          </div>

          <div className={styles.mobileFeatureItem}>
            <div className={styles.iconBadgeBlueMini}>
              <HeartHandshake size={22} strokeWidth={2.5} />
            </div>
            <div className={styles.mobileFeatureText}>
              <h4 className={styles.mobileFeatureTitle}>Advanced Technology</h4>
              <p className={styles.mobileFeatureDesc}>Cutting-edge facilities for better outcomes</p>
            </div>
          </div>

          <div className={styles.mobileFeatureItem}>
            <div className={styles.iconBadgeBlueMini}>
              <ShieldCheck size={22} strokeWidth={2.5} />
            </div>
            <div className={styles.mobileFeatureText}>
              <h4 className={styles.mobileFeatureTitle}>Patient Safety</h4>
              <p className={styles.mobileFeatureDesc}>Your safety is our top priority</p>
            </div>
          </div>

          <div className={styles.mobileFeatureItem}>
            <div className={styles.iconBadgeBlueMini}>
              <Headset size={22} strokeWidth={2.5} />
            </div>
            <div className={styles.mobileFeatureText}>
              <h4 className={styles.mobileFeatureTitle}>Always Here</h4>
              <p className={styles.mobileFeatureDesc}>24x7 care &amp; support</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

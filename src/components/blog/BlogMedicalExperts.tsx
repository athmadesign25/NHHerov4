"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useTransform, useMotionValue, MotionValue } from "framer-motion";
import { ArrowRight, Award } from "lucide-react";
import TextSweepEffect from "@/components/ui/TextSweepEffect";
import styles from "./BlogMedicalExperts.module.css";

interface ExpertDoctor {
  name: string;
  speciality: string;
  experience: string;
  hospital: string;
  image: string;
  articlesCount: number;
}

interface BlogMedicalExpertsProps {
  scrollYProgress?: MotionValue<number>;
}

const EXPERT_DOCTORS: ExpertDoctor[] = [
  {
    name: "Dr. Devi Prasad Shetty",
    speciality: "Chairman & Senior Cardiac Surgeon",
    experience: "35+ Years Experience",
    hospital: "Narayana Institute of Cardiac Sciences, Bangalore",
    image: "/doctor_patient.png",
    articlesCount: 14,
  },
  {
    name: "Dr. Arun Krishnan",
    speciality: "Director - Medical Oncology",
    experience: "18+ Years Experience",
    hospital: "Mazumdar Shaw Medical Centre, Bangalore",
    image: "/assets/doctor_1.png",
    articlesCount: 11,
  },
  {
    name: "Dr. Gourav Goyal",
    speciality: "Consultant Neurologist & Stroke Specialist",
    experience: "15+ Years Experience",
    hospital: "Narayana Multispeciality Hospital, Bangalore",
    image: "/assets/doctor_1.png",
    articlesCount: 9,
  },
  {
    name: "Dr. Kavita Reddy",
    speciality: "Senior Consultant - Nephrology & Renal Care",
    experience: "16+ Years Experience",
    hospital: "Narayana Health City, Bangalore",
    image: "/assets/doctor_1.png",
    articlesCount: 8,
  },
];

export default function BlogMedicalExperts({ scrollYProgress }: BlogMedicalExpertsProps) {
  const fallbackProgress = useMotionValue(0);
  const activeProgress = scrollYProgress || fallbackProgress;

  const titleColor = useTransform(
    activeProgress,
    [0, 0.5, 1],
    ["#0f172a", "#ffffff", "#ffffff"]
  );
  const subtitleColor = useTransform(
    activeProgress,
    [0, 0.5, 1],
    ["#64748b", "rgba(255, 255, 255, 0.75)", "rgba(255, 255, 255, 0.75)"]
  );
  const linkTextColor = useTransform(
    activeProgress,
    [0, 0.5, 1],
    ["#034EA2", "#38bdf8", "#38bdf8"]
  );
  const linkBorderColor = useTransform(
    activeProgress,
    [0, 0.5, 1],
    ["rgba(3, 78, 162, 0.16)", "rgba(56, 189, 248, 0.32)", "rgba(56, 189, 248, 0.32)"]
  );
  const linkBgColor = useTransform(
    activeProgress,
    [0, 0.5, 1],
    ["rgba(3, 78, 162, 0.05)", "rgba(56, 189, 248, 0.10)", "rgba(56, 189, 248, 0.10)"]
  );

  return (
    <section className={styles.expertsSection} data-nav-theme="light">
      <div className={styles.container}>
        {/* Section Header (Centered Consistency) */}
        <div className={styles.sectionHeader}>
          <motion.h2
            className={styles.sectionTitle}
            style={{
              color: titleColor,
              ["--sweep-final-color" as string]: titleColor,
            }}
          >
            <TextSweepEffect
              words={["Authored & Verified by Leading Medical Experts"]}
              sweepMs={1400}
              finalColor="var(--sweep-final-color, #0f172a)"
            />
          </motion.h2>
          <motion.p
            className={styles.sectionSubtitle}
            style={{ color: subtitleColor }}
          >
            Every health guide, symptom breakdown, and treatment explanation on Narayana Health is written or clinically reviewed by senior department heads, surgeons, and specialists.
          </motion.p>
        </div>

        {/* Doctor Cards Grid (Exact refDoctorCard style) */}
        <div className={styles.doctorsGrid}>
          {EXPERT_DOCTORS.map((doc, idx) => (
            <motion.div
              key={doc.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className={styles.refDoctorCard}
            >
              <Image
                src={doc.image}
                alt={doc.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={styles.refDocFullImage}
              />
              <div className={styles.refDocFullGradient} />

              <div className={styles.refDocOverlayContent}>
                <div className={styles.refDocBottomFlex}>
                  <div className={styles.refDocTextCol}>
                    <h3 className={styles.refDocName} title={doc.name}>
                      {doc.name}
                    </h3>
                    <div className={styles.refDocSpecialty}>{doc.speciality}</div>
                    <div className={styles.refDocExpRow}>
                      <Award size={12} className={styles.refDocExpIcon} />
                      <span>{doc.experience}</span>
                    </div>
                    <div className={styles.refDocHospital} title={doc.hospital}>
                      {doc.hospital}
                    </div>
                  </div>

                  <Link href="/doctors" className={styles.refBookBtnWhite}>
                    Consult
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Centered Clickable Text CTA (Clean Text Only, No Button Frame) */}
        <div className={styles.centerActionWrap}>
          <motion.a
            href="/doctors"
            className={styles.viewAllTextLink}
            style={{
              color: linkTextColor,
              borderColor: linkBorderColor,
              backgroundColor: linkBgColor,
            }}
          >
            <span>View all specialists</span>
            <motion.span
              style={{ color: linkTextColor, display: "inline-flex" }}
              aria-hidden="true"
            >
              <ArrowRight size={16} className={styles.textLinkArrow} />
            </motion.span>
          </motion.a>
        </div>
      </div>
    </section>
  );
}


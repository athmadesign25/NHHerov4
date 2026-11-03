"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Award, Stethoscope } from "lucide-react";
import styles from "./BlogMedicalExperts.module.css";

interface ExpertDoctor {
  name: string;
  speciality: string;
  experience: string;
  hospital: string;
  image: string;
  articlesCount: number;
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

export default function BlogMedicalExperts() {
  return (
    <section className={styles.expertsSection} data-nav-theme="light">
      <div className={styles.container}>
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.eyebrowBadge}>
              <Stethoscope size={14} />
              <span>CLINICAL ADVISORY BOARD</span>
            </div>
            <h2 className={styles.sectionTitle}>
              Authored &amp; Verified by Leading Medical Experts
            </h2>
            <p className={styles.sectionSubtitle}>
              Every health guide, symptom breakdown, and treatment explanation on Narayana Health is written or clinically reviewed by senior department heads, surgeons, and specialists.
            </p>
          </div>

          <Link href="/doctors" className={styles.viewAllDoctorsLink}>
            <span>View All 4,500+ Specialists</span>
            <ArrowRight size={15} />
          </Link>
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
      </div>
    </section>
  );
}


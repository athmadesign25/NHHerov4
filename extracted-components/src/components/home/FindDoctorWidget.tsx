"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Stethoscope, ChevronRight } from "lucide-react";
import styles from "./FindDoctorWidget.module.css";

const specialities = [
  "Cardiology", "Neurology", "Oncology", "Orthopaedics",
  "Paediatrics", "Gastroenterology", "Ophthalmology", "ENT",
];

const cities = [
  "Bangalore", "Kolkata", "Mumbai", "Delhi", "Hyderabad",
  "Chennai", "Ahmedabad", "Pune",
];

export default function FindDoctorWidget() {
  const [name, setName] = useState("");
  const [speciality, setSpeciality] = useState("");
  const [city, setCity] = useState("");

  return (
    <section className={`section ${styles.section}`} id="find-doctor-widget">
      <div className="container">
        <motion.div
          className={styles.card}
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className="section-eyebrow">Find Your Doctor</div>
              <h2 className={styles.title}>Book an Appointment</h2>
              <p className={styles.subtitle}>
                Search from 3,000+ specialists across 24 hospitals in India.
              </p>
            </div>
            <div className={styles.headerDecor} />
          </div>

          <div className={styles.form}>
            {/* Name */}
            <div className={styles.field}>
              <label htmlFor="doctor-name" className={styles.label}>
                <Search size={14} />
                Doctor Name
              </label>
              <input
                id="doctor-name"
                type="text"
                placeholder="e.g. Dr. Sharma, Dr. Verma..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={styles.input}
              />
            </div>

            {/* Speciality */}
            <div className={styles.field}>
              <label htmlFor="doctor-speciality" className={styles.label}>
                <Stethoscope size={14} />
                Speciality
              </label>
              <select
                id="doctor-speciality"
                value={speciality}
                onChange={(e) => setSpeciality(e.target.value)}
                className={styles.select}
              >
                <option value="">All Specialities</option>
                {specialities.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className={styles.field}>
              <label htmlFor="doctor-city" className={styles.label}>
                <MapPin size={14} />
                City / Hospital
              </label>
              <select
                id="doctor-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className={styles.select}
              >
                <option value="">All Cities</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* CTA */}
            <Link
              href="/doctors"
              className={styles.searchBtn}
              id="find-doctor-search-btn"
            >
              <Search size={18} />
              Find Doctor
            </Link>
          </div>

          <div className={styles.quickLinks}>
            <span className={styles.quickLabel}>Popular:</span>
            {specialities.slice(0, 5).map((s) => (
              <Link key={s} href="/doctors" className={styles.chip} id={`quick-spec-${s.toLowerCase()}`}>
                {s}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Emergency CTA */}
        <motion.div
          className={styles.emergency}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className={styles.emergencyDot} />
          <span>For medical emergencies, call immediately:</span>
          <a href="tel:18001030" className={styles.emergencyNumber} id="find-doctor-emergency">
            1800-103-0
            <ChevronRight size={14} />
          </a>
        </motion.div>
      </div>
    </section>
  );
}

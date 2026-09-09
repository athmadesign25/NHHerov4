"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Globe, Plane, Phone, ChevronRight } from "lucide-react";
import styles from "./InternationalSection.module.css";

const features = [
  { id: "intl-concierge", icon: Plane, title: "Airport Pickup", desc: "Dedicated transport from any major Indian airport" },
  { id: "intl-translator", icon: Globe, title: "100+ Languages", desc: "Multilingual patient coordinators available 24/7" },
  { id: "intl-telemedicine", icon: Phone, title: "Pre-Arrival Consult", desc: "Virtual consultation before your visit" },
];

const countries = ["USA", "UK", "UAE", "Kenya", "Nigeria", "Bangladesh", "Sri Lanka", "Maldives"];

export default function InternationalSection() {
  return (
    <section className={styles.section} id="international-patients">
      <div className="container">
        <div className={styles.inner}>
          {/* Left */}
          <motion.div
            className={styles.left}
            initial={{ opacity: 0, x: -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <div className={styles.eyebrow}>International Patients</div>
            <h2 className={styles.title}>
              World-Class Care,<br />
              <span className={styles.titleHighlight}>Without Borders</span>
            </h2>
            <p className={styles.desc}>
              Over 64,000 international patients from 78 nationalities trust Narayana Health 
              every year. Our dedicated International Patient Services team handles everything 
              from visa assistance to post-treatment follow-up.
            </p>

            <div className={styles.features}>
              {features.map((f, i) => (
                <motion.div
                  key={f.id}
                  className={styles.feature}
                  id={f.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                >
                  <div className={styles.featureIcon}>
                    <f.icon size={20} />
                  </div>
                  <div>
                    <div className={styles.featureTitle}>{f.title}</div>
                    <div className={styles.featureDesc}>{f.desc}</div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className={styles.actions}>
              <Link href="/" className={styles.primaryBtn} id="intl-enquiry">
                Make an Enquiry
                <ChevronRight size={16} />
              </Link>
              <a href="tel:+918028003456" className={styles.secondaryBtn} id="intl-phone">
                <Phone size={15} />
                +91-80-2800-3456
              </a>
            </div>
          </motion.div>

          {/* Right */}
          <motion.div
            className={styles.right}
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
          >
            <div className={styles.statsCard}>
              <div className={styles.statBig}>78</div>
              <div className={styles.statBigLabel}>Nationalities Served</div>
              <div className={styles.statBigSub}>from across the globe</div>
            </div>

            <div className={styles.countriesWrap}>
              <div className={styles.countriesLabel}>Patients from</div>
              <div className={styles.countries}>
                {countries.map((c) => (
                  <div key={c} className={styles.countryChip}>{c}</div>
                ))}
                <div className={styles.countryChip}>+70 more</div>
              </div>
            </div>

            <div className={styles.accreditCard}>
              <div className={styles.accreditIcon}>
                <Globe size={20} />
              </div>
              <div>
                <div className={styles.accreditTitle}>JCI Accredited</div>
                <div className={styles.accreditSub}>Joint Commission International Gold Standard</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

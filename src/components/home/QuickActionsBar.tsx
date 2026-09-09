"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Search, Stethoscope, Building2, ClipboardCheck, ChevronRight } from "lucide-react";
import styles from "./QuickActionsBar.module.css";

const actions = [
  {
    id: "quick-find-doctor",
    icon: Search,
    title: "Find a Doctor",
    desc: "Search by name, speciality, or location",
    href: "/doctors",
    color: "#034EA2",
  },
  {
    id: "quick-specialities",
    icon: Stethoscope,
    title: "Specialities",
    desc: "Explore 30+ medical specialities",
    href: "/specialities/cardiology",
    color: "#1565C0",
  },
  {
    id: "quick-hospitals",
    icon: Building2,
    title: "Our Hospitals",
    desc: "Find the nearest NH facility",
    href: "/",
    color: "#034EA2",
  },
  {
    id: "quick-health-check",
    icon: ClipboardCheck,
    title: "Health Packages",
    desc: "Comprehensive preventive care plans",
    href: "/",
    color: "#1565C0",
  },
];

export default function QuickActionsBar() {
  return (
    <section className={styles.section} id="quick-actions">
      <div className="container">
        <div className={styles.grid}>
          {actions.map((action, i) => (
            <motion.div
              key={action.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: "easeOut" }}
            >
              <Link href={action.href} className={styles.card} id={action.id}>
                <div className={styles.iconWrap} style={{ "--icon-color": action.color } as React.CSSProperties}>
                  <action.icon size={24} />
                </div>
                <div className={styles.text}>
                  <div className={styles.title}>{action.title}</div>
                  <div className={styles.desc}>{action.desc}</div>
                </div>
                <ChevronRight size={18} className={styles.arrow} />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

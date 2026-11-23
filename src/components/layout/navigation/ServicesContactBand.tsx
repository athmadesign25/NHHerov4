"use client";

import { doctorNavUrl } from "@/features/search/navigationEntries";
import Link from "next/link";
import { motion } from "framer-motion";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import { TriangleAlert } from "@/components/animate-ui/icons/hugeicons/triangle-alert";
import { EDITORIAL_CONTACT } from "./editorial-menu-data";
import styles from "./ServicesContactBand.module.css";

const MotionLink = motion.create(Link);

export default function ServicesContactBand({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  return <ul className={`${styles.band} ${mobile ? styles.mobile : ""}`} aria-label="Call and emergency support">
    <li><motion.a href={EDITORIAL_CONTACT.phoneHref} onClick={onNavigate} initial="initial" whileHover="animate" whileFocus="animate" aria-label="Call Us on 18003090309"><PhoneCall animateOnHover /><span className={styles.label}><span>Call Us</span><span>18003090309</span></span></motion.a></li>
    <li><MotionLink href={EDITORIAL_CONTACT.emergencyHref} onClick={onNavigate} className={styles.emergency} initial="initial" whileHover="animate" whileFocus="animate"><TriangleAlert animateOnHover /><span className={styles.label}>24/7 Emergency</span></MotionLink></li>
    <li><Link href={doctorNavUrl()} onClick={onNavigate} className={styles.bookAppointment}>Book Appointment</Link></li>
  </ul>;
}

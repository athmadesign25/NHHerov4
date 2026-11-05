"use client";

import { doctorNavUrl } from "@/features/search/navigationEntries";
import Link from "next/link";
import { motion } from "framer-motion";
import { TriangleAlert } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import { EDITORIAL_CONTACT } from "./editorial-menu-data";
import styles from "./ServicesContactBand.module.css";

export default function ServicesContactBand({ onNavigate, mobile = false }: { onNavigate: () => void; mobile?: boolean }) {
  return <ul className={`${styles.band} ${mobile ? styles.mobile : ""}`} aria-label="Call and emergency support">
    <li><motion.a href={EDITORIAL_CONTACT.phoneHref} onClick={onNavigate} initial="initial" whileHover="animate" whileFocus="animate" aria-label="Call Us on 18003090309"><PhoneCall animateOnHover /><span>Call Us</span><span>18003090309</span></motion.a></li>
    <li><Link href={mobile ? EDITORIAL_CONTACT.phoneHref : EDITORIAL_CONTACT.emergencyHref} onClick={onNavigate} className={styles.emergency}><TriangleAlert aria-hidden="true" /><span>24/7 Emergency</span></Link></li>
    <li><Link href={doctorNavUrl()} onClick={onNavigate} className={styles.bookAppointment}>Book Appointment</Link></li>
  </ul>;
}

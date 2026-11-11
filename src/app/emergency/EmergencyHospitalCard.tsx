"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import styles from "./EmergencyPage.module.css";

interface Hospital {
  id: number;
  name: string;
  city: string;
  address: string;
  slug: string;
}

/** Specialty HospitalCard composition, using the emergency directory's own data. */
export default function EmergencyHospitalCard({ hospital }: { hospital: Hospital }) {
  const image = hospital.id === 38 ? "/emergency/mazumdar-shaw.webp" : hospital.id === 32 ? "/emergency/hsr-hospital.webp" : `/emergency/hospital-${hospital.id}.webp`;
  return <article className={styles.photoCard}>
    <Image src={image} alt={hospital.name} fill sizes="(max-width: 768px) 85vw, 512px" />
    <div className={styles.photoCardShade} aria-hidden="true" />
    <div className={styles.photoCardCopy}>
      <h3><Link href={`https://www.narayanahealth.org/${hospital.slug}`}>{hospital.name}</Link></h3>
      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address || hospital.name)}`} target="_blank" rel="noopener noreferrer" className={styles.hospitalAddress}><MapPin aria-hidden="true" /><span>{hospital.address || hospital.city}</span></a>
      <div className={styles.cardActions}><Link href={`/search?q=${encodeURIComponent(hospital.name)}`} className={styles.primaryButton}>Book Appointment</Link><a href="tel:18003090309" className={styles.glassIcon} aria-label={`Call emergency care at ${hospital.name}`}><PhoneCall animateOnHover /></a></div>
    </div>
  </article>;
}

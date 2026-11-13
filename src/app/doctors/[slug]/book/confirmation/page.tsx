"use client";

import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDesign20BookingDoctor, getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design20DoctorRecoveryUrl } from "@/features/search/design20BookingEntry";
import Design20BookingFlow from "@/features/booking/design20/Design20BookingFlow";
import styles from "@/features/booking/design17/Booking.module.css";

function BookingRoute({ slug }: { slug: string }) {
  const params = useSearchParams();
  const source = getDesign20BookingDoctor(slug, params.get("name"));
  const listing = getDesign20ProfileDoctor(slug, params);
  if (!source || !listing) return <div className={styles.page} data-design17-booking="d20"><div className={styles.container}><section className={styles.panel}>
    <h1>Choose a doctor to continue</h1><p>We couldn’t find this doctor’s booking details. Find an available doctor in the directory.</p>
    <Link href={design20DoctorRecoveryUrl(params)} className={styles.primary}>Find a doctor</Link>
  </section></div></div>;
  const doctor = { ...source, name: listing.name, hospital: listing.hospital, city: listing.city, fee: listing.fee };
  return <Design20BookingFlow key={`${slug}-d20${params.get("ref")}`} doctor={doctor} confirmationRef={params.get("ref") ?? ""} />;
}

export default function BookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  return <Suspense fallback={<div className={styles.page} role="status">Preparing your appointment…</div>}><BookingRoute slug={slug} /></Suspense>;
}

"use client";
import { Suspense, use } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getDesign20ProfileDoctor } from "@/features/search/design20Directory";
import { design20ListingReturnTo } from "@/features/booking/design20/model";
import { design20DoctorRecoveryUrl } from "@/features/search/design20BookingEntry";
import DoctorProfileView from "./DoctorProfileView";
import styles from "@/features/booking/design17/Booking.module.css";
function ProfileRoute({ slug }: { slug: string }) {
 const params = useSearchParams();
 const doctor = getDesign20ProfileDoctor(slug, params);
 if (!doctor) return <main className={styles.page}><div className={styles.container}><h1>Find your doctor</h1><Link href={design20DoctorRecoveryUrl(params)}>Browse doctors</Link></div></main>;
 return <DoctorProfileView key={`${doctor.id}-${doctor.hospital}-${params.get("mode")}`} doctor={doctor} returnTo={design20ListingReturnTo(params.get("returnTo") ?? "")} initialMode={params.get("mode") === "video" ? "video" : "hospital"} date={params.get("date") ?? ""} />;
}
export default function DoctorPage({ params }: { params: Promise<{ slug: string }> }) {
 const { slug } = use(params);
 return <Suspense fallback={<main className={styles.page} role="status">Loading doctor…</main>}><ProfileRoute slug={slug} /></Suspense>;
}

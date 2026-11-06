import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { permanentRedirect } from "next/navigation";
import { getDesign20ProfileDoctor, getDesign20DirectoryDoctor } from "@/features/search/design20Directory";
import { design20ListingReturnTo } from "@/features/booking/design20/model";
import { design20DoctorRecoveryUrl } from "@/features/search/design20BookingEntry";
import { doctorProfilePath, doctorProfileQuery, doctorProfileSlug } from "@/features/search/doctorProfileUrl";
import { getDoctorProfileMetadata } from "@/features/search/doctorProfileMetadata";
import { capturedProfileToDoctor, getCapturedDoctorProfile, getCapturedDoctorProfileBySlug } from "@/features/search/doctorProfileSource";
import DoctorProfileView from "./DoctorProfileView";
import DoctorProfileDesign2 from "./design2/DoctorProfileDesign2";
import styles from "@/features/booking/design17/Booking.module.css";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  // Use the primary directory identity, not a query-selected hospital or user-supplied copy.
  const captured = getCapturedDoctorProfileBySlug(slug);
  const doctor = getDesign20DirectoryDoctor(slug, captured ? null : doctorProfileQuery(query).get("name")) ?? (captured ? capturedProfileToDoctor(captured) : null);
  return getDoctorProfileMetadata(doctor);
}

export default async function DoctorPage({ params, searchParams }: Props) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const values = doctorProfileQuery(query);
  const captured = getCapturedDoctorProfileBySlug(slug);
  if (captured) values.delete("name");
  const doctor = getDesign20ProfileDoctor(slug, values) ?? (captured ? capturedProfileToDoctor(captured) : null);
  if (!doctor) return <main className={styles.page}><div className={styles.container}>
    <h1>Find your doctor</h1><Link href={design20DoctorRecoveryUrl(values)}>Browse doctors</Link>
  </div></main>;

  if (slug !== doctorProfileSlug(doctor)) {
    const search = values.toString();
    permanentRedirect(`${doctorProfilePath(doctor)}${search ? `?${search}` : ""}`);
  }
  const Profile = values.get("profileDesign") === "1" ? DoctorProfileView : DoctorProfileDesign2;
  return <Suspense fallback={<main className={styles.page} role="status">Loading doctor…</main>}>
    <Profile key={`${doctor.id}-${doctor.hospital}-${values.get("mode")}`} doctor={doctor} source={captured ?? getCapturedDoctorProfile(doctor)}
      returnTo={design20ListingReturnTo(values.get("returnTo") ?? "")}
      initialMode={values.get("mode") === "video" ? "video" : "hospital"} date={values.get("date") ?? ""} />
  </Suspense>;
}

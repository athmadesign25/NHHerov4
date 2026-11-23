import type { Metadata } from "next";
import { doctorProfilePath } from "./doctorProfileUrl";
import type { DoctorListingItem } from "./doctorListing";

export function getDoctorProfileMetadata(doctor: DoctorListingItem | null): Metadata {
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.narayanahealth.org");
  if (!doctor) return {
    title: "Find your doctor | Narayana Health",
    description: "Browse Narayana Health doctors and find the right specialist for your appointment.",
    robots: { index: false, follow: true },
  };
  const speciality = doctor.speciality.split(/[,|]/)[0].trim();
  const location = doctor.city ? ` in ${doctor.city}` : "";
  const title = `${doctor.name}${speciality ? ` – ${speciality}${location}` : location} | Narayana Health`;
  const description = `Learn about ${doctor.name}${speciality ? `, ${speciality}${location}` : location}. Explore qualifications, clinical expertise, consultation locations and appointment options at Narayana Health.`;
  const canonical = new URL(doctorProfilePath(doctor), metadataBase).toString();
  return {
    metadataBase,
    title,
    description,
    alternates: { canonical },
    // Keep the existing preview indexing gate: portraits, experience and availability
    // still contain demonstration data. Enable indexing only after content approval.
    robots: { index: false, follow: true },
    openGraph: { title, description, url: canonical, type: "profile" },
  };
}

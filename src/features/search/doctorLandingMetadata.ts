import type { Metadata } from "next";
import { canIndexDoctorLanding, getDoctorLandingCopy, getDoctorLandingPath, type DoctorLandingContext } from "./doctorLandingPages";

export function getDoctorLandingMetadata(context: DoctorLandingContext): Metadata {
  const { heading, summary } = getDoctorLandingCopy(context);
  const title = `${heading} | Narayana Health`;
  const metadataBase = new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.narayanahealth.org");
  const canonical = new URL(getDoctorLandingPath(context.speciality?.slug, context.city?.slug), metadataBase).toString();
  // Launch dependency: replace this closed gate only when an approved, verified
  // doctor-to-page mapping source exists. Preview records are not verification.
  const index = canIndexDoctorLanding({ approved: false, verifiedDoctorCount: 0 });
  return {
    metadataBase,
    title,
    description: summary,
    alternates: { canonical },
    robots: { index, follow: true },
    openGraph: { title, description: summary, url: canonical, type: "website" },
  };
}

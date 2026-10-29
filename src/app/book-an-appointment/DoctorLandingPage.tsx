import { connection } from "next/server";
import { notFound } from "next/navigation";
import DoctorLandingPreview from "./DoctorLandingPreview";
import { searchDoctorsData } from "@/app/search/mockDoctors";
import { design3CityDoctors } from "@/features/search/design3CityDoctors";
import { getDoctorLandingContext, hasDoctorLandingDoctors } from "@/features/search/doctorLandingPages";
import type { SearchCatalogs } from "@/features/search/design3Data";

const previewDirectory = [...searchDoctorsData, ...design3CityDoctors];
const catalogs: SearchCatalogs = { hospitals: [], treatments: [], packages: [], labs: [], articles: [] };

export function resolveDoctorLanding(pathname: string) {
  const context = getDoctorLandingContext(pathname);
  if (!context || !hasDoctorLandingDoctors(context, previewDirectory)) notFound();
  return context;
}

export default async function DoctorLandingPage({ pathname }: { pathname: string }) {
  resolveDoctorLanding(pathname);
  // Render the current journey or an explicitly selected development preview.
  await connection();
  return <DoctorLandingPreview catalogs={catalogs} />;
}

import { redirect } from "next/navigation";
import { DEFAULT_DOCTOR_DESIGN } from "@/features/design-preview/doctorJourney";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FindADoctorRedirectPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedParams)) {
    for (const item of Array.isArray(value) ? value : value ? [value] : []) params.append(key, item);
  }
  params.set("design", DEFAULT_DOCTOR_DESIGN);
  // The canonical doctor entry handles legacy city/speciality query aliases.
  redirect(`/doctors?${params}`);
}

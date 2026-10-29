import { redirect } from "next/navigation";
import { defaultDoctorListingUrl } from "@/features/design-preview/doctorJourney";

interface DoctorsPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Keep existing bookmarks and public links on the current doctor directory. */
export default async function DoctorsPage({ searchParams }: DoctorsPageProps) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(await searchParams)) {
    for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  }
  redirect(defaultDoctorListingUrl(params));
}

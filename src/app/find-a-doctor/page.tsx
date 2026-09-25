import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function FindADoctorRedirectPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const q = resolvedParams.q ? `?q=${encodeURIComponent(String(resolvedParams.q))}` : "";
  redirect(`/doctors${q}`);
}

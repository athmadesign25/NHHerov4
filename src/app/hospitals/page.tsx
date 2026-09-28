import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function HospitalsRedirectPage({ searchParams }: PageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const q = resolvedParams.q ? `&q=${encodeURIComponent(String(resolvedParams.q))}` : "";
  redirect(`/search?tab=doctors${q}`);
}

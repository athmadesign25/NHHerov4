import { redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HealthPackageRedirectPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const supplied = searchParams ? await searchParams : {};
  const query = new URLSearchParams({ item: slug });
  for (const key of ["location", "hospital"] as const) {
    const value = supplied[key];
    if (typeof value === "string" && value.trim()) query.set(key, value.trim());
  }
  redirect(`/health-checkups?${query}`);
}

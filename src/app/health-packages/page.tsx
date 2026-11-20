import { redirect } from "next/navigation";

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HealthPackagesRedirectPage({ searchParams }: PageProps) {
  const supplied = searchParams ? await searchParams : {};
  const query = new URLSearchParams();
  for (const key of ["q", "location", "hospital", "item"] as const) {
    const value = supplied[key];
    if (typeof value === "string" && value.trim()) query.set(key, value.trim());
  }
  redirect(`/health-checkups${query.size ? `?${query}` : ""}`);
}

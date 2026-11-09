import type { Metadata } from "next";
import { Suspense } from "react";
import HealthCheckups from "@/features/health-checkups/HealthCheckups";

export const metadata: Metadata = {
  title: "Health Checkups & Lab Tests | Narayana Health",
  description: "Explore health packages and lab tests at Narayana Health, select your centre and complete your booking.",
  robots: { index: false, follow: false },
};

export default function HealthCheckupsPage() {
  return <Suspense fallback={<p role="status">Loading health checkups…</p>}><HealthCheckups /></Suspense>;
}

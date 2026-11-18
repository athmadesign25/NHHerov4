import { Suspense } from "react";
import type { Metadata } from "next";
import { masterDoctor, masterProfile } from "@/features/search/doctorProfileMaster";
import DoctorProfileDesign2 from "../[slug]/design2/DoctorProfileDesign2";

export const metadata: Metadata = {
  title: "Master doctor profile preview | Narayana Health",
  description: "Complete doctor profile structure with clearly labelled sample content.",
  robots: { index: false, follow: false },
};

export default function MasterDoctorProfilePage() {
  return <Suspense fallback={<main role="status">Loading master profile…</main>}>
    <DoctorProfileDesign2 doctor={masterDoctor} source={masterProfile} returnTo="/search/doctors?design=d21"
      initialMode="hospital" date="" />
  </Suspense>;
}

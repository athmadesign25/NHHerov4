"use client";
import RotatingSearchHint from "@/components/ui/search-location/RotatingSearchHint";
const terms = ["doctor name", "speciality", "hospital"] as const;
export default function DoctorSearchHint({ active, paused }: { active: boolean; paused: boolean }) {
  return <RotatingSearchHint active={active} paused={paused} prefix="Search by" terms={terms} />;
}

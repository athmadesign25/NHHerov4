import type { Metadata } from "next";
import EmergencyPage from "./EmergencyPage";

export const metadata: Metadata = {
  title: "24/7 Emergency Care | Narayana Health",
  description: "Emergency care at Narayana Health, with trained teams, ambulance support and specialist access around the clock. Find conditions, procedures and hospitals.",
};

export default function Page() {
  return <EmergencyPage />;
}

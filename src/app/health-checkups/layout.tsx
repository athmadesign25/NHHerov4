import type { ReactNode } from "react";
import HealthEntryGate from "@/features/health-checkups/HealthEntryGate";

export default function HealthCheckupsLayout({ children }: { children: ReactNode }) {
  return <HealthEntryGate>{children}</HealthEntryGate>;
}

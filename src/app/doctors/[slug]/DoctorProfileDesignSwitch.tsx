"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import styles from "./DoctorProfileDesignSwitch.module.css";

/** Keep the profile exploration independent of the booking design parameter. */
export default function DoctorProfileDesignSwitch({ active, tone = "light" }: { active: 1 | 2; tone?: "light" | "dark" }) {
  const pathname = usePathname();
  const query = useSearchParams();
  return <nav className={styles.switcher} aria-label="Profile design preview" data-tone={tone}>
    {([1, 2] as const).map(design => {
      const params = new URLSearchParams(query.toString());
      params.set("profileDesign", String(design));
      return <Link key={design} href={`${pathname}?${params.toString()}`} aria-current={design === active ? "page" : undefined}>Design {design}</Link>;
    })}
  </nav>;
}

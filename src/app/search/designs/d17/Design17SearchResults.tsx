"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "./DoctorCard";
import styles from "./Design17SearchResults.module.css";

/** Design 17 keeps the established discovery flow with its own doctor cards. */
export default function Design17SearchResults({ catalogs, variant = "d17" }: { catalogs: SearchCatalogs; variant?: "d17" | "d17-lite" }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant={variant} cardComponent={DoctorCard} gridClassName={styles.grid} />;
}

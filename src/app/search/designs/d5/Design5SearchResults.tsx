"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "./DoctorCard";
import styles from "./Design5SearchResults.module.css";

/** Reuse the established search flows; keep this card exploration isolated. */
export default function Design5SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant="d5" cardComponent={DoctorCard} gridClassName={styles.grid} />;
}

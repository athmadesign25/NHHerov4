"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "../d17/DoctorCard";
import styles from "../d17/Design17SearchResults.module.css";

export default function Design18SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant="d18" cardComponent={DoctorCard} gridClassName={styles.grid} />;
}

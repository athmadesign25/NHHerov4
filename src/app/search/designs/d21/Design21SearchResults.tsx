"use client";
import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "../d20/DoctorCard";
import styles from "../d17/Design17SearchResults.module.css";

export default function Design21SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant="d21" cardComponent={DoctorCard} gridClassName={styles.grid} />;
}

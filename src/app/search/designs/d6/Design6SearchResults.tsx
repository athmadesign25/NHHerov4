"use client";

import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "./DoctorCard";
import styles from "./Design6SearchResults.module.css";

/** The shared search flow with Design 6's portrait and glass cards. */
export default function Design6SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant="d6" cardComponent={DoctorCard} gridClassName={styles.grid} />;
}

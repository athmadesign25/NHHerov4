"use client";

import type { ComponentProps } from "react";
import type { SearchCatalogs } from "@/features/search/design3Data";
import Design3SearchResults from "../d3/Design3SearchResults";
import DoctorCard from "../d6/DoctorCard";
import styles from "../d6/Design6SearchResults.module.css";

function Design16Card(props: ComponentProps<typeof DoctorCard>) {
  return <DoctorCard {...props} previewVariant="d16" />;
}

/** Design 6 unchanged visually, with an opt-in location-first search toolbar. */
export default function Design16SearchResults({ catalogs }: { catalogs: SearchCatalogs }) {
  return <Design3SearchResults catalogs={catalogs} previewVariant="d16" cardComponent={Design16Card} gridClassName={styles.grid} />;
}

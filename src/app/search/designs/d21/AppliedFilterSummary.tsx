"use client";

import type { DoctorFilters } from "@/features/search/doctorListing";
import { design21AppliedFilters, type AppliedDoctorFilter } from "@/features/search/design21AppliedFilters";
import AppliedFilterList from "./AppliedFilterList";

interface Props {
  value: DoctorFilters;
  smartLanguage?: string;
  extraChips: readonly AppliedDoctorFilter[];
  onChange: (value: DoctorFilters) => void;
}

export default function AppliedFilterSummary({ value, extraChips, smartLanguage, onChange }: Props) {
  const chips = design21AppliedFilters(value, onChange, extraChips, [
    "appointmentDate", "mode", "previouslyBooked",
    ...(value.availability === "today" || value.availability === "tomorrow" ? ["availability"] : []),
    ...(smartLanguage ? [`languages-${smartLanguage}`] : []),
  ]);
  const focusFallback = () => {
    const target = Array.from(document.querySelectorAll<HTMLElement>('[data-d21-smart-filters] button:not(:disabled)'))
      .find(control => control.getClientRects().length > 0 && !control.closest('[hidden], [inert], [aria-hidden="true"]'))
      ?? document.getElementById("d21-result-count");
    target?.focus({ preventScroll: true });
  };
  return <AppliedFilterList chips={chips} focusFallback={focusFallback} />;
}

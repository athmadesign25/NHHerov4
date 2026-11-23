"use client";

import { useEffect, useMemo, useState } from "react";
import { searchDoctorsData } from "@/app/search/mockDoctors";
import { getCityId, searchHealthcare } from "@/lib/searchService";
import { fromApiDoctor, fromDirectoryDoctor, type DoctorListingItem } from "./doctorListing";

const directory = searchDoctorsData.map(fromDirectoryDoctor);
interface SearchState { key: string; doctors: DoctorListingItem[]; error: boolean }

export function useDoctorSearch(query: string, location: string) {
  const trimmed = query.trim();
  const cityId = getCityId(location);
  const key = `${trimmed.toLowerCase()}|${cityId ?? ""}`;
  const [state, setState] = useState<SearchState | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const results = await searchHealthcare(trimmed, cityId, controller.signal);
        if (!controller.signal.aborted) setState({ key, doctors: results.doctors.map(fromApiDoctor), error: false });
      } catch {
        if (!controller.signal.aborted) setState({ key, doctors: [], error: true });
      }
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, cityId, key, attempt]);

  const localDoctors = useMemo(() => directory.filter((doctor) =>
    location === "All" || getCityId(doctor.city) === cityId
  ), [location, cityId]);
  const current = state?.key === key ? state : null;
  return {
    doctors: trimmed ? current?.doctors ?? [] : localDoctors,
    loading: Boolean(trimmed && !current),
    error: Boolean(trimmed && current?.error),
    isLive: Boolean(trimmed),
    retry: () => { setState(null); setAttempt((value) => value + 1); },
  };
}

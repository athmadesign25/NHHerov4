"use client";

import { useEffect, useState } from "react";
import { getCityId, searchHealthcare, type NormalizedResults } from "@/lib/searchService";

interface SearchResponse { key: string; data: NormalizedResults | null; error: boolean }

/** Variant-local request state: errors never silently turn into sample results. */
export function useDesign3Search(query: string, location: string) {
  const trimmed = query.trim();
  const cityId = getCityId(location);
  const key = `${trimmed.toLowerCase()}|${cityId ?? ""}`;
  const [response, setResponse] = useState<SearchResponse | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!trimmed) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const data = await searchHealthcare(trimmed, cityId, controller.signal);
        if (!controller.signal.aborted) setResponse({ key, data, error: false });
      } catch {
        if (!controller.signal.aborted) setResponse({ key, data: null, error: true });
      }
    }, 280);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [trimmed, cityId, key, attempt]);
  const current = trimmed && response?.key === key ? response : null;
  return {
    data: current?.data ?? null,
    loading: Boolean(trimmed && !current),
    error: Boolean(trimmed && current?.error),
    retry: () => { setResponse(null); setAttempt((value) => value + 1); },
  };
}

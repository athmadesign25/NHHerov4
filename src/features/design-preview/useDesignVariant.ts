"use client";

import { useCallback, useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import {
  DESIGN_PREVIEW_ENABLED,
  DESIGN_SCOPES,
  type DesignScopeKey,
} from "./designVariants";

const STORAGE_PREFIX = "nh_design_preview:";
const CHANGE_EVENT = "nh-design-preview-change";

const storageKey = (scope: DesignScopeKey) => `${STORAGE_PREFIX}${scope}`;

function isSelectable(scope: DesignScopeKey, id: string | null): id is string {
  if (!id) return false;
  return DESIGN_SCOPES[scope].variants.some((v) => v.id === id && !("disabled" in v && v.disabled));
}

/**
 * Explicit preview URLs take precedence over the preference shared with other
 * tabs. A manual switch wins while its router transition is pending; legacy
 * previews can retain that choice without changing their query/filter state.
 */
const urlSeeded = new Map<DesignScopeKey, string>();
const memoryVariants = new Map<DesignScopeKey, string>();
const manualVariants = new Map<DesignScopeKey, { entry: string; id: string }>();

function currentEntry() {
  const fromUrl = new URLSearchParams(window.location.search).get("design");
  const entry = `${window.location.pathname}?design=${fromUrl ?? ""}`;
  return { fromUrl, entry };
}

function seedFromUrl(scope: DesignScopeKey, fromUrl: string | null, entry: string) {
  if (urlSeeded.get(scope) === entry) return;
  urlSeeded.set(scope, entry);
  if (!isSelectable(scope, fromUrl)) return;
  memoryVariants.set(scope, fromUrl);
  try {
    localStorage.setItem(storageKey(scope), fromUrl);
  } catch {
    /* Keep the URL choice in memory when storage is unavailable. */
  }
}

export function readDesignVariant(scope: DesignScopeKey): string {
  const fallback = DESIGN_SCOPES[scope].defaultVariant;
  if (!DESIGN_PREVIEW_ENABLED) return fallback;
  const { fromUrl, entry } = currentEntry();
  const manual = manualVariants.get(scope);
  // A pending route still exposes the previous URL. Do not let that old URL
  // overwrite the choice that triggered the transition. Filter-only changes
  // keep the same entry and preserve legacy previews' local selection.
  if (manual?.entry === entry) return manual.id;
  manualVariants.delete(scope);
  seedFromUrl(scope, fromUrl, entry);
  if (isSelectable(scope, fromUrl)) return fromUrl;
  try {
    const stored = localStorage.getItem(storageKey(scope)) ?? memoryVariants.get(scope) ?? null;
    return isSelectable(scope, stored) ? stored : fallback;
  } catch {
    return memoryVariants.get(scope) ?? fallback;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // refresh unpinned saved preferences
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setDesignVariant(scope: DesignScopeKey, id: string) {
  if (!DESIGN_PREVIEW_ENABLED || !isSelectable(scope, id)) return;
  manualVariants.set(scope, { entry: currentEntry().entry, id });
  memoryVariants.set(scope, id);
  try {
    localStorage.setItem(storageKey(scope), id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** null means a browser-only preference has not yet been resolved during hydration. */
export function useDesignVariant(scope: DesignScopeKey): string | null {
  const fromUrl = useSearchParams().get("design");
  const getSnapshot = useCallback(() => readDesignVariant(scope), [scope, fromUrl]);
  const getServerSnapshot = useCallback(() => {
    if (!DESIGN_PREVIEW_ENABLED) return DESIGN_SCOPES[scope].defaultVariant;
    // Shareable URLs can render their actual design immediately. Without one,
    // wait for localStorage instead of painting the wrong design first.
    return isSelectable(scope, fromUrl) ? fromUrl : null;
  }, [scope, fromUrl]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

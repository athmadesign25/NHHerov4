"use client";

import { useCallback, useSyncExternalStore } from "react";
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
 * `?design=<id>` is honoured ONCE per page load (for shareable stakeholder
 * links) and copied into localStorage. The switcher never writes to the URL:
 * SearchResultsView resets query/filters whenever searchParams change, so a
 * URL write would wipe the user's current search state.
 */
const urlSeeded = new Set<DesignScopeKey>();
function seedFromUrlOnce(scope: DesignScopeKey) {
  if (urlSeeded.has(scope)) return;
  urlSeeded.add(scope);
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("design");
    if (isSelectable(scope, fromUrl)) localStorage.setItem(storageKey(scope), fromUrl);
  } catch {
    /* storage unavailable — fall back to default */
  }
}

function readVariant(scope: DesignScopeKey): string {
  const fallback = DESIGN_SCOPES[scope].defaultVariant;
  if (!DESIGN_PREVIEW_ENABLED) return fallback;
  seedFromUrlOnce(scope);
  try {
    const stored = localStorage.getItem(storageKey(scope));
    return isSelectable(scope, stored) ? stored : fallback;
  } catch {
    return fallback;
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange); // sync across browser tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

export function setDesignVariant(scope: DesignScopeKey, id: string) {
  if (!DESIGN_PREVIEW_ENABLED || !isSelectable(scope, id)) return;
  try {
    localStorage.setItem(storageKey(scope), id);
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Returns the active design variant id for a scope. SSR-safe. */
export function useDesignVariant(scope: DesignScopeKey): string {
  const getSnapshot = useCallback(() => readVariant(scope), [scope]);
  const getServerSnapshot = useCallback(() => DESIGN_SCOPES[scope].defaultVariant, [scope]);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

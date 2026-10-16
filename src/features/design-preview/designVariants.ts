/**
 * Design Iteration Registry — DEVELOPMENT / STAKEHOLDER PREVIEW ONLY.
 *
 * Each "scope" is one redesignable area of the site. Every scope lists its
 * design iterations; the switcher renders exactly this list.
 *
 *  - Add an iteration    → append an entry to `variants`.
 *  - Rename an iteration → change `label` (keep `id` stable so saved
 *                          selections and shared `?design=` links still work).
 *  - Remove an iteration → delete the entry and its render branch.
 *  - Promote a winner    → set `defaultVariant` to its id, then delete the
 *                          losing branches (including "original") when ready.
 *
 * `original` is the untouched pre-redesign UI. It is kept verbatim in the
 * page component itself — never in Git history — so it is always available.
 */

export interface DesignVariant {
  /** Stable id — used in localStorage and `?design=` links. */
  id: string;
  /** Short label shown in the switcher. */
  label: string;
  /** One-line description shown under the label. */
  note?: string;
  /** Listed but not selectable (placeholder for upcoming concepts). */
  disabled?: boolean;
}

export interface DesignScope {
  /** Variant shown when preview is disabled or nothing is selected. */
  defaultVariant: string;
  variants: DesignVariant[];
}

export const DESIGN_SCOPES = {
  "search-top": {
    defaultVariant: "original",
    variants: [
      { id: "original", label: "Original", note: "Pre-redesign UI" },
      { id: "d1", label: "Design 1", note: "Compact sticky search · mobile filters" },
      { id: "d2", label: "Design 2", note: "Pure Booking Engine · Unified capsule" },
      { id: "d2c", label: "Design 2 · Compact card", note: "Design 2 with compact doctor card" },
      { id: "d3", label: "Design 3", note: "Six-category search · refined controls · compact cards", disabled: false },
    ],
  },
} satisfies Record<string, DesignScope>;

export type DesignScopeKey = keyof typeof DESIGN_SCOPES;

/**
 * The switcher is visible in local development, and on preview deployments
 * that explicitly opt in with NEXT_PUBLIC_DESIGN_PREVIEW=true.
 * In production builds without that flag, every scope is locked to its
 * `defaultVariant` and the switcher renders nothing.
 */
export const DESIGN_PREVIEW_ENABLED =
  process.env.NODE_ENV !== "production" ||
  process.env.NEXT_PUBLIC_DESIGN_PREVIEW === "true";

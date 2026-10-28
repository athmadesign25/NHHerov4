"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronUp, Layers } from "lucide-react";
import { DESIGN_PREVIEW_ENABLED, DESIGN_SCOPES, type DesignScopeKey } from "./designVariants";
import { setDesignVariant, useDesignVariant } from "./useDesignVariant";
import { isJourneyDesign } from "./journeyDesigns";
import styles from "./DesignSwitcher.module.css";

/**
 * Floating design-iteration switcher — DEVELOPMENT / STAKEHOLDER PREVIEW ONLY.
 * Renders nothing in production unless NEXT_PUBLIC_DESIGN_PREVIEW=true.
 */
interface Props { scope: DesignScopeKey; currentVariant?: string; onVariantChange?: (variant: string) => void }

export default function DesignSwitcher(props: Props) {
  if (!DESIGN_PREVIEW_ENABLED) return null;
  return <DesignSwitcherInner {...props} />;
}

function DesignSwitcherInner({ scope, currentVariant, onVariantChange }: Props) {
  const savedVariant = useDesignVariant(scope);
  const active = currentVariant ?? savedVariant;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { variants } = DESIGN_SCOPES[scope];
  const activeLabel = variants.find((v) => v.id === active)?.label ?? active;

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={styles.root} data-design-switcher>
      {open && (
        <div className={styles.menu} role="menu" aria-label="Design iterations" data-lenis-prevent>
          <div className={styles.menuHeader}>
            <span>Design preview</span>
            <span className={styles.scope}>{scope}</span>
          </div>
          {variants.map((v) => {
            const isActive = v.id === active;
            const disabled = "disabled" in v && v.disabled;
            return (
              <button
                key={v.id}
                type="button"
                role="menuitemradio"
                aria-checked={isActive}
                disabled={disabled}
                className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                onClick={() => {
                  setDesignVariant(scope, v.id);
                  // Entering the new exploration from a legacy preview must
                  // also survive refresh when the old URL has ?design=d2/d3.
                  if (!onVariantChange && (["d4", "d5", "d6", "d16", "d17", "d17-lite", "d18", "d19"].includes(v.id) || isJourneyDesign(v.id))) {
                    const url = new URL(window.location.href);
                    url.searchParams.set("design", v.id);
                    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
                  }
                  setOpen(false);
                  onVariantChange?.(v.id);
                }}
              >
                <span className={styles.itemText}>
                  <span className={styles.itemLabel}>{v.label}</span>
                  {v.note && <span className={styles.itemNote}>{v.note}</span>}
                </span>
                {isActive && <Check size={14} aria-hidden />}
              </button>
            );
          })}
          <p className={styles.footnote}>Dev preview · not part of the product UI</p>
        </div>
      )}

      <button
        id="design-switcher-toggle"
        type="button"
        className={styles.pill}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Design preview: ${activeLabel}. Change design iteration`}
        onClick={() => setOpen((o) => !o)}
      >
        <Layers size={13} aria-hidden />
        <span className={styles.tag}>DEV</span>
        <span className={styles.pillLabel}>{activeLabel}</span>
        <ChevronUp size={13} aria-hidden className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`} />
      </button>
    </div>
  );
}

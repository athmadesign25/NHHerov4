"use client";

import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronUp, Layers } from "lucide-react";
import { DESIGN_PREVIEW_ENABLED, DESIGN_SCOPES, type DesignScopeKey } from "./designVariants";
import { setDesignVariant, useDesignVariant } from "./useDesignVariant";
import styles from "./DesignSwitcher.module.css";

/**
 * Floating design-iteration switcher — DEVELOPMENT / STAKEHOLDER PREVIEW ONLY.
 * Renders nothing in production unless NEXT_PUBLIC_DESIGN_PREVIEW=true.
 */
export default function DesignSwitcher({ scope }: { scope: DesignScopeKey }) {
  if (!DESIGN_PREVIEW_ENABLED) return null;
  return <DesignSwitcherInner scope={scope} />;
}

function DesignSwitcherInner({ scope }: { scope: DesignScopeKey }) {
  const active = useDesignVariant(scope);
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
        <div className={styles.menu} role="menu" aria-label="Design iterations">
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
                  setOpen(false);
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

"use client";

import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { Check, Search, X } from "lucide-react";
import { design21FilterSearchGroups, type FilterSearchOption } from "@/features/search/design21FilterSearch";
import type { DoctorFilters } from "@/features/search/doctorListing";
import styles from "./FilterSearch.module.css";

interface Props {
  value: string;
  onChange: (value: string) => void;
  filters: Parameters<typeof design21FilterSearchGroups>[0];
  onFiltersChange: (filters: DoctorFilters) => void;
  onClearCustomDate?: () => void;
}

export default function FilterSearch({ value, onChange, filters, onFiltersChange, onClearCustomDate }: Props) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const reposition = useRef<(() => void) | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const expanded = open && Boolean(value.trim());
  const groups = design21FilterSearchGroups(filters, value);
  const options = groups.flatMap(group => group.options);
  const activeIndex = options.findIndex(option => option.id === active);
  const optionId = (index: number) => `${id}-option-${index}`;

  useLayoutEffect(() => {
    if (!expanded) return;
    const menu = panel.current;
    const anchor = root.current;
    if (!menu || !anchor) return;
    // Top layer prevents clipping by both the sticky sidebar and mobile dialog.
    menu.showPopover();
    const position = () => {
      const rect = anchor.getBoundingClientRect();
      const tokens = getComputedStyle(anchor);
      const gap = parseFloat(tokens.getPropertyValue("--sp-1"));
      const preferredHeight = parseFloat(tokens.getPropertyValue("--sp-16")) * 3;
      const viewport = window.visualViewport;
      const top = viewport?.offsetTop ?? 0;
      const bottom = top + (viewport?.height ?? window.innerHeight);
      const below = Math.max(0, bottom - rect.bottom - gap * 2);
      const above = Math.max(0, rect.top - top - gap * 2);
      const flip = below < preferredHeight && above > below;
      Object.assign(menu.style, { left: `${rect.left}px`, width: `${rect.width}px`,
        top: flip ? "auto" : `${rect.bottom + gap}px`,
        bottom: flip ? `${window.innerHeight - rect.top + gap}px` : "auto",
        maxHeight: `${Math.min(preferredHeight, flip ? above : below)}px` });
    };
    const onScroll = (event: Event) => {
      if (event.target instanceof Node && menu.contains(event.target)) return;
      if (event.target instanceof Element && event.target.matches("[data-filter-scroll-viewport]") && event.target.contains(anchor)) { setOpen(false); return; }
      position();
    };
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !anchor.contains(event.target)) setOpen(false);
    };
    reposition.current = position;
    position();
    const observer = new ResizeObserver(position);
    observer.observe(anchor);
    document.addEventListener("pointerdown", outside);
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", position);
    window.visualViewport?.addEventListener("resize", position);
    window.visualViewport?.addEventListener("scroll", position);
    return () => {
      reposition.current = null;
      menu.hidePopover();
      observer.disconnect();
      document.removeEventListener("pointerdown", outside);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("resize", position);
      window.visualViewport?.removeEventListener("scroll", position);
    };
  }, [expanded]);

  // Applying a filter can insert a summary row above the sidebar without a scroll/resize.
  useLayoutEffect(() => { reposition.current?.(); });

  useEffect(() => {
    if (expanded && activeIndex >= 0) panel.current?.querySelectorAll<HTMLElement>('[role="option"]')[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [expanded, activeIndex]);

  const select = (option: FilterSearchOption) => {
    if (option.clearCustomDate && onClearCustomDate) onClearCustomDate();
    else onFiltersChange(option.nextFilters);
    input.current?.focus({ preventScroll: true });
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.nativeEvent.isComposing) return;
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && value.trim()) {
      event.preventDefault();
      setOpen(true);
      const index = event.key === "ArrowDown" ? (activeIndex + 1) % options.length
        : activeIndex <= 0 ? options.length - 1 : activeIndex - 1;
      setActive(options[index]?.id ?? null);
    } else if (event.key === "Enter" && expanded && activeIndex >= 0) {
      event.preventDefault();
      select(options[activeIndex]);
    }
  };

  return <div ref={root} className={styles.search} data-filter-search onKeyDown={event => {
    if (event.key === "Escape" && expanded) {
      event.preventDefault(); event.stopPropagation(); setOpen(false); setActive(null);
    }
  }} onBlur={event => {
    if (!event.currentTarget.contains(event.relatedTarget)) { setOpen(false); setActive(null); }
  }}>
    <Search size={16} aria-hidden />
    <input ref={input} type="search" role="combobox" aria-label="Search filter options"
      aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? `${id}-results` : undefined}
      aria-activedescendant={expanded && activeIndex >= 0 ? optionId(activeIndex) : undefined}
      placeholder="Search filter options" value={value} autoComplete="off"
      onFocus={() => { if (value.trim()) setOpen(true); }}
      onClick={() => { if (value.trim()) setOpen(true); }}
      onChange={event => { onChange(event.target.value); setActive(null); setOpen(Boolean(event.target.value.trim())); }}
      onKeyDown={onKeyDown} />
    {value && <button type="button" className={styles.clear} aria-label="Clear filter search" onClick={() => {
      onChange(""); setOpen(false); setActive(null); input.current?.focus({ preventScroll: true });
    }}><X size={16} aria-hidden /></button>}
    {expanded && <div ref={panel} popover="manual" className={styles.results} data-filter-search-results data-lenis-prevent>
      <div id={`${id}-results`} role="listbox" aria-label="Matching filter options" aria-multiselectable="true">
        {groups.map(group => <div key={group.key} role="group" aria-labelledby={`${id}-${group.key}`}>
          <div id={`${id}-${group.key}`} className={styles.groupHeading}>{group.label}</div>
          {group.options.map(option => <div key={option.id} id={optionId(options.indexOf(option))} role="option"
            aria-selected={option.selected} className={styles.option} data-active={active === option.id || undefined}
            onMouseDown={event => event.preventDefault()} onClick={() => select(option)}>
            <span className={styles.check} aria-hidden>{option.selected && <Check size={14} strokeWidth={2} />}</span>
            <span className={styles.optionLabel}>{option.label}</span>
          </div>)}
        </div>)}
      </div>
      {!options.length && <p className={styles.empty} role="status">No matching filter options. Try another term.</p>}
    </div>}
  </div>;
}

"use client";
import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import SearchLocationUnit from "@/components/ui/search-location/SearchLocationUnit";
import RotatingSearchHint from "@/components/ui/search-location/RotatingSearchHint";
import { money, type HealthItem } from "../catalog";
import { matchesHealthQuery } from "../healthDiscovery";
import styles from "./HealthCatalogueSearch.module.css";

const terms = ["health packages", "lab tests"] as const;
interface Props { catalog: HealthItem[]; query: string; onQuery: (value: string) => void; onDetails: (item: HealthItem) => void; onSubmit: () => void }

export default function HealthCatalogueSearch({ catalog, query, onQuery, onDetails, onSubmit }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const groups = useMemo(() => (["package", "test"] as const).map(kind => ({ kind,
    items: catalog.filter(item => item.kind === kind && matchesHealthQuery(item, query)).slice(0, 3),
  })), [catalog, query]);
  const options = groups.flatMap(group => group.items);
  const expanded = open && Boolean(query.trim()) && options.length > 0;
  useEffect(() => {
    const outside = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, []);
  useEffect(() => {
    if (expanded && active >= 0) document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [expanded, active, listId]);
  function keyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Escape") { event.preventDefault(); setOpen(false); setActive(-1); }
    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && options.length && query.trim()) {
      event.preventDefault(); setOpen(true);
      setActive(value => event.key === "ArrowDown" ? (value + 1) % options.length : (value <= 0 ? options.length - 1 : value - 1));
    }
    if (event.key === "Enter" && expanded && active >= 0 && options[active]) {
      event.preventDefault(); setOpen(false); onDetails(options[active]);
    }
  }
  return <div ref={root} className={styles.root} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false); }}>
    <SearchLocationUnit id="health-discovery-search" query={query} maxLength={120}
      onQuery={value => { onQuery(value); setOpen(true); setActive(-1); }}
      searchLabel="Find health packages and lab tests" inputLabel="Search health packages and lab tests at this centre"
      hint={paused => <RotatingSearchHint active={!query} paused={paused} prefix="Search for" terms={terms} />}
      inputProps={{ role: "combobox", "aria-autocomplete": "list", "aria-expanded": expanded, "aria-controls": expanded ? listId : undefined,
        "aria-activedescendant": expanded && active >= 0 ? `${listId}-${active}` : undefined,
        onFocus: () => setOpen(true), onKeyDown: keyDown }}
      onSubmit={event => { event.preventDefault(); setOpen(false); onSubmit(); }} />
    {expanded && <div className={styles.dropdown}>
      <div id={listId} role="listbox" aria-label="Matching packages and tests">
        {groups.filter(group => group.items.length).map(group => <div key={group.kind} role="group" aria-labelledby={`${listId}-${group.kind}`}>
          <div id={`${listId}-${group.kind}`} className={styles.heading}>{group.kind === "package" ? "Health packages" : "Lab tests"}</div>
          {group.items.map(item => { const index = options.indexOf(item); return <div key={item.id} id={`${listId}-${index}`} role="option" aria-selected={active === index}
            className={styles.option} onPointerDown={event => event.preventDefault()} onClick={() => { setOpen(false); onDetails(item); }}>
            <span>{item.name}</span>{Number.isFinite(item.price) && item.price >= 0 && <span className={styles.price}>{money(item.price)}</span>}
          </div>; })}
        </div>)}
      </div>
      <button type="button" className={styles.allResults} onClick={() => { setOpen(false); onSubmit(); }}>View all results</button>
    </div>}
  </div>;
}

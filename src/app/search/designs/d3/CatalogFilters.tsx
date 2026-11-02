import { useId } from "react";
import { uniqueValues, type CatalogFilters as Filters, type SearchResultItem } from "@/features/search/design3Data";
import type { SearchTabId } from "@/features/search/searchTabs";
import styles from "./CatalogFilters.module.css";

interface Props { tab: SearchTabId; items: SearchResultItem[]; value: Filters; onChange: (value: Filters) => void }

export default function CatalogFilters({ tab, items, value, onChange }: Props) {
  const id = useId();
  const toggle = (key: keyof Filters, option: string) => onChange({ ...value, [key]: value[key].includes(option) ? value[key].filter((item) => item !== option) : [...value[key], option] });
  const groups: { key: keyof Filters; label: string; options: string[] }[] = [
    { key: "types", label: tab === "articles" ? "Topic" : "Type", options: uniqueValues([...items.map((item) => item.category), ...value.types]) },
    { key: "hospitals", label: "Hospital", options: uniqueValues([...items.map((item) => item.hospital ?? ""), ...value.hospitals]) },
    { key: "genders", label: "For", options: uniqueValues([...items.map((item) => item.gender ?? "").filter((gender) => gender !== "Anyone"), ...value.genders]) },
  ];
  return <div className={styles.filters}>
    {(tab === "specialties" || tab === "treatments") && <fieldset><legend>Browse by A–Z</legend><div className={styles.alphabet}>
      {Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index)).map((letter) => <button type="button" key={letter} aria-pressed={value.letters.includes(letter)} onClick={() => toggle("letters", letter)}>{letter}</button>)}
    </div></fieldset>}
    {groups.filter((group) => group.options.length > 0).map((group) => <fieldset key={group.key}><legend>{group.label}</legend>
      {group.options.map((option) => <label key={option}><input id={`${id}-${group.key}-${option}`} type="checkbox" checked={value[group.key].includes(option)} onChange={() => toggle(group.key, option)} /><span>{option}</span></label>)}
    </fieldset>)}
  </div>;
}

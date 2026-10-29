import Image from "next/image";
import { ArrowRight, Building2, Check, MapPin } from "lucide-react";
import type { SearchResultItem } from "@/features/search/design3Data";
import styles from "./ResultCard.module.css";

export default function ResultCard({ item, onDetails }: { item: SearchResultItem; onDetails: () => void }) {
  return <article className={styles.card}>
    {item.image && <div className={styles.image}><Image src={item.image} alt="" fill sizes="(max-width: 639px) 100vw, (max-width: 1099px) 50vw, 320px" /></div>}
    <div className={styles.content}>
      <span className={styles.category}>{item.category}</span>
      <h2>{item.name}</h2>
      {item.description && <p>{item.description}</p>}
      {item.hospital && <p className={styles.location}><Building2 size={16} aria-hidden />{item.hospital}</p>}
      {item.city && <p className={styles.location}><MapPin size={16} aria-hidden />{item.city}</p>}
      {item.inclusions && <ul>{item.inclusions.slice(0, 4).map((value) => <li key={value}><Check size={15} aria-hidden />{value}</li>)}</ul>}
      {item.detail && <p className={styles.detail}>{item.detail}</p>}
    </div>
    <footer className={styles.footer}>{item.price && <div><strong>{item.price}</strong><span>Listed price</span></div>}
      <button type="button" onClick={onDetails} aria-label={`View details: ${item.name}`}>View details <ArrowRight size={16} aria-hidden /></button>
    </footer>
  </article>;
}

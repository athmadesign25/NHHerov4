import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { DoctorProfilePreviewContent } from "@/features/search/doctorProfilePreview";
import ProfileSampleLabel from "./ProfileSampleLabel";
import styles from "./DoctorProfileDesign2.module.css";

export default function DoctorProfileResearch2({ content, embedded = false }: { content: DoctorProfilePreviewContent; embedded?: boolean }) {
  const { publications, sampleFields } = content;
  if (!publications.length) return null;
  return <section id="profile-research" className={embedded ? styles.nestedSection : styles.chapter} aria-labelledby={embedded ? undefined : "profile-research-heading"} aria-label={embedded ? "Research & publications" : undefined}>
    {!embedded && <header className={styles.chapterHeading}><h2 id="profile-research-heading">Research & publications</h2></header>}
    <div className={styles.chapterContent}>
      {!!publications.length && <details className={styles.disclosure}><summary><span>Research & publications<ProfileSampleLabel show={sampleFields.includes("publications")} /></span><span className={styles.count}>{publications.length}</span><ChevronDown size={18} aria-hidden /></summary><ol className={styles.publications}>{publications.map(item => <li key={item.title}>{item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer">{item.title}<ArrowUpRight size={16} aria-hidden /><span className={styles.srOnly}> (opens in a new tab)</span></a> : <span>{item.title}</span>}{item.detail && <small>{item.detail}</small>}</li>)}</ol></details>}
    </div>
  </section>;
}

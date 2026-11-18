"use client";

import { useState } from "react";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import type { CapturedDoctorProfile } from "@/features/search/doctorProfileSource";
import styles from "./DoctorProfileDesign2.module.css";
import sourceStyles from "./DoctorProfileSourceSections2.module.css";

type Source = CapturedDoctorProfile;
type LinkedItem = { text: string; link?: string };
type ContentSection = "overview" | "expertise" | "background";

const entities: Readonly<Record<string, string>> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: "\u00a0",
  ndash: "–", mdash: "—", lsquo: "‘", rsquo: "’", ldquo: "“", rdquo: "”",
  hellip: "…", bull: "•", middot: "·", copy: "©", reg: "®", trade: "™",
};

/** Decode display entities only. The result always remains a React text node. */
function sourceText(value: string): string {
  return value.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
    if (!code.startsWith("#")) return entities[code.toLowerCase()] ?? entity;
    const numeric = code.slice(1);
    const point = /^x/i.test(numeric) ? parseInt(numeric.slice(1), 16) : parseInt(numeric, 10);
    return point > 0 && point <= 0x10ffff && !(point >= 0xd800 && point <= 0xdfff) ? String.fromCodePoint(point) : entity;
  });
}

const populated = (values: readonly string[]) => values.map(sourceText).filter(value => value.trim());

function extraSectionGroup(id: string, title: string): ContentSection {
  const label = `${id} ${sourceText(title)}`;
  // Research, teaching and career history stay professional even when their
  // supplied headings contain "clinical". Unknown future fields remain visible.
  if (/research|trial|publication|education|training|qualification|fellowship|appointment|career|experience|past|award|recognition|achievement|membership|certification|teaching|mentorship|editorial|conference|presentation|milestone|news|media/i.test(label)) return "background";
  if (/expertise|clinical|skill|procedure|treatment|condition|specialit|specialt/i.test(label)) return "expertise";
  if (/about|biograph|approach|philosophy|language/i.test(label)) return "overview";
  return "background";
}

function extraSections(source: Source) {
  return source.additionalSections.map((section, index) => ({
    ...section,
    group: extraSectionGroup(section.id, section.title),
    anchor: `profile-extra-${section.id.replace(/[^a-zA-Z0-9_-]/g, "-") || "section"}-${index + 1}`,
  })).filter(section => populated(section.paragraphs).length || section.items?.some(item => sourceText(item.text).trim()));
}

/** The navigation and rendered chapters share these exact presence rules. */
export function getSourceContentSections(source: Source): [string, string][] {
  const sections: [string, string][] = [];
  const extras = extraSections(source);
  if ((source.about && sourceText(source.about.text).trim()) || extras.some(item => item.group === "overview")) sections.push(["profile-overview", "About"]);
  if (populated(source.overview.mainSpecialties).length || populated(source.overview.subSpecialties).length
    || populated(source.treatments?.items ?? []).length || extras.some(item => item.group === "expertise")) sections.push(["profile-expertise", "Expertise"]);
  if (populated(source.overview.qualifications).length || sourceText(source.overview.designation).trim()
    || source.achievements?.groups.some(group => group.items.some(item => sourceText(item.text).trim()))
    || extras.some(item => item.group === "background")) {
    sections.push(["profile-background", "Background"]);
  }
  return sections;
}

function sourceLink(value: string | undefined, sourceUrl: string): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(sourceText(value), sourceUrl);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null;
  } catch { return null; }
}

function SourceText({ text }: { text: string }) {
  // Preserve supplied paragraphs and embedded headings as text, without
  // interpreting source HTML or silently shortening the original biography.
  return <div className={`${styles.prose} ${sourceStyles.sourceText}`}>
    {sourceText(text).split(/\n[\t ]*\n/).filter(paragraph => paragraph.trim()).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
  </div>;
}

function SourceBiography({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const paragraphs = sourceText(text).split(/\n[\t ]*\n/).filter(paragraph => paragraph.trim());
  const first = paragraphs[0] ?? "";
  // Keep the first useful passage intact. Source biographies sometimes arrive
  // as one long paragraph, so prefer a sentence boundary before a word break.
  const sentenceEnds = [...first.slice(0, 600).matchAll(/[.!?](?=\s)/g)]
    .map(match => (match.index ?? 0) + 1).filter(index => index >= 280);
  const cutoff = first.length > 600 ? sentenceEnds.at(-1) ?? (Math.max(first.lastIndexOf(" ", 480), 0) || 480) : first.length;
  const hasMore = cutoff < first.length || paragraphs.length > 1;
  return <div className={sourceStyles.biography} data-expanded={expanded}>
    <div id="profile-biography-text" className={`${styles.prose} ${sourceStyles.sourceText}`}>
      <p>{first.slice(0, cutoff)}<span hidden={!expanded}>{first.slice(cutoff)}</span></p>
      {paragraphs.slice(1).map((paragraph, index) => <p key={index} hidden={!expanded}>{paragraph}</p>)}
    </div>
    {hasMore && <button type="button" className={sourceStyles.readMore} aria-expanded={expanded} aria-controls="profile-biography-text" onClick={() => setExpanded(value => !value)}>
      {expanded ? "Show less" : "Read full biography"}<ChevronDown size={16} aria-hidden />
    </button>}
  </div>;
}

function SourceItems({ items, sourceUrl }: { items: readonly LinkedItem[]; sourceUrl: string }) {
  return <ul className={sourceStyles.sourceItems}>{items.filter(item => sourceText(item.text).trim()).map((item, index) => {
    const href = sourceLink(item.link, sourceUrl);
    return <li key={index}>{href ? <a href={href} target="_blank" rel="noopener noreferrer">
      {sourceText(item.text)}<ArrowUpRight size={16} aria-hidden /><span className={styles.srOnly}> (opens in a new tab)</span>
    </a> : sourceText(item.text)}</li>;
  })}</ul>;
}

function AdditionalContent({ section, sourceUrl }: { section: ReturnType<typeof extraSections>[number]; sourceUrl: string }) {
  return <div className={sourceStyles.additionalContent}>
    {section.paragraphs.map((text, index) => sourceText(text).trim() ? <SourceText key={index} text={text} /> : null)}
    {!!section.items?.some(item => sourceText(item.text).trim()) && <SourceItems items={section.items} sourceUrl={sourceUrl} />}
  </div>;
}

function AdditionalSections({ source, group }: { source: Source; group: ContentSection }) {
  return extraSections(source).filter(section => section.group === group).map(section => group === "expertise"
    ? <div key={section.anchor} id={section.anchor} className={`${styles.subsection} ${sourceStyles.anchored}`}>
      <h3 id={`${section.anchor}-heading`}>{sourceText(section.title) || "Clinical details"}</h3>
      <AdditionalContent section={section} sourceUrl={source.sourceUrl} />
    </div>
    : <details key={section.anchor} id={section.anchor} className={`${styles.disclosure} ${sourceStyles.anchored}`}>
      <summary><h3 id={`${section.anchor}-heading`}>{sourceText(section.title) || "Additional information"}</h3><ChevronDown size={18} aria-hidden /></summary>
      <AdditionalContent section={section} sourceUrl={source.sourceUrl} />
    </details>);
}

/** Complete source content; compact card summaries never enter this renderer. */
export default function DoctorProfileSourceSections2({ source, section }: { source: Source; section?: ContentSection }) {
  const visible = new Set(getSourceContentSections(source).map(([id]) => id));
  const show = (name: ContentSection) => (!section || section === name) && visible.has(`profile-${name}`);
  const mainSpecialties = populated(source.overview.mainSpecialties);
  const subSpecialties = populated(source.overview.subSpecialties);
  const qualifications = populated(source.overview.qualifications);
  const treatments = populated(source.treatments?.items ?? []);
  return <>
    {show("overview") && <section id="profile-overview" className={styles.chapter} aria-labelledby="profile-about-heading">
      <header className={styles.chapterHeading}><h2 id="profile-about-heading">{sourceText(source.about?.title ?? "") || "About"}</h2></header>
      <div className={styles.chapterContent}>
        {source.about && sourceText(source.about.text).trim() && <SourceBiography text={source.about.text} />}
        <AdditionalSections source={source} group="overview" />
      </div>
    </section>}

    {show("expertise") && <section id="profile-expertise" className={styles.chapter} aria-labelledby="profile-expertise-heading">
      <header className={styles.chapterHeading}><h2 id="profile-expertise-heading">Clinical expertise</h2></header>
      <div className={styles.chapterContent}>
        {!!mainSpecialties.length && <div className={styles.subsection}><h3>Specialities</h3><ul className={styles.expertise}>{mainSpecialties.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        {!!subSpecialties.length && <div className={styles.subsection}><h3>Areas of expertise</h3><ul className={styles.clinicalList}>{subSpecialties.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        {!!treatments.length && <div className={styles.subsection}><h3>{sourceText(source.treatments?.title ?? "") || "Treatments & procedures"}</h3>
          <ul className={styles.clinicalList}>{treatments.slice(0, 6).map((item, index) => <li key={index}>{item}</li>)}</ul>
          {treatments.length > 6 && <details className={styles.more}><summary><span className={styles.whenClosed}>View all {treatments.length} items</span><span className={styles.whenOpen}>Show fewer</span><ChevronDown size={16} aria-hidden /></summary><ul className={styles.clinicalList}>{treatments.slice(6).map((item, index) => <li key={index}>{item}</li>)}</ul></details>}
        </div>}
        <AdditionalSections source={source} group="expertise" />
      </div>
    </section>}

    {show("background") && <section id="profile-background" className={styles.chapter} aria-labelledby="profile-background-heading">
      <header className={styles.chapterHeading}><h2 id="profile-background-heading">Professional background</h2></header>
      <div className={styles.chapterContent}>
        {!!sourceText(source.overview.designation).trim() && <div className={styles.professionalRole}><h3>Current role</h3><p>{sourceText(source.overview.designation)}</p></div>}
        {!!qualifications.length && <div className={sourceStyles.qualifications}><h3>Qualifications</h3><ul className={styles.credentials}>{qualifications.map((item, index) => <li key={index}>{item}</li>)}</ul></div>}
        {source.achievements?.groups.some(group => group.items.some(item => sourceText(item.text).trim())) && <div id="profile-achievements" className={sourceStyles.anchored} aria-label={sourceText(source.achievements.title) || "Achievements"}>
          <h3 className={sourceStyles.achievementTitle}>{sourceText(source.achievements.title) || "Achievements"}</h3>
          {source.achievements.groups.filter(group => group.items.some(item => sourceText(item.text).trim())).map((group, index) => <details key={index} className={styles.disclosure}>
            <summary><span>{sourceText(group.title) || "Professional contributions"}</span><ChevronDown size={18} aria-hidden /></summary>
            <SourceItems items={group.items} sourceUrl={source.sourceUrl} />
          </details>)}
        </div>}
        <AdditionalSections source={source} group="background" />
      </div>
    </section>}
  </>;
}

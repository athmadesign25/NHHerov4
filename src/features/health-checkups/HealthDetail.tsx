"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ArrowUpRight, Building2, FlaskConical, ListChecks, ClipboardList, MapPin } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import { money, type HealthFacility, type HealthItem } from "./catalog";
import type { HealthDetailSource } from "./healthDetailTypes";
import { DEFAULT_HEALTH_DESIGN, type HealthDesign } from "./healthDesigns";
import JourneyHeading from "@/components/ui/JourneyHeading";
import HealthTestGroups from "./HealthTestGroups";
import styles from "./HealthDetail.module.css";

interface Props { item: HealthItem & HealthDetailSource; facility: HealthFacility; design?: HealthDesign }

function officialSourceLink(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "www.narayanahealth.org" || url.hostname === "narayanahealth.org") ? url.href : undefined;
  } catch { return undefined; }
}

export default function HealthDetail({ item, facility, design = DEFAULT_HEALTH_DESIGN }: Props) {
  const reduced = useReducedMotion();
  const detail = item.details;
  const about = detail?.about.filter(text => text.trim()) ?? [];
  const samples = detail?.sampleRequired.filter(text => text.trim()) ?? [];
  const groups = detail?.testGroups.filter(group => group.name.trim()) ?? [];
  const profiles = detail?.profileTestGroups?.filter(group => group.name.trim()) ?? [];
  const benefits = detail?.benefits?.filter(entry => entry.description.trim()) ?? [];
  const instructionGroups = detail?.instructionGroups?.map(group => ({ ...group, paragraphs: group.paragraphs.filter(text => text.trim()), items: group.items?.filter(text => text.trim()) })).filter(group => group.paragraphs.length || group.items?.length) ?? [];
  const instructions = detail?.instructions.filter(text => text.trim()) ?? [];
  const extraSections = detail?.sections?.filter(section => section.paragraphs.some(text => text.trim()) || section.items?.some(text => text.trim())) ?? [];
  const hasTestCount = Number.isInteger(item.testCount) && item.testCount > 0;
  const reportTime = item.reportTime?.trim();
  const hasPrice = Number.isFinite(item.price) && item.price >= 0;
  const hasDetailContent = about.length || groups.length || profiles.length || benefits.length || instructionGroups.length || instructions.length || extraSections.length;
  const sourceLink = officialSourceLink(item.sourceUrl);
  const browseQuery = new URLSearchParams({ hospital: item.facilityId, design });
  if (item.kind === "test") browseQuery.set("tab", "tests");
  const addQuery = new URLSearchParams(browseQuery);
  addQuery.set("item", item.id);
  addQuery.set("add", "1");
  const availableSections = [
    ...(about.length ? [{ id: "about-package", label: "About" }] : []),
    ...(groups.length || profiles.length ? [{ id: "included-tests", label: "Tests included" }] : []),
    ...(instructions.length || instructionGroups.length ? [{ id: "checkup-instructions", label: "Instructions" }] : []),
    ...extraSections.map((section, index) => ({ id: `package-section-${index}`, label: section.title })),
  ];

  return <main className={styles.page}>
    <div className={styles.container}>
      <Link className={styles.back} href={`/health-checkups?${browseQuery}`}><ArrowLeft aria-hidden />Health checkups &amp; tests</Link>
      <motion.header className={styles.hero} data-image={Boolean(item.image) || undefined} initial={reduced ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: duration.slow, ease: ease.out }}>
        <div className={styles.identity}>
          <p className={styles.type}>{item.kind === "package" ? "Health package" : "Lab test"}</p>
          {design === "1" ? <h1>{item.name}</h1> : <JourneyHeading>{item.name}</JourneyHeading>}
          {detail?.subtitle && <p className={styles.subtitle}>{detail.subtitle}</p>}
          {!about.length && item.description?.trim() && <p className={styles.subtitle}>{item.description}</p>}
          <div className={styles.facility}><Building2 aria-hidden /><div><p>{facility.name}</p><span><MapPin aria-hidden />{facility.city}</span></div></div>
          {(samples.length > 0 || hasTestCount || reportTime) && <dl className={styles.facts}>
            {hasTestCount && <div><dt>Tests included</dt><dd>{item.testCount}</dd></div>}
            {samples.length > 0 && <div><dt>Sample required</dt><dd>{samples.join(", ")}</dd></div>}
            {reportTime && <div><dt>Report availability</dt><dd>{reportTime}</dd></div>}
          </dl>}
        </div>
        {item.image && <div className={styles.image}><Image src={item.image} alt="" fill priority sizes="(min-width: 1024px) 30vw, (min-width: 640px) 40vw, 100vw" /></div>}
      </motion.header>
      {availableSections.length > 1 && <nav className={styles.sections} aria-label={`${item.kind === "package" ? "Package" : "Test"} details sections`}>{availableSections.map(section => <Link key={section.id} href={`#${section.id}`} scroll>{section.label}</Link>)}</nav>}
      <div className={styles.content}>
        {!hasDetailContent && <div className={styles.missingDetails}><p>For detailed information and preparation instructions, please contact the centre.</p>{sourceLink && <a className={styles.back} href={sourceLink} target="_blank" rel="noopener noreferrer">View on Narayana Health<ArrowUpRight aria-hidden /></a>}</div>}
        {about.length > 0 && <section id="about-package" className={styles.section} aria-labelledby="about-package-heading"><div className={styles.sectionHeading}><span><FlaskConical aria-hidden /></span><h2 id="about-package-heading">About this {item.kind}</h2></div><div className={styles.prose}>{about.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div></section>}
        {benefits.length > 0 && <section className={styles.section} aria-labelledby="package-benefits-heading"><h2 id="package-benefits-heading">{item.kind === "package" ? "Package benefits" : "Test benefits"}</h2><ul className={styles.instructions}>{benefits.map((benefit, index) => <li key={index}>{benefit.title && <strong>{benefit.title} </strong>}{benefit.description}</li>)}</ul></section>}
        {(groups.length > 0 || profiles.length > 0) && <section id="included-tests" className={styles.section} aria-labelledby="included-tests-heading">
          <div className={styles.sectionHeading}><span><ListChecks aria-hidden /></span><h2 id="included-tests-heading">Tests included</h2></div>
          {groups.length > 0 && <HealthTestGroups key={`${item.id}-tests`} groups={groups} idPrefix="test-parameters" />}
          {profiles.length > 0 && <div className={styles.profileTests}><h3>Detailed test list</h3><HealthTestGroups key={`${item.id}-profiles`} groups={profiles} idPrefix="profile-test-parameters" headingLevel={4} /></div>}
        </section>}
        {(instructions.length > 0 || instructionGroups.length > 0) && <section id="checkup-instructions" className={styles.section} aria-labelledby="checkup-instructions-heading">
          <div className={styles.sectionHeading}><span><ClipboardList aria-hidden /></span><h2 id="checkup-instructions-heading">Health checkup instructions</h2></div>
          {instructionGroups.length > 0 ? <div className={styles.instructionGroups}>{instructionGroups.map((group, index) => <div key={`${group.title}-${index}`}><h3>{group.title}</h3>{group.paragraphs.length > 0 && <div className={styles.prose}>{group.paragraphs.map((text, textIndex) => <p key={textIndex}>{text}</p>)}</div>}{group.items?.length ? <ul className={styles.instructions}>{group.items.map((text, textIndex) => <li key={textIndex}>{text}</li>)}</ul> : null}</div>)}</div> : <ul className={styles.instructions}>{instructions.map((instruction, index) => <li key={index}>{instruction}</li>)}</ul>}
        </section>}
        {extraSections.map((section, index) => <section key={`${section.title}-${index}`} id={`package-section-${index}`} className={styles.section} aria-labelledby={`package-section-heading-${index}`}><h2 id={`package-section-heading-${index}`}>{section.title}</h2><div className={styles.prose}>{section.paragraphs.filter(Boolean).map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}</div>{section.items?.length ? <ul className={styles.instructions}>{section.items.map((text, itemIndex) => <li key={itemIndex}>{text}</li>)}</ul> : null}</section>)}
      </div>
    </div>
    <footer className={styles.dock} aria-label="Select this health checkup"><div className={styles.dockInner}><div className={styles.dockContext}><strong>{item.name}</strong><span>{facility.name}</span></div><div className={styles.dockAction}><strong className={styles.price}>{hasPrice ? money(item.price) : "Price not listed"}</strong>{hasPrice ? <Link className={styles.primary} href={`/health-checkups?${addQuery}`}>Add to selection<ArrowRight aria-hidden /></Link> : <button className={styles.primary} type="button" disabled>Add to selection</button>}</div></div></footer>
  </main>;
}

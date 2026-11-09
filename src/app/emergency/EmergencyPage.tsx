"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowDown, ArrowUpRight, Award, Brain, ChevronDown, Clock3, Download, HeartPulse, MapPin, Play, Plus, ShieldCheck, Stethoscope, Users, X } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import EmergencyExplore from "./EmergencyExplore";
import MenuAction from "@/components/layout/navigation/MenuAction";
import navStyles from "@/components/layout/Navbar.module.css";
import { duration, ease } from "@/lib/motion";
import content from "./emergency-content.json";
import styles from "./EmergencyPage.module.css";

// Matches the visible number on NH's live banner and its condition callouts.
// The live banner's underlying 0308 link disagrees with its printed 0309 number.
const CALL = "tel:18003090309";
const PHONE = "1800 309 0309";
const sections = [
  { id: "overview", label: "Overview" },
  { id: "conditions", label: "Conditions We Treat" },
  { id: "expertise", label: "Our Expertise" },
  { id: "procedures", label: "Emergency Procedures" },
  { id: "hospitals", label: "Hospitals with 24x7 Emergency" },
];
const mobileHero = getImageProps({ src: "/emergency/nh-ambulance-night-mobile-v2.webp", alt: "", fill: true, sizes: "100vw" }).props;
const teamIcons = [ShieldCheck, Clock3, Activity, HeartPulse, Brain, Stethoscope, Users, HeartPulse, Clock3];

export default function EmergencyPage() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const [active, setActive] = useState("overview");
  const tabs = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [tabsPinned, setTabsPinned] = useState(false);
  const [tabsDark, setTabsDark] = useState(false);
  const [condition, setCondition] = useState(content.conditions[0].slug);
  const [city, setCity] = useState("Bangalore");
  const [allHospitals, setAllHospitals] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const videoTrigger = useRef<HTMLElement | null>(null);
  const videoDialog = useRef<HTMLDialogElement>(null);
  const selectedCondition = content.conditions.find(item => item.slug === condition) ?? content.conditions[0];
  const hospitals = content.cities.find(item => item.label === city)?.hospitals ?? [];
  const reveal = { initial: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.1 }, transition: { duration: reduced ? 0 : duration.slowest, ease: ease.out } };

  useEffect(() => {
    let frame = 0;
    let followUntil = 0;
    let previousOffset = -1;
    const nav = document.querySelector("nav");
    const measure = () => {
      frame = 0;
      const offset = Math.max(0, nav?.getBoundingClientRect().bottom ?? 0);
      if (Math.abs(offset - previousOffset) > 0.1) {
        root.current?.style.setProperty("--emergency-nav-offset", `${offset}px`);
        previousOffset = offset;
      }
      setTabsPinned((tabs.current?.getBoundingClientRect().bottom ?? Infinity) <= offset && (root.current?.getBoundingClientRect().bottom ?? Infinity) > innerHeight);
      const barHeight = parseFloat(getComputedStyle(root.current!).getPropertyValue("--space-48"));
      for (const element of document.elementsFromPoint(innerWidth / 2, offset + barHeight + 1)) {
        if (element.closest("[data-emergency-tabs]") || element.closest("nav") || element.closest("footer")) continue;
        const theme = element.closest("[data-nav-theme]")?.getAttribute("data-nav-theme");
        if (theme) { setTabsDark(theme === "dark"); break; }
      }
      // The site footer is fixed behind the page; its viewport position cannot
      // tell us when it is revealed. Use the opaque page curtain’s end instead.
      setShowCall((hero.current?.getBoundingClientRect().bottom ?? Infinity) < offset && (root.current?.getBoundingClientRect().bottom ?? Infinity) > innerHeight);
      // CSS can continue moving the main nav after its last style mutation.
      // Follow that short transition so the section rail never leaves a gap.
      if (performance.now() < followUntil) frame = requestAnimationFrame(measure);
    };
    const schedule = () => { followUntil = performance.now() + duration.slowest * 1000; if (!frame) frame = requestAnimationFrame(measure); };
    const observer = new MutationObserver(schedule);
    if (nav) observer.observe(nav, { attributes: true, attributeFilter: ["style"] });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);

  useEffect(() => {
    if (!videoOpen) { videoDialog.current?.close(); return; }
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    videoDialog.current?.showModal();
    return () => { document.body.style.overflow = overflow; };
  }, [videoOpen]);

  useEffect(() => {
    const selected = document.getElementById(`${tabsPinned ? "compact-emergency-tab" : "emergency-tab"}-${active}`);
    const list = selected?.parentElement;
    if (!list || !selected) return;
    const rect = selected.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    if (rect.left < listRect.left || rect.right > listRect.right) list.scrollTo({ left: list.scrollLeft + rect.left - listRect.left - (list.clientWidth - rect.width) / 2, behavior: reduced ? "instant" : "smooth" });
  }, [active, tabsPinned, reduced]);

  useEffect(() => {
    const sync = () => { const next = sections.find(item => `#${item.id}` === location.hash); if (next) setActive(next.id); };
    const frame = requestAnimationFrame(sync);
    window.addEventListener("hashchange", sync);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("hashchange", sync); };
  }, []);

  const openVideo = () => {
    videoTrigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setVideoOpen(true);
  };

  const changeTab = (id: string) => {
    const next = sections.find(item => item.id === id);
    if (!next) return;
    const wasPinned = tabsPinned;
    setActive(next.id);
    history.replaceState(null, "", `#${next.id}`);
    requestAnimationFrame(() => {
      const navBottom = Math.max(0, document.querySelector("nav")?.getBoundingClientRect().bottom ?? 0);
      const rect = tabs.current?.getBoundingClientRect();
      if (rect) window.scrollTo({ top: scrollY + (wasPinned ? rect.bottom + 1 : rect.top) - navBottom, behavior: reduced ? "instant" : "smooth" });
    });
  };

  const renderTabs = (compact: boolean) => <div role="tablist" aria-label={compact ? "Emergency care sections, compact" : "Emergency care sections"} className={styles.tabList}>{sections.map((item, index) => <button key={item.id} id={`${compact ? "compact-emergency-tab" : "emergency-tab"}-${item.id}`} type="button" role="tab" aria-selected={active === item.id} aria-controls="emergency-tab-panel" tabIndex={active === item.id ? 0 : -1} onClick={() => changeTab(item.id)} onKeyDown={event => { const next = event.key === "ArrowRight" ? (index + 1) % sections.length : event.key === "ArrowLeft" ? (index - 1 + sections.length) % sections.length : event.key === "Home" ? 0 : event.key === "End" ? sections.length - 1 : null; if (next !== null) { event.preventDefault(); changeTab(sections[next].id); document.getElementById(`${compact ? "compact-emergency-tab" : "emergency-tab"}-${sections[next].id}`)?.focus({ preventScroll: true }); } }}><span className={styles.tabLabel}>{item.label}</span></button>)}</div>;

  return <div ref={root} className={styles.page} data-emergency-page>
    <section ref={hero} className={styles.hero} data-nav-theme="dark" aria-labelledby="emergency-title">
      <picture><source media="(max-width: 768px)" srcSet={mobileHero.srcSet} sizes="100vw" /><Image src="/emergency/nh-ambulance-night-v2.webp" alt="A Narayana Health ambulance on a night road with emergency lights and traffic light trails" fill sizes="100vw" loading="eager" fetchPriority="high" className={styles.heroPhoto} /></picture>
      <div className={styles.heroShade} aria-hidden="true" />
      <div className={`${styles.container} ${styles.heroInner}`}><motion.div className={styles.nearLockup} initial={{ opacity: reduced ? 1 : 0 }} animate={{ opacity: 1 }} transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.out }}>
        <h1 id="emergency-title" className={styles.nearTitle}><Image src="/emergency/near-campaign-v2.webp" alt="With you. NEAR you. Narayana Emergency Ambulance Response." fill sizes="(max-width: 768px) 384px, 576px" preload className={styles.nearArtwork} /></h1>
        <div className={styles.heroPhone}><p>One number for every medical need</p><a className={styles.phoneNumber} href={CALL} aria-label={`Call ${PHONE}`}>{PHONE}</a><motion.a href={CALL} className={`${navStyles.emergencyBtn} ${navStyles.emergencyBtnSolid} ${styles.callButton}`} initial="initial" whileHover="animate" whileFocus="animate"><PhoneCall animateOnHover aria-hidden="true" /><span>Call Now</span><ArrowUpRight aria-hidden="true" /></motion.a></div>
      </motion.div></div>
      <a className={styles.scrollCue} href="#overview" onClick={event => { event.preventDefault(); changeTab("overview"); }}><span>Explore our emergency care</span><ArrowDown aria-hidden="true" /></a>
    </section>

    <div ref={tabs} className={styles.mainTabs} data-emergency-tabs data-nav-theme="light" inert={tabsPinned}>{renderTabs(false)}</div>
    <div className={`${styles.compactTabs} ${tabsDark ? styles.compactTabsDark : ""}`} data-emergency-tabs hidden={!tabsPinned}>{renderTabs(true)}</div>
    <div ref={panel} id="emergency-tab-panel" role="tabpanel" aria-labelledby={`emergency-tab-${active}`} tabIndex={-1}>
    {(active === "overview") && <section id="overview" className={`${styles.section} ${styles.container}`} data-nav-theme="light" aria-labelledby="overview-title">
      <motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Here when it matters</p><h2 id="overview-title" className={styles.sectionTitle} tabIndex={-1}>{content.overview.title}</h2><p className={styles.subtitle}>{content.overview.subtitle}</p></motion.div>
      <motion.div {...reveal} className={styles.network} data-nav-theme="dark">
        <Image src="/assets/doctor_team.png" alt="A multidisciplinary team of doctors" fill sizes="(max-width: 768px) 100vw, 90vw" className={styles.networkPhoto} />
        <div className={styles.networkContent}><h3>{content.response.title}</h3><p>{content.response.subtitle}</p><dl className={styles.metrics}>{content.response.items.map((item, index) => <div key={item.title}><dt>{item.title}</dt><dd>{["Emergency specialist access", "ER patients treated every year", "Ambulances with GPS tracking", "Emergency-ready hospitals nationwide"][index]}</dd></div>)}</dl></div>
      </motion.div>
    </section>}

    {(active === "conditions") && <section id="conditions" className={`${styles.section} ${styles.dark}`} data-nav-theme="dark" aria-labelledby="conditions-title"><div className={styles.container}>
      <motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Conditions We Treat</p><h2 id="conditions-title" className={styles.sectionTitle} tabIndex={-1}>Conditions We Treat</h2><p className={styles.subtitle}>Explore {content.conditions.length} areas of emergency care.</p><div className={styles.centerSelect}><label className={styles.fieldLabel} htmlFor="emergency-condition">Choose an area of care</label><div className={styles.selectWrap}><select id="emergency-condition" aria-controls="condition-details" value={condition} onChange={event => setCondition(event.target.value)}>{content.conditions.map(item => <option key={item.slug} value={item.slug}>{item.title}</option>)}</select><ChevronDown aria-hidden="true" /></div></div></motion.div>
      <div key={selectedCondition.slug} id="condition-details" className={styles.conditionPanel}><div className={styles.conditionVisual}><Image src={selectedCondition.image} alt={selectedCondition.title} fill sizes="(max-width: 768px) 90vw, 30vw" /><div><h3>{selectedCondition.title}</h3><a href={CALL} className={styles.textCall}><PhoneCall aria-hidden="true" />{PHONE}</a></div></div><div className={styles.accordion}>{selectedCondition.items.map((item, index) => <details key={item.title} name="emergency-conditions" open={index === 0 || undefined}><summary><span>{item.title}</span><Plus aria-hidden="true" /></summary><div className={styles.answer}>{item.text.split(/\n\n/).map((text, i) => <p key={i}>{/^Call 1800/.test(text) ? <a href={CALL}>{text}</a> : text}</p>)}</div></details>)}</div></div>
    </div></section>}

    {(active === "overview" || active === "expertise") && <section id="expertise" className={`${styles.section} ${styles.dark} ${styles.expertise}`} data-nav-theme="dark" aria-labelledby="expertise-title"><div className={styles.container}>
      <motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Our Expertise</p><h2 id="expertise-title" className={styles.sectionTitle} tabIndex={-1}>{content.team.title}</h2><p className={styles.subtitle}>{content.team.subtitle}</p></motion.div>
      <div className={styles.teamGrid}>{content.team.items.slice(0, 6).map((item, index) => { const Icon = teamIcons[index]; return <motion.article {...reveal} key={item.title} className={styles.teamCard}><span className={styles.iconBox}><Icon aria-hidden="true" /></span><h3>{item.title}</h3><p>{item.subtitle}</p></motion.article>; })}</div>
      {active === "expertise" && <div className={`${styles.accordion} ${styles.additionalTeam}`}><details><summary><span>Support across every age and stage of life</span><Plus aria-hidden="true" /></summary><div className={styles.supportGrid}>{content.team.items.slice(6).map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.subtitle}</p></div>)}</div></details></div>}{active === "overview" && <div className={styles.centerAction}><MenuAction label="Explore our expertise" context="View the full emergency team and protocols" onClick={() => changeTab("expertise")} /></div>}
    </div></section>}

    {(active === "expertise") && <section className={`${styles.section} ${styles.container}`} data-nav-theme="light" aria-labelledby="protocol-title"><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>A coordinated response</p><h2 id="protocol-title" className={styles.sectionTitle}>{content.protocols.title}</h2><p className={styles.subtitle}>{content.protocols.subtitle}</p></motion.div><EmergencyExplore label="Explore emergency protocols" items={content.protocols.items.map((item, index) => ({ label: item.title, title: item.heading, description: item.description, image: `/emergency/protocol-${index}.webp` }))} /></section>}

    {(active === "expertise") && <section className={styles.performanceSection} data-nav-theme="dark" aria-labelledby="performance-title"><div className={styles.performance}><Image src="/bento-advanced-technology.jpg" alt="" fill sizes="100vw" className={styles.performancePhoto} /><div className={styles.performanceShade} /><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Measured care</p><h2 id="performance-title" className={styles.sectionTitle}>{content.performance.title}</h2><p className={styles.subtitle}>{content.performance.subtitle}</p></motion.div><dl className={styles.performanceGrid}>{content.performance.items.map((item, index) => { const Icon = [Clock3, Stethoscope, Users, HeartPulse, ShieldCheck][index]; return <div key={item.title}><Icon aria-hidden="true" /><dt>{item.title}</dt><dd>{item.subtitle}</dd><dd className={styles.benchmark}>{item.head.replace("Benchmark1-", "Benchmark¹ · ")}</dd></div>; })}</dl><p className={styles.sourceNote}>{content.performance.note}</p></div></div></section>}

    {(active === "procedures") && <section id="procedures" className={`${styles.section} ${styles.container}`} data-nav-theme="light" aria-labelledby="procedures-title"><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Emergency Procedures</p><h2 id="procedures-title" className={styles.sectionTitle} tabIndex={-1}>Emergency Procedures We Perform</h2></motion.div><EmergencyExplore label="Explore emergency procedures" items={content.procedures.map((item, index) => ({ label: item.title, title: item.title, image: content.conditions[[3, 3, 1, 2, 5, 9, 0, 7, 6, 11, 10, 4][index]].image, details: item.items }))} /></section>}

    {(active === "hospitals") && <section id="hospitals" className={`${styles.section} ${styles.tint}`} data-nav-theme="light" aria-labelledby="hospitals-title"><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Care across our network</p><h2 id="hospitals-title" className={styles.sectionTitle} tabIndex={-1}>Hospitals with 24x7 Emergency</h2><p className={styles.subtitle}>Round-the-Clock Emergency Care Across All Our Hospitals</p><div className={styles.centerSelect}><label className={styles.fieldLabel} htmlFor="emergency-city">Choose your location</label><div className={styles.selectWrap}><MapPin aria-hidden="true" /><select id="emergency-city" value={city} onChange={event => { setCity(event.target.value); setAllHospitals(false); }}>{content.cities.map(item => <option value={item.label} key={item.label}>{item.label}</option>)}</select><ChevronDown aria-hidden="true" /></div></div></motion.div>
      <p className={styles.resultCount} role="status">{hospitals.length} {hospitals.length === 1 ? "location" : "locations"} in {city}</p><div className={styles.hospitalGrid}>{hospitals.slice(0, allHospitals ? hospitals.length : 3).map(hospital => <article key={hospital.id} className={styles.hospitalCard}><Image src={hospital.id === 38 ? "/emergency/mazumdar-shaw.webp" : hospital.id === 32 ? "/emergency/hsr-hospital.webp" : `/emergency/hospital-${hospital.id}.webp`} alt={hospital.name} fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" /><div className={styles.hospitalCardShade} /><div className={styles.hospitalCopy}><h3><Link href={`https://www.narayanahealth.org/${hospital.slug}`}>{hospital.name}</Link></h3><p>{hospital.address || hospital.city}</p><div className={styles.hospitalActions}><Link href={`/search?q=${encodeURIComponent(hospital.name)}`} className={styles.glassButton}>Find a Doctor<ArrowUpRight aria-hidden="true" /></Link><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.address || hospital.name)}`} target="_blank" rel="noopener noreferrer" aria-label={`Directions to ${hospital.name}`} className={styles.glassIcon}><MapPin aria-hidden="true" /></a></div></div></article>)}</div>{hospitals.length === 0 && <p className={styles.empty}>No locations are listed for this city on the current directory. <a href={CALL}>Call {PHONE}</a> for assistance.</p>}{hospitals.length > 3 && <div className={styles.centerAction}><MenuAction label={allHospitals ? "Show fewer hospitals" : `View all hospitals in ${city}`} context={allHospitals ? "Show fewer hospitals" : `View all hospitals in ${city}`} onClick={() => setAllHospitals(!allHospitals)} /></div>}
    </div></section>}

    </div>

<section className={`${styles.section} ${styles.tint}`} data-nav-theme="light" aria-labelledby="why-emergency-title"><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Why Narayana Health</p><h2 id="why-emergency-title" className={styles.sectionTitle}>{content.benefits.title}</h2><p className={styles.subtitle}>{content.benefits.subtitle}</p></motion.div>
      <motion.div {...reveal} className={styles.careGrid}><article className={styles.certification} data-nav-theme="dark"><Image src="/emergency/mazumdar-shaw.webp" alt="Mazumdar Shaw Medical Centre, Bangalore" fill sizes="(max-width: 768px) 100vw, 100vw" className={styles.coverPhoto} /><div className={styles.cardWash} /><div className={styles.certificationCopy}><Award aria-hidden="true" /><h3>{content.certification.title}</h3><p>{content.certification.subtitle}</p><span className={styles.glassCaption}><MapPin aria-hidden="true" />{content.certification.image_text}</span></div></article>{content.benefits.items.map((item, index) => <article key={item.title} className={styles.careCard} data-card={index} data-nav-theme="dark"><Image src={["/navigation/services-ambulance.webp", "/emergency/care-1.webp", "/assets/doctor_team.png"][index]} alt={item.title} fill sizes="(max-width: 768px) 90vw, 40vw" className={styles.coverPhoto} /><div className={styles.cardWash} /><div className={styles.careCopy}><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</motion.div>
    </div></section>

<section className={`${styles.section} ${styles.container}`} data-nav-theme="light" aria-labelledby="inside-er-title"><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>People behind the response</p><h2 id="inside-er-title" className={styles.sectionTitle}>{content.video.title}</h2><p className={styles.subtitle}>{content.video.subtitle}</p></motion.div><button type="button" className={styles.videoPoster} onClick={openVideo} aria-label="Play Inside the Emergency Room"><Image src="/emergency/er-video.webp" alt="Inside ER: real emergency cases from Narayana Health" fill sizes="(max-width: 768px) 90vw, 90vw" /><span className={styles.play}><Play aria-hidden="true" /></span><span className={styles.videoCaption}>Inside the Emergency Room <ArrowUpRight aria-hidden="true" /></span></button></section>

<section className={`${styles.section} ${styles.container}`} data-nav-theme="light" aria-labelledby="guide-title"><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Know when to act</p><h2 id="guide-title" className={styles.sectionTitle}>{content.articles.title}</h2><p className={styles.subtitle}>{content.articles.subtitle}</p></motion.div><div className={styles.articleGrid}>{content.articles.items.map(item => <a key={item.link} href={item.href} className={styles.articleCard}><Image src={item.image} alt="" fill sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 25vw" /><div className={styles.articleShade} /><div className={styles.articleCopy}><span className={styles.articleCategory}>{item.category}</span><h3>{item.title}</h3><p>{item.author}</p><div className={styles.articleFooter}><time>{item.date}</time><span>Read article <ArrowUpRight aria-hidden="true" /></span></div></div></a>)}</div>
      <div className={`${styles.sectionHeader} ${styles.newsletterHeader}`}><p className={`section-eyebrow ${styles.eyebrow}`}>From our emergency teams</p><h3 className={styles.sectionTitle}>{content.newsletters.title}</h3><p className={styles.subtitle}>{content.newsletters.subtitle}</p></div><ul className={styles.newsletters}>{content.newsletters.items.map(item => <li key={item.title}><a href={item.cta_link} target="_blank" rel="noopener noreferrer"><div className={styles.newsletterImage}><Image src={item.image} alt="" fill sizes="(max-width: 640px) 90vw, 25vw" /></div><div className={styles.newsletterCopy}><h4>{item.title}</h4><span>{item.cta_name}<Download aria-hidden="true" /></span></div></a></li>)}</ul>
    </section>

<section className={`${styles.section} ${styles.tint}`} data-nav-theme="light" aria-labelledby="faq-title"><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><p className={`section-eyebrow ${styles.eyebrow}`}>Your questions, answered</p><h2 id="faq-title" className={styles.sectionTitle}>{content.faqs.title}</h2><p className={styles.subtitle}>{content.faqs.subtitle}</p></motion.div><div className={`${styles.accordion} ${styles.faqList}`}>{content.faqs.items.map(item => <details key={item.question} name="emergency-faqs"><summary><span>{item.question}</span><Plus aria-hidden="true" /></summary><div className={styles.answer}><p>{item.answer}</p></div></details>)}</div></div></section>

<section className={`${styles.section} ${styles.closing}`} data-nav-theme="dark"><Image src="/bento-patient-first.jpg" alt="" fill sizes="100vw" /><div className={styles.closingShade} /><div className={`${styles.container} ${styles.sectionHeader}`}><p className={`section-eyebrow ${styles.eyebrow}`}>Narayana Health</p><h2 className={styles.sectionTitle}>Looking for Expert Medical Care?</h2><p className={styles.subtitle}>Your health matters. That’s why we make finding and booking the right doctor easy.</p><div className={styles.closingActions}><Link href="/doctors" className={styles.primaryButton}>Book Appointment<ArrowUpRight aria-hidden="true" /></Link><a href="#hospitals" className={styles.textLink} onClick={event => { event.preventDefault(); changeTab("hospitals"); }}>Find Our Hospital<ArrowUpRight aria-hidden="true" /></a></div></div></section>

    {showCall && <aside className={styles.mobileCall} aria-label="Emergency call shortcut"><span><strong>24/7 Emergency</strong><small>No appointment needed</small></span><a href={CALL}><PhoneCall aria-hidden="true" /><span>Call now</span></a></aside>}
    <dialog ref={videoDialog} data-lenis-prevent className={styles.videoDialog} aria-labelledby="emergency-video-title" onCancel={() => setVideoOpen(false)} onClose={() => { setVideoOpen(false); videoTrigger.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) setVideoOpen(false); }}><div className={styles.videoDialogHeader}><h2 id="emergency-video-title">{content.video.title}</h2><button type="button" onClick={() => setVideoOpen(false)} aria-label="Close video"><X aria-hidden="true" /></button></div>{videoOpen && <iframe src="https://www.youtube-nocookie.com/embed/PXX79R0w6Cc?autoplay=1" title="Inside the Emergency Room — Narayana Health" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}</dialog>
  </div>;
}

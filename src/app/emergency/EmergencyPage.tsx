"use client";

import { useEffect, useRef, useState } from "react";
import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, ArrowUpRight, Award, Brain, CalendarCheck, ChevronDown, Clock3, Download, HeartPulse, MapPin, Play, Plus, ShieldCheck, Stethoscope, Users, X } from "lucide-react";
import { PhoneCall } from "@/components/animate-ui/icons/hugeicons/phone-call";
import EmergencyCareExplorer from "./EmergencyCareExplorer";
import EmergencyHospitalCard from "./EmergencyHospitalCard";
import HorizontalMediaRail from "@/components/ui/HorizontalMediaRail";
import { ChevronDown as AnimatedChevronDown } from "@/components/animate-ui/icons/lucide/chevron-down";
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
// Reuses the image-circle vocabulary of the demo Diseases & Conditions directory.
const conditionCategories = [
  { label: "Trauma & accidents", image: "/Specialities icons/Orthopedics.jpeg" },
  { label: "Heart", image: "/Specialities icons/Cardiology.jpeg" },
  { label: "Brain & stroke", image: "/Specialities icons/Neurology.jpeg" },
  { label: "Airway & breathing", image: "/Specialities icons/Pulmonology.jpeg" },
  { label: "Ear, nose & throat", image: content.conditions[4].image },
  { label: "Stomach & gut", image: "/Specialities icons/Gastroenterology.jpeg" },
  { label: "Kidneys", image: "/Specialities icons/Nephrology.jpeg" },
  { label: "Diabetes & electrolytes", image: content.conditions[7].image },
  { label: "Infection & sepsis", image: content.conditions[8].image },
  { label: "Maternity", image: content.conditions[9].image },
  { label: "Children", image: "/Specialities icons/Paediatrics.jpeg" },
  { label: "Poisoning & bites", image: content.conditions[11].image },
  { label: "Cancer", image: "/Specialities icons/Cancer Care.jpeg" },
  { label: "Urology", image: "/Specialities icons/Urology.jpeg" },
];
const teamIcons = [ShieldCheck, Clock3, Activity, HeartPulse, Brain, Stethoscope, Users, HeartPulse, Clock3];

export default function EmergencyPage() {
  const reduced = useReducedMotion();
  const root = useRef<HTMLDivElement>(null);
  const hero = useRef<HTMLElement>(null);
  const [active, setActive] = useState("overview");
  const tabs = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const sharedJourney = useRef<HTMLDivElement>(null);
  const [tabsPinned, setTabsPinned] = useState(false);
  const [city, setCity] = useState("Bangalore");
  const [videoOpen, setVideoOpen] = useState(false);
  const [showCall, setShowCall] = useState(false);
  const videoTrigger = useRef<HTMLElement | null>(null);
  const videoDialog = useRef<HTMLDialogElement>(null);
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
      const barHeight = parseFloat(getComputedStyle(root.current!).getPropertyValue("--space-48"));
      // The rail belongs only to the changing dark content. Hide it before
      // the shared light chapter reaches the main navigation, and restore
      // it when the reader scrolls back into the tab content.
      setTabsPinned(
        (tabs.current?.getBoundingClientRect().bottom ?? Infinity) <= offset &&
        (sharedJourney.current?.getBoundingClientRect().top ?? Infinity) > offset + barHeight
      );
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
    const resize = new ResizeObserver(schedule);
    if (panel.current) resize.observe(panel.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => { observer.disconnect(); resize.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
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
    setActive(next.id);
    history.replaceState(null, "", `#${next.id}`);
    requestAnimationFrame(() => {
      const navBottom = Math.max(0, document.querySelector("nav")?.getBoundingClientRect().bottom ?? 0);
      const rect = tabs.current?.getBoundingClientRect();
      if (rect) window.scrollTo({ top: scrollY + rect.top - navBottom, behavior: reduced ? "instant" : "smooth" });
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
      <a className={styles.scrollCue} href="#overview" onClick={event => { event.preventDefault(); changeTab("overview"); }}><span>Explore our emergency care</span><AnimatedChevronDown /></a>
    </section>

    <div className={styles.tabExperience} data-nav-theme="dark">
    <div ref={tabs} className={styles.mainTabs} data-emergency-tabs data-nav-theme="dark" inert={tabsPinned}>{renderTabs(false)}</div>
    <div className={`${styles.compactTabs} ${styles.compactTabsDark}`} data-emergency-tabs data-nav-theme="dark" hidden={!tabsPinned}>{renderTabs(true)}</div>
    <div ref={panel} id="emergency-tab-panel" role="tabpanel" aria-labelledby={`${tabsPinned ? "compact-emergency-tab" : "emergency-tab"}-${active}`} tabIndex={-1}>
    {active === "overview" && <section id="overview" className={styles.overviewHero} data-nav-theme="dark" aria-labelledby="overview-title">
      <Image src="/assets/doctor_team.png" alt="Narayana Health's multidisciplinary emergency care team" fill sizes="100vw" className={styles.overviewPhoto} />
      <div className={styles.overviewShade} aria-hidden="true" />
      <div className={`${styles.container} ${styles.overviewLayout}`}>
        <motion.div {...reveal} className={styles.overviewCopy}><h2 id="overview-title" className={styles.sectionTitle}>{content.overview.title}</h2><p>{content.overview.subtitle}</p></motion.div>
        <motion.aside {...reveal} className={styles.overviewMetrics} aria-labelledby="network-title"><h3 id="network-title">India’s Most Comprehensive Emergency Care Network</h3><dl>{content.response.items.map(item => <div key={item.title}><dt>{item.title}</dt><dd>{item.description}</dd></div>)}</dl></motion.aside>
      </div>
    </section>}

    {active === "conditions" && <section id="conditions" className={styles.section} aria-labelledby="conditions-title">
      <motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="conditions-title" className={styles.sectionTitle}>Conditions We Treat</h2><p className={styles.subtitle}>Explore {content.conditions.length} areas of emergency care.</p></motion.div>
      <EmergencyCareExplorer headingId="conditions-title" areas={content.conditions.map((item, index) => ({ ...item, label: conditionCategories[index].label, circleImage: conditionCategories[index].image }))} />
    </section>}

    {(active === "overview" || active === "expertise") && <section id="expertise" className={`${styles.section} ${styles.container}`} aria-labelledby="expertise-title">
      <motion.div {...reveal} className={styles.sectionHeader}><h2 id="expertise-title" className={styles.sectionTitle}>{content.team.title}</h2><p className={styles.subtitle}>{content.team.subtitle}</p></motion.div>
      <div className={styles.teamGrid}>{content.team.items.slice(0, 6).map((item, index) => { const Icon = teamIcons[index]; return <motion.article {...reveal} key={item.title} className={styles.teamCard}><span className={styles.iconBox}><Icon aria-hidden="true" /></span><div><h3>{item.title}</h3><p>{item.subtitle}</p></div></motion.article>; })}</div>
      {active === "expertise" && <div className={`${styles.accordion} ${styles.additionalTeam}`}><details><summary><span>Support across every age and stage of life</span><Plus aria-hidden="true" /></summary><div className={styles.supportGrid}>{content.team.items.slice(6).map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.subtitle}</p></div>)}</div></details></div>}
      {active === "overview" && <div className={styles.centerAction}><MenuAction label="Explore our expertise" context="View the full emergency team and protocols" onClick={() => changeTab("expertise")} /></div>}
    </section>}

    {active === "expertise" && <>
      <section className={styles.section} aria-labelledby="protocol-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="protocol-title" className={styles.sectionTitle}>{content.protocols.title}</h2><p className={styles.subtitle}>{content.protocols.subtitle}</p></motion.div>
        <HorizontalMediaRail id="emergency-protocols" labelledBy="protocol-title" itemLabel="emergency protocols" heading={null} variant="gallery">
          {content.protocols.items.map((item, index) => <motion.article {...reveal} key={item.title} className={styles.photoCard}><Image src={`/emergency/protocol-${index}.webp`} alt="" fill sizes="(max-width: 768px) 85vw, 512px" /><div className={styles.photoCardShade} aria-hidden="true" /><div className={styles.photoCardCopy}><h3>{item.title}</h3><p className={styles.protocolHeading}>{item.heading}</p><p>{item.description}</p></div></motion.article>)}
        </HorizontalMediaRail>
      </section>
      <section className={styles.performanceSection} aria-labelledby="performance-title"><div className={styles.performance}>
        <motion.div className={styles.performanceBackground} initial={{ opacity: reduced ? 1 : 0, filter: reduced ? "blur(0px)" : "blur(16px)" }} whileInView={{ opacity: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.15 }} transition={{ duration: reduced ? 0 : duration.slowest, ease: ease.out }}><Image src="/bento-advanced-technology.jpg" alt="" fill sizes="100vw" className={styles.performancePhoto} /></motion.div><div className={styles.performanceShade} aria-hidden="true" />
        <div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><h2 id="performance-title" className={styles.sectionTitle}>{content.performance.title}</h2><p className={styles.subtitle}>{content.performance.subtitle}</p></motion.div>
          <motion.dl className={styles.performanceGrid} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={{ hidden: {}, visible: { transition: { staggerChildren: reduced ? 0 : duration.fast } } }}>
            {content.performance.items.map(item => <motion.div key={item.title} variants={{ hidden: { opacity: reduced ? 1 : 0, filter: reduced ? "blur(0px)" : "blur(8px)" }, visible: { opacity: 1, filter: "blur(0px)", transition: { duration: reduced ? 0 : duration.slowest, ease: ease.out } } }}><dt>{item.title}</dt><dd>{item.subtitle}</dd><dd className={styles.benchmark}>{item.head.replace("Benchmark1-", "Benchmark¹ · ")}</dd></motion.div>)}
          </motion.dl><p className={styles.sourceNote}>{content.performance.note}</p>
        </div>
      </div></section>
    </>}

    {active === "procedures" && <section id="procedures" className={styles.section} aria-labelledby="procedures-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="procedures-title" className={styles.sectionTitle}>Emergency Procedures We Perform</h2></motion.div>
      <EmergencyCareExplorer headingId="procedures-title" expanded areas={content.procedures.map((item, index) => ({ ...item, label: ["Airway & critical care", "Lungs & ventilation", "Heart", "Brain", "Surgery", "Women’s care", "Trauma & injuries", "Sugar & blood pressure", "Kidneys", "Poisoning", "Children", "Ear, nose & throat"][index], image: content.conditions[[3, 3, 1, 2, 5, 9, 0, 7, 6, 11, 10, 4][index]].image }))} />
    </section>}

    {active === "hospitals" && <section id="hospitals" className={styles.section} aria-labelledby="hospitals-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="hospitals-title" className={styles.sectionTitle}>Hospitals with 24x7 Emergency</h2><p className={styles.subtitle}>Round-the-Clock Emergency Care Across All Our Hospitals</p><div className={styles.citySwitcher}><label className={styles.srOnly} htmlFor="emergency-city">Choose your location</label><div className={styles.selectWrap}><MapPin aria-hidden="true" /><select id="emergency-city" value={city} onChange={event => setCity(event.target.value)}>{content.cities.map(item => <option value={item.label} key={item.label}>{item.label}</option>)}</select><ChevronDown aria-hidden="true" /></div></div></motion.div>
      <p className={styles.resultCount} role="status">{hospitals.length} {hospitals.length === 1 ? "location" : "locations"} in {city}</p>
      <HorizontalMediaRail key={city} id="emergency-hospitals" labelledBy="hospitals-title" itemLabel="emergency hospitals" heading={null} variant="gallery">{hospitals.map(hospital => <motion.div {...reveal} key={hospital.id}><EmergencyHospitalCard hospital={hospital} /></motion.div>)}</HorizontalMediaRail>
      {hospitals.length === 0 && <p className={styles.empty}>No locations are listed for this city on the current directory. <a href={CALL}>Call {PHONE}</a> for assistance.</p>}
    </section>}
    </div>
    </div>

    {/* Shared content remains mounted and unchanged when the care tab changes. */}
    <div ref={sharedJourney} className={styles.sharedJourney} data-nav-theme="light" data-emergency-shared>
      <section className={`${styles.section} ${styles.container} ${styles.certificationIntro}`} aria-labelledby="stroke-centre-title">
        <div className={styles.certificationImage}><Image src="/emergency/mazumdar-shaw.webp" alt="Mazumdar Shaw Medical Centre, Bangalore" fill sizes="(max-width: 768px) 90vw, 45vw" /></div>
        <motion.div {...reveal} className={styles.certificationText}>
          <span className={styles.certificationSeal}><Award aria-hidden="true" /></span>

          <h2 id="stroke-centre-title" className={styles.sectionTitle}>{content.certification.title}</h2>
          <p className={styles.subtitle}>{content.certification.subtitle}</p>
          <span className={styles.centreLocation}><MapPin aria-hidden="true" />{content.certification.image_text}</span>
        </motion.div>
      </section>

<section className={styles.section} data-nav-theme="light" aria-labelledby="why-emergency-title"><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><h2 id="why-emergency-title" className={styles.sectionTitle}>{content.benefits.title}</h2><p className={styles.subtitle}>{content.benefits.subtitle}</p></motion.div>
      <motion.div {...reveal} className={styles.careGrid}>{content.benefits.items.map((item, index) => <article key={item.title} className={styles.careCard} data-card={index} data-nav-theme="dark"><Image src={["/navigation/services-ambulance.webp", "/emergency/care-1.webp", "/assets/doctor_team.png"][index]} alt={item.title} fill sizes="(max-width: 768px) 90vw, 40vw" className={styles.coverPhoto} /><div className={styles.cardWash} /><div className={styles.careCopy}><h3>{item.title}</h3><p>{item.description}</p></div></article>)}</motion.div>
    </div></section>

<section className={styles.section} data-nav-theme="light" aria-labelledby="inside-er-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="inside-er-title" className={styles.sectionTitle}>{content.video.title}</h2><p className={styles.subtitle}>{content.video.subtitle}</p></motion.div><button type="button" className={styles.videoPoster} onClick={openVideo} aria-label="Play Inside the Emergency Room"><Image src="/emergency/er-video.webp" alt="Inside ER: real emergency cases from Narayana Health" fill sizes="100vw" /><span className={styles.play}><Play aria-hidden="true" /></span><span className={styles.videoCaption}>Inside the Emergency Room <ArrowUpRight aria-hidden="true" /></span></button></section>

<section className={styles.section} aria-labelledby="guide-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="guide-title" className={styles.sectionTitle}>{content.articles.title}</h2><p className={styles.subtitle}>{content.articles.subtitle}</p></motion.div>
      <HorizontalMediaRail id="emergency-guides" labelledBy="guide-title" itemLabel="emergency guides" heading={null} variant="gallery">{content.articles.items.map(item => <motion.article {...reveal} key={item.link} className={styles.photoCard}><a href={item.href} className={styles.fullCardLink}><Image src={item.image} alt="" fill sizes="(max-width: 768px) 85vw, 512px" /><div className={styles.photoCardShade} aria-hidden="true" /><div className={styles.photoCardCopy}><span className={styles.cardMeta}>{item.category} · {item.date}</span><h3>{item.title}</h3><p>{item.author}</p><span className={styles.cardLink}>Read article <ArrowUpRight aria-hidden="true" /></span></div></a></motion.article>)}</HorizontalMediaRail>
    </section>

<section className={styles.section} aria-labelledby="newsletter-title"><motion.div {...reveal} className={`${styles.container} ${styles.sectionHeader}`}><h2 id="newsletter-title" className={styles.sectionTitle}>{content.newsletters.title}</h2><p className={styles.subtitle}>{content.newsletters.subtitle}</p></motion.div>
      <HorizontalMediaRail id="emergency-newsletters" labelledBy="newsletter-title" itemLabel="emergency newsletters" heading={null} variant="gallery">{content.newsletters.items.map(item => <motion.article {...reveal} key={item.title} className={`${styles.photoCard} ${styles.newsletterCard}`}><a href={item.cta_link} target="_blank" rel="noopener noreferrer" className={styles.fullCardLink}><Image src={item.image} alt="" fill sizes="(max-width: 768px) 85vw, 512px" /><div className={styles.photoCardShade} aria-hidden="true" /><div className={styles.photoCardCopy}><h3>{item.title}</h3><span className={styles.cardLink}>{item.cta_name}<Download aria-hidden="true" /></span></div></a></motion.article>)}</HorizontalMediaRail>
    </section>

<section className={styles.section} data-nav-theme="light" aria-labelledby="faq-title"><div className={styles.container}><motion.div {...reveal} className={styles.sectionHeader}><h2 id="faq-title" className={styles.sectionTitle}>{content.faqs.title}</h2><p className={styles.subtitle}>{content.faqs.subtitle}</p></motion.div><div className={`${styles.accordion} ${styles.faqList}`}>{content.faqs.items.map(item => <details key={item.question} name="emergency-faqs"><summary><span>{item.question}</span><Plus aria-hidden="true" /></summary><div className={styles.answer}><p>{item.answer}</p></div></details>)}</div></div></section>

<section className={`${styles.section} ${styles.container}`} aria-labelledby="closing-title"><div className={styles.closingCard}><h2 id="closing-title" className={styles.sectionTitle}>Looking for Expert Medical Care?</h2><p className={styles.subtitle}>Your health matters. That’s why we make finding and booking the right doctor easy.</p><div className={styles.closingActions}><Link href="/doctors" className={styles.primaryButton}><CalendarCheck aria-hidden="true" />Book Appointment</Link><a href="#hospitals" className={styles.glassButton} onClick={event => { event.preventDefault(); changeTab("hospitals"); }}>Find Our Hospital<ArrowUpRight aria-hidden="true" /></a><a href={CALL} className={styles.textLink}><PhoneCall />{PHONE}</a></div></div></section>

    </div>

    {showCall && <aside className={styles.mobileCall} aria-label="Emergency call shortcut"><span><strong>24/7 Emergency</strong><small>No appointment needed</small></span><a href={CALL}><PhoneCall aria-hidden="true" /><span>Call now</span></a></aside>}
    <dialog ref={videoDialog} data-lenis-prevent className={styles.videoDialog} aria-labelledby="emergency-video-title" onCancel={() => setVideoOpen(false)} onClose={() => { setVideoOpen(false); videoTrigger.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) setVideoOpen(false); }}><div className={styles.videoDialogHeader}><h2 id="emergency-video-title">{content.video.title}</h2><button type="button" onClick={() => setVideoOpen(false)} aria-label="Close video"><X aria-hidden="true" /></button></div>{videoOpen && <iframe src="https://www.youtube-nocookie.com/embed/PXX79R0w6Cc?autoplay=1" title="Inside the Emergency Room — Narayana Health" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen />}</dialog>
  </div>;
}

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useHeroShrink } from "@/lib/useHeroShrink";
import {
    AlertTriangle,
    Link as LinkIcon,
    PhoneCall,
    Plus,
    Minus,
    Check,
    ShieldAlert,
    Share2
} from "lucide-react";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import RollingNumber from "@/components/ui/RollingNumber";
import MobileRollingStats from "@/components/ui/MobileRollingStats";
import { getSymptomDetailData, SymptomDetailData } from "@/data/symptomsData";
import { HospitalCard } from "@/components/ui/HospitalCarousel";
import carouselStyles from "@/components/ui/HospitalCarousel.module.css";
import ClinicalFloatingSideActions from "@/components/ui/ClinicalFloatingSideActions";
import SpecialityFAQ from "@/components/ui/SpecialityFAQ";
import BlogCtaBanner from "@/components/blog/BlogCtaBanner";
import {
    ClinicalSummaryBanner,
    ClinicalEditorialFigures,
} from "@/components/ui/ClinicalReviewedBySection";
import MedicallyReviewedBand from "@/components/ui/MedicallyReviewedBand";
import {
    NearbySpecialistsCarousel,
    NearbyCareCentresCarousel,
} from "@/components/ui/NearbyClinicalCarousels";
import ShareWidget from "@/components/ui/ShareWidget";
import ContactCareSidebarCard from "@/components/ui/ContactCareSidebarCard";
import GuideFeedbackWidget from "@/components/ui/GuideFeedbackWidget";
import ClinicalAtAGlanceCard from "@/components/ui/ClinicalAtAGlanceCard";
import DetailStickyBreadcrumb from "@/components/ui/DetailStickyBreadcrumb";
import styles from "./SymptomDetail.module.css";

interface PageProps {
    params: Promise<{ slug: string }>;
}

export default function SymptomDetailPage({ params }: PageProps) {
    const { slug } = React.use(params);
    const detail: SymptomDetailData = getSymptomDetailData(slug);

    const [activeSection, setActiveSection] = useState<string>("overview");
    const [copyToast, setCopyToast] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // CoE-style sticky hero inset over clean white reading surface
    const { containerRef: heroShrinkRef, wrapperStyle: heroWrapperStyle, heroMotionStyle, pageMotionStyle } =
        useHeroShrink("detail");

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
            setIsScrolled(scrollPos > 320);

            const sections = detail.toc.map((item) => document.getElementById(item.id)).filter(Boolean);
            const scrollPosition = scrollPos + 200;

            for (let i = sections.length - 1; i >= 0; i--) {
                const sec = sections[i];
                if (sec && sec.offsetTop <= scrollPosition) {
                    setActiveSection(sec.id);
                    break;
                }
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, [detail.toc]);

    const handleCopyLink = () => {
        if (typeof window !== "undefined") {
            navigator.clipboard.writeText(window.location.href);
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2500);
        }
    };

    const handleShare = async () => {
        if (typeof navigator !== "undefined" && navigator.share) {
            try {
                await navigator.share({
                    title: detail.title,
                    text: detail.leadParagraph,
                    url: window.location.href,
                });
            } catch {
                // User cancelled
            }
        } else if (typeof navigator !== "undefined" && navigator.clipboard) {
            await navigator.clipboard.writeText(window.location.href);
            setCopyToast(true);
            setTimeout(() => setCopyToast(false), 2400);
        }
    };

    return (
        <motion.div
            className={styles.detailPageContainer}
            style={pageMotionStyle}
        >
            {/* ─── DETAIL HERO (STICKY INSET SHRINK OVER WHITE READING SURFACE) ───── */}
            <div ref={heroShrinkRef} data-nav-theme="light" style={heroWrapperStyle}>
                <motion.section
                    className={`${styles.detailHero} ${styles.detailHeroV2}`}
                    data-nav-theme="dark"
                    style={heroMotionStyle}
                >
                    <div className={styles.stationaryCanvas} aria-hidden="true">
                        <motion.div
                            className={styles.stationaryMotionWrapper}
                            initial={{ scale: 1.12, opacity: 0.5 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <Image
                                src={detail.heroImage}
                                alt=""
                                fill
                                priority
                                sizes="100vw"
                                className={styles.stationaryImage}
                            />
                        </motion.div>
                        <div className={styles.stationaryCanvasOverlay} />
                    </div>

                    <div className={styles.heroBgOverlay} />

                    <div className={styles.heroInner}>
                        <motion.div
                            className={styles.heroLeftCol}
                            initial={{ opacity: 0, scale: 0.97, y: 14 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className={styles.breadcrumbsWrapper}>
                                <Breadcrumbs
                                    items={[
                                        { label: "Home", href: "/" },
                                        { label: "Symptoms", href: "/symptoms" },
                                        { label: detail.shortTitle },
                                    ]}
                                    theme="dark"
                                />
                            </div>

                            <div className={styles.heroEyebrow}>
                                {detail.speciality} &bull; {detail.severity} TRIAGE
                            </div>

                            <h1 className={styles.heroMainTitle}>
                                {detail.heroTitle}
                            </h1>

                            {(detail.leadParagraph || detail.heroSubtitle) && (
                                <p className={styles.heroSubTitle}>
                                    {detail.leadParagraph || detail.heroSubtitle}
                                </p>
                            )}

                            <div className={styles.heroActionsRow}>
                                <Link
                                    href={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
                                    className={styles.heroPrimaryBtn}
                                >
                                    <span>Consult Specialist</span>
                                </Link>
                            </div>

                            <MobileRollingStats
                                items={[
                                    { staticValue: detail.metrics.urgency, label: "Clinical Urgency" },
                                    { staticValue: detail.metrics.specialist, label: "Recommended Specialist" },
                                    { staticValue: detail.metrics.diagnosticTurnaround, label: "Triaging Speed" },
                                    { staticValue: detail.metrics.hospitalNetwork, label: "Emergency Centers" },
                                ]}
                            />
                        </motion.div>

                        {/* Bottom Hero Metrics (Matching CSR Hero) */}
                        <motion.div
                            className={styles.metricsBottomWrap}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <div className={styles.statsGrid}>
                                <div className={styles.statBlock}>
                                    <span className={styles.statNumber}>
                                        <RollingNumber value={detail.metrics.urgency} />
                                    </span>
                                    <span className={styles.statLabel}>Clinical Urgency</span>
                                </div>
                                <div className={styles.statBlock}>
                                    <span className={styles.statNumber}>
                                        <RollingNumber value={detail.metrics.specialist} />
                                    </span>
                                    <span className={styles.statLabel}>Recommended Specialist</span>
                                </div>
                                <div className={styles.statBlock}>
                                    <span className={styles.statNumber}>
                                        <RollingNumber value={detail.metrics.diagnosticTurnaround} />
                                    </span>
                                    <span className={styles.statLabel}>Triaging Speed</span>
                                </div>
                                <div className={styles.statBlock}>
                                    <span className={styles.statNumber}>
                                        <RollingNumber value={detail.metrics.hospitalNetwork} />
                                    </span>
                                    <span className={styles.statLabel}>Emergency Centers</span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </motion.section>
            </div>

            <DetailStickyBreadcrumb
                currentTitle={detail.shortTitle}
                parentLabel="Symptoms Directory"
                motionKey={`symptom-sticky-breadcrumb-${detail.slug}`}
            />

            {/* ─── MAIN CONTENT BODY ────────────────────────────────────────────── */}
            <div
                className={`${styles.readingExperienceWrapper} ${styles.readingExperienceWrapperV2}`}
                data-nav-theme="light"
            >
                <main className={styles.mainLayoutContainer}>
                    {/* Full-width Clinical Pathway Banner positioned above the Two-Column Index */}
                    <ClinicalAtAGlanceCard
                        bookingHref="/book-an-appointment"
                        secondOpinionHref="/book-an-appointment?flow=second-opinion"
                        theme="dynamic"
                    />

                    <div className={styles.twoColumnGrid}>
                        {/* Sticky Table of Contents Sidebar */}
                        <aside className={styles.stickySidebar}>
                            <div className={styles.tocSectionSelector}>
                                <div className={styles.tocEyebrow}>
                                    <span>On This Guide</span>
                                </div>
                                <nav className={styles.tocNavRail} aria-label="Table of contents">
                                    <ul className={styles.tocList}>
                                        {detail.toc.map((item) => {
                                            const isActive = activeSection === item.id;
                                            return (
                                                <li key={item.id} className={styles.tocListItem}>
                                                    <a
                                                        href={`#${item.id}`}
                                                        className={`${styles.tocLink} ${isActive ? styles.tocLinkActive : ""}`}
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            const el = document.getElementById(item.id);
                                                            if (el) {
                                                                const isMobileView = typeof window !== "undefined" && window.innerWidth <= 960;
                                                                const yOffset = isMobileView ? -112 : -88;
                                                                const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                                                                window.scrollTo({ top: y, behavior: "smooth" });
                                                                setActiveSection(item.id);
                                                            }
                                                        }}
                                                    >
                                                        <span className={styles.tocIndicatorMarker} aria-hidden="true" />
                                                        <span className={styles.tocLinkLabel}>{item.label}</span>
                                                    </a>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </nav>
                            </div>

                            {/* Mobile Persistent Share Icon Pill inside sticky header */}
                            <button
                                type="button"
                                className={styles.mobileStickyShareBtn}
                                onClick={handleShare}
                                aria-label="Share this guide"
                                title="Share"
                            >
                                <Share2 size={16} />
                            </button>

                            {/* Standardized Share widget */}
                            <ShareWidget shareTitle={detail.title} title="Share this guide" />

                            {/* 24×7 Care Helpline Contact Companion (Below Share on Index Side) */}
                            <ContactCareSidebarCard
                                subtitle="Immediate guidance on warning signs, emergency triage & specialist consultations."
                                theme="dynamic"
                            />

                            {/* Compact On-Demand Feedback Widget */}
                            <GuideFeedbackWidget guideType="symptom guide" theme="dynamic" />
                        </aside>

                        {/* Reading Content Focus Canvas */}
                        <div className={styles.contentFocusCanvas}>
                            {/* SECTION: Overview & 4-5 Line Clinical Summary */}
                            <section id="overview" className={styles.contentSection}>
                                <h2 className={styles.sectionHeading}>Clinical Overview</h2>
                                <ClinicalSummaryBanner
                                    eyebrow={`${detail.speciality} · Symptom Triage Summary`}
                                    summary={`${detail.leadParagraph} Prompt evaluation by a ${detail.metrics.specialist} helps differentiate benign triggers from high-priority medical conditions requiring rapid diagnostic workup (${detail.metrics.diagnosticTurnaround}) and targeted intervention.`}
                                    reviewerName={detail.doctors[0]?.name || "Dr. Devi Prasad Shetty"}
                                    theme="dynamic"
                                />
                                <div className={styles.quickFactsGrid}>
                                    <div className={styles.factCard}>
                                        <span className={styles.factCardLabel}>Affected System</span>
                                        <span className={styles.factCardVal}>{detail.speciality}</span>
                                    </div>
                                    <div className={styles.factCard}>
                                        <span className={styles.factCardLabel}>Clinical Priority</span>
                                        <span className={styles.factCardVal}>{detail.urgencyLevel}</span>
                                    </div>
                                    <div className={styles.factCard}>
                                        <span className={styles.factCardLabel}>Consultation</span>
                                        <span className={styles.factCardVal}>{detail.metrics.specialist}</span>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION: Red-Flag Emergency Signs */}
                            <section id="emergency-warning" className={styles.contentSection}>
                                <div className={styles.emergencyAlertBanner}>
                                    <div className={styles.alertHeader}>
                                        <ShieldAlert size={20} className={styles.alertIcon} />
                                        <h2 className={styles.alertTitle}>Red-Flag Warning Signs (Seek Immediate Emergency Care)</h2>
                                    </div>
                                    <p className={styles.alertSub}>
                                        If you or a loved one experience any of the following critical warning signs, proceed immediately to the nearest Narayana Health emergency department or call our 24×7 emergency team:
                                    </p>
                                    <div style={{ marginBottom: "14px" }}>
                                        <a
                                            href="tel:18003090309"
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "8px",
                                                padding: "9px 16px",
                                                borderRadius: "8px",
                                                background: "#dc2626",
                                                color: "#ffffff",
                                                fontSize: "13px",
                                                fontWeight: 700,
                                                textDecoration: "none",
                                            }}
                                        >
                                            <PhoneCall size={14} />
                                            <span>Call Emergency 24×7</span>
                                        </a>
                                    </div>
                                    <ul className={styles.alertList}>
                                        {detail.emergencySigns.map((sign, idx) => (
                                            <li key={idx} className={styles.alertListItem}>
                                                <AlertTriangle size={15} className={styles.alertBulletIcon} />
                                                <span>{sign}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            {/* SECTION: Common Causes */}
                            <section id="causes" className={styles.contentSection}>
                                <h2 className={styles.sectionHeading}>Common Medical Causes</h2>
                                <p className={styles.sectionLeadText}>
                                    A symptom can result from localized organ distress or complex systemic conditions. Our consultants systematically differentiate between benign triggers and conditions requiring medical or surgical intervention:
                                </p>
                                <div className={styles.clinicalReadingList}>
                                    {detail.causes.map((cause, idx) => (
                                        <div key={idx} className={styles.clinicalReadingItem}>
                                            <h3 className={styles.clinicalItemTitle}>{cause.name}</h3>
                                            <p className={styles.clinicalItemDesc}>{cause.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* SECTION: When to Consult */}
                            <section id="when-to-consult" className={styles.contentSection}>
                                <h2 className={styles.sectionHeading}>When to Consult a Specialist</h2>
                                <p className={styles.sectionLeadText}>
                                    Even in the absence of acute emergency red flags, early specialist consultation prevents disease progression. Schedule an outpatient appointment if:
                                </p>
                                <ul className={styles.symptomsChecklist}>
                                    {detail.whenToSeekCare.map((item, idx) => (
                                        <li key={idx} className={styles.symptomCheckRow}>
                                            <span className={styles.symptomCheckText}>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </section>

                            {/* SECTION: Diagnostic Pathway */}
                            <section id="diagnostic-pathway" className={styles.contentSection}>
                                <h2 className={styles.sectionHeading}>Evidence-Based Diagnostic Pathway</h2>
                                <p className={styles.sectionLeadText}>
                                    At Narayana Health, precision diagnostics rapidly differentiate etiologies to establish targeted treatment plans without unnecessary delays:
                                </p>
                                <div className={styles.protocolsList}>
                                    {detail.diagnosticPath.map((step, idx) => (
                                        <div key={idx} className={styles.protocolRow}>
                                            <span className={styles.protocolNum}>{String(idx + 1).padStart(2, "0")}</span>
                                            <div className={styles.protocolContent}>
                                                <h3 className={styles.protocolTitle}>{step.title}</h3>
                                                <p className={styles.protocolDesc}>{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <ClinicalEditorialFigures
                                    items={[
                                        {
                                            src: detail.heroImage || "/images/procedures/procedure_mri.png",
                                            alt: `${detail.shortTitle} clinical triage`,
                                            caption: `Clinical Triage & Differential Evaluation · ${detail.shortTitle}`,
                                        },
                                        {
                                            src: "/images/procedures/procedure_mri.png",
                                            alt: `${detail.shortTitle} diagnostic workup`,
                                            caption: `Rapid Diagnostic Imaging & Biomarker Profiling (${detail.speciality})`,
                                        },
                                    ]}
                                />
                            </section>

                            {/* SECTION: Recommended Specialists Carousel (Modular & Softened Gradient) */}
                            <NearbySpecialistsCarousel
                                id="specialists"
                                title="Consult Senior Specialists"
                                subtitle={`Meet accredited senior consultants specializing in ${detail.speciality} across the Narayana Health network:`}
                                doctors={detail.doctors}
                                specialityFilter={detail.specialitySlug}
                                actionLabel="Book"
                            />

                            {/* SECTION: FAQs */}
                            <section id="faqs" className={styles.contentSection}>
                                <h2 className={styles.sectionHeading}>Frequently Asked Questions</h2>
                                <SpecialityFAQ faqs={detail.faqs} theme="light" fluid />
                            </section>

                            {/* Hospital Centers Carousel (Multi-unit Bangalore & NH Network) */}
                            <NearbyCareCentresCarousel
                                id="hospitals"
                                title="Specialised Care Centers"
                                subtitle="Receive multidisciplinary emergency and clinical care across our multiple Bangalore units and tertiary centers:"
                                hospitals={detail.hospitals}
                            />
                        </div>
                    </div>

                    <MedicallyReviewedBand
                        id="medically-reviewed-by"
                        theme="light"
                        fluid
                        specialityName={detail.speciality}
                        reviewer={{
                            name: detail.doctors[0]?.name || "Dr. Devi Prasad Shetty",
                            designation: "Senior Consultant & Clinical Lead",
                            specialty: detail.doctors[0]?.speciality || detail.speciality,
                            image: detail.doctors[0]?.image || "/doctors/doc_vivek.jpg",
                            reviewDate: "November 2026",
                        }}
                    />
                </main>
            </div>

            {/* ─── PRE-FOOTER CTA CARD BANNER (UNIVERSAL DESIGN TOKEN) ─────── */}
            <BlogCtaBanner
                eyebrow="24×7 EMERGENCY & TRIAGE NETWORK"
                title="Experiencing Severe or Sudden Symptoms?"
                subtitle="Don't ignore critical warning signs. Our emergency care units and rapid triage helpline are available 24×7 with state-of-the-art ambulances, cath labs, and trauma specialists."
                primaryBtn={{
                    href: `/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`,
                    text: "Consult a Specialist Now",
                }}
                secondaryBtn={{
                    href: "/treatments",
                    text: "Explore Treatments",
                }}
                phoneText="Emergency Helpline: 1800 309 0309"
                phoneHref="tel:18003090309"
            />

            {/* Unified Clinical FAB (Book Consultation, Contact Support, Ask Pulse) */}
            <ClinicalFloatingSideActions
                consultHref={`/doctors?speciality=${encodeURIComponent(detail.specialitySlug)}`}
                consultLabel={"Book\nConsultation"}
                conditionTitle={detail.shortTitle}
                pulseQuery={`I want to know about symptoms of ${detail.heroTitle}: possible causes, emergency signs, and consultation options.`}
                isScrolled={isScrolled}
            />
        </motion.div>
    );
}

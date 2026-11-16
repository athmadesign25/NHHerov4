"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Check, Copy, ExternalLink, Layers, FileCode2, LayoutTemplate } from "lucide-react";
import styles from "./DevHandover.module.css";

interface ReusableComponentItem {
  id: string;
  name: string;
  category: "Global UI" | "Clinical Detail" | "Carousels" | "Blog & Editorial";
  filePath: string;
  reuseCount: string;
  description: string;
  routes: { label: string; href: string }[];
}

interface PageHandoverItem {
  pageName: string;
  route: string;
  template: string;
  notes: string;
  reusableComponents: string[];
}

const REUSABLE_COMPONENTS: ReusableComponentItem[] = [
  {
    id: "organ-chips-carousel",
    name: "<OrganSystemChipsCarousel />",
    category: "Carousels",
    filePath: "src/components/ui/OrganSystemChipsCarousel.tsx",
    reuseCount: "Used on 4 Library Pages",
    description:
      "Horizontal organ-system filter carousel starting with 'View All' chip + 14 organ-system bubbles (Heart, Brain, Kidneys, Liver, Lungs…), Left/Right arrows, and 'View All (14)' grid toggle.",
    routes: [
      { label: "/treatments", href: "/treatments" },
      { label: "/diseases", href: "/diseases" },
      { label: "/symptoms", href: "/symptoms" },
      { label: "/diagnostics", href: "/diagnostics" },
    ],
  },
  {
    id: "clinical-summary-banner",
    name: "<ClinicalSummaryBanner />",
    category: "Clinical Detail",
    filePath: "src/components/ui/ClinicalReviewedBySection.tsx",
    reuseCount: "Used on 5 Detail Pages",
    description:
      "4–5 line executive clinical summary banner at the top of #overview with inline verified doctor anchor pill (#medical-reviewer). Supports dynamic dark/light scroll CSS variables.",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
      { label: "/articles/sugar-free-sweets-for-diabetics", href: "/articles/sugar-free-sweets-for-diabetics" },
    ],
  },
  {
    id: "clinical-reviewed-by",
    name: "<ClinicalReviewedBySection />",
    category: "Clinical Detail",
    filePath: "src/components/ui/ClinicalReviewedBySection.tsx",
    reuseCount: "Used on 5 Detail Pages",
    description:
      "Dedicated Google E-E-A-T medical reviewer verification card ('Reviewed by Dr. ___', credentials, hospital unit, verification date, and Book Consultation link).",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
      { label: "/articles/sugar-free-sweets-for-diabetics", href: "/articles/sugar-free-sweets-for-diabetics" },
    ],
  },
  {
    id: "clinical-editorial-figures",
    name: "<ClinicalEditorialFigures />",
    category: "Clinical Detail",
    filePath: "src/components/ui/ClinicalReviewedBySection.tsx",
    reuseCount: "Used on 4 Detail Pages",
    description:
      "2-column clinical anatomical & workflow visual figures with captions injected inside long-form medical content so pages never read as all text.",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
    ],
  },
  {
    id: "nearby-specialists-carousel",
    name: "<NearbySpecialistsCarousel />",
    category: "Carousels",
    filePath: "src/components/ui/NearbyClinicalCarousels.tsx",
    reuseCount: "Used on 5 Detail Pages",
    description:
      "Horizontal snap carousel of 6+ specialists with softened card gradient contrast, Left/Right arrows, and a modular 'Hide Section' / 'Show Doctors Section' toggle pill.",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
      { label: "/articles/sugar-free-sweets-for-diabetics", href: "/articles/sugar-free-sweets-for-diabetics" },
    ],
  },
  {
    id: "nearby-care-centres-carousel",
    name: "<NearbyCareCentresCarousel />",
    category: "Carousels",
    filePath: "src/components/ui/NearbyClinicalCarousels.tsx",
    reuseCount: "Used on 4 Detail Pages",
    description:
      "Horizontal snap carousel of 8 NH Hospital Units (including multiple Bangalore units) reusing <HospitalCard /> with softened scrim contrast and Left/Right navigation.",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
    ],
  },
  {
    id: "blog-cta-banner",
    name: "<BlogCtaBanner />",
    category: "Global UI",
    filePath: "src/components/blog/BlogCtaBanner.tsx",
    reuseCount: "Used on 14+ Pages",
    description:
      "Mandatory universal pre-footer dark-blue gradient CTA card. Fully parameterized with page-aware eyebrow, title, subtitle, primaryBtn, secondaryBtn, and 24×7 helpline.",
    routes: [
      { label: "/treatments", href: "/treatments" },
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/blog", href: "/blog" },
      { label: "/hospitals/narayana-institute-cardiac-sciences-bommasandra", href: "/hospitals/narayana-institute-cardiac-sciences-bommasandra" },
      { label: "/csr", href: "/csr" },
    ],
  },
  {
    id: "floating-side-actions",
    name: "<ClinicalFloatingSideActions />",
    category: "Global UI",
    filePath: "src/components/ui/ClinicalFloatingSideActions.tsx",
    reuseCount: "Used on 14+ Pages",
    description:
      "Page-aware floating side/bottom action dock (Book Consultation, Call Support, Ask Pulse AI) that expands when scrolling past the hero CTA.",
    routes: [
      { label: "/treatments", href: "/treatments" },
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases", href: "/diseases" },
      { label: "/blog", href: "/blog" },
    ],
  },
  {
    id: "text-sweep-effect",
    name: "<TextSweepEffect />",
    category: "Global UI",
    filePath: "src/components/ui/TextSweepEffect.tsx",
    reuseCount: "Used on 12+ Pages",
    description:
      "Signature NH blue-to-red blur sweep reveal for H1/H2 headings; automatically switches to native color after sweep completion for 60fps scroll-driven dark/light transitions.",
    routes: [
      { label: "/blog?v=3", href: "/blog?v=3" },
      { label: "/procedures/heart-transplant?v=4", href: "/procedures/heart-transplant?v=4" },
      { label: "/treatments", href: "/treatments" },
    ],
  },
  {
    id: "more-from-blog-carousel",
    name: "<MoreFromOurBlogCarousel />",
    category: "Blog & Editorial",
    filePath: "src/components/blog/MoreFromOurBlogCarousel.tsx",
    reuseCount: "Used on 3 Pages",
    description:
      "3-up horizontal blog card carousel used both for 'Featured & Suggested Blogs' below the Blog V3 Hero (with scroll-driven background transition) and at the bottom of Blog Detail pages.",
    routes: [
      { label: "/blog?v=3", href: "/blog?v=3" },
      { label: "/articles/sugar-free-sweets-for-diabetics", href: "/articles/sugar-free-sweets-for-diabetics" },
    ],
  },
  {
    id: "speciality-faq",
    name: "<SpecialityFAQ />",
    category: "Clinical Detail",
    filePath: "src/components/ui/SpecialityFAQ.tsx",
    reuseCount: "Used on 7+ Pages",
    description:
      "Reusable clinical FAQ accordion component used across Specialities, Procedures, Diseases, Symptoms, Diagnostics, and Hospital Detail pages.",
    routes: [
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
      { label: "/diseases/coronary-artery-disease", href: "/diseases/coronary-artery-disease" },
      { label: "/symptoms/chest-pain", href: "/symptoms/chest-pain" },
      { label: "/diagnostics/cardiac-mri", href: "/diagnostics/cardiac-mri" },
    ],
  },
  {
    id: "breadcrumbs",
    name: "<Breadcrumbs />",
    category: "Global UI",
    filePath: "src/components/ui/Breadcrumbs.tsx",
    reuseCount: "Used on 14+ Pages",
    description:
      "Standardized accessible breadcrumb trail with dark and light theme support across all listing and detail heroes.",
    routes: [
      { label: "/treatments", href: "/treatments" },
      { label: "/blog", href: "/blog" },
      { label: "/procedures/heart-transplant", href: "/procedures/heart-transplant" },
    ],
  },
];

const PAGE_MATRIX: PageHandoverItem[] = [
  {
    pageName: "Treatments & Procedures Library (V2 Default)",
    route: "/treatments",
    template: "Template A: Health Library Explorer",
    notes: "Locked to V2 Dark Mode by default (V1/V2 switcher preserved for stakeholder review). Uses <OrganSystemChipsCarousel /> with 'View All' + 14 organs.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<TextSweepEffect />",
      "<OrganSystemChipsCarousel />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Diseases & Conditions Library",
    route: "/diseases",
    template: "Template A: Health Library Explorer",
    notes: "Shares 95% of layout and CSS tokens with /treatments. Uses <OrganSystemChipsCarousel /> and 3-column full-image cards.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<TextSweepEffect />",
      "<OrganSystemChipsCarousel />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Symptoms & Triage Library",
    route: "/symptoms",
    template: "Template A: Health Library Explorer",
    notes: "Shares Template A with emergency red-flag badges on cards and <OrganSystemChipsCarousel />.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<TextSweepEffect />",
      "<OrganSystemChipsCarousel />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Diagnostics & Lab Tests Library",
    route: "/diagnostics",
    template: "Template A: Health Library Explorer",
    notes: "Shares Template A with NABL/TAT/Fasting metadata on cards and <OrganSystemChipsCarousel />.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<TextSweepEffect />",
      "<OrganSystemChipsCarousel />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Procedure / Treatment Detail Page",
    route: "/procedures/heart-transplant",
    template: "Template B: Clinical Content Detail (2-Col Sticky TOC)",
    notes: "Includes Blend V1/V2/V3/V4 switcher (V4 dynamic scroll BG + TextSweepEffect is default), 4–5 line summary, E-E-A-T reviewer card, and modular doctor/hospital carousels.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<TextSweepEffect />",
      "<ClinicalSummaryBanner />",
      "<ClinicalEditorialFigures />",
      "<NearbySpecialistsCarousel />",
      "<NearbyCareCentresCarousel />",
      "<SpecialityFAQ />",
      "<ClinicalReviewedBySection />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Disease / Symptom / Diagnostic Detail Pages",
    route: "/diseases/coronary-artery-disease",
    template: "Template B: Clinical Content Detail (2-Col Sticky TOC)",
    notes: "All 3 routes (/diseases/[slug], /symptoms/[slug], /diagnostics/[slug]) share the exact same 2-column sticky TOC architecture and reusable clinical components.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<ClinicalSummaryBanner />",
      "<ClinicalEditorialFigures />",
      "<NearbySpecialistsCarousel />",
      "<NearbyCareCentresCarousel />",
      "<SpecialityFAQ />",
      "<ClinicalReviewedBySection />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Blogs & Clinical Insights Listing (V3 Default)",
    route: "/blog",
    template: "Template C: Editorial & Knowledge Hub",
    notes: "V3 (default) uses Clean Generic Page Header Hero (<BlogHeroV3 />) + dynamic scroll BG transition into <MoreFromOurBlogCarousel />, followed by V1 category grid & Bento section.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<BlogHeroV3 />",
      "<MoreFromOurBlogCarousel />",
      "<BlogCategoryExplore />",
      "<BlogMedicalExperts />",
      "<BlogBentoGrid />",
      "<TextSweepEffect />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
  {
    pageName: "Blog / Article Detail Page",
    route: "/articles/sugar-free-sweets-for-diabetics",
    template: "Template B: Clinical Content Detail (2-Col Sticky TOC)",
    notes: "Shares Template B with language switcher, 4–5 line clinical summary, E-E-A-T reviewer section, <NearbySpecialistsCarousel />, and <MoreFromOurBlogCarousel />.",
    reusableComponents: [
      "<Breadcrumbs />",
      "<BlogLanguageChanger />",
      "<ClinicalSummaryBanner />",
      "<NearbySpecialistsCarousel />",
      "<ClinicalReviewedBySection />",
      "<MoreFromOurBlogCarousel />",
      "<BlogCtaBanner />",
      "<ClinicalFloatingSideActions />",
    ],
  },
];

export default function DevHandoverPage() {
  const [activeTab, setActiveTab] = useState<"components" | "pages">("components");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [copied, setCopied] = useState(false);

  const categories = ["All", "Global UI", "Clinical Detail", "Carousels", "Blog & Editorial"];

  const filteredComponents =
    selectedCategory === "All"
      ? REUSABLE_COMPONENTS
      : REUSABLE_COMPONENTS.filter((c) => c.category === selectedCategory);

  const handleCopyMarkdown = () => {
    const lines = [
      "# Narayana Health — Reusable Components & Page Handover Matrix",
      "",
      "## 1. Reusable Components",
      "| Component | Category | File Path | Reused Across |",
      "| :--- | :--- | :--- | :--- |",
      ...REUSABLE_COMPONENTS.map(
        (c) =>
          `| \`${c.name}\` | ${c.category} | \`${c.filePath}\` | ${c.routes.map((r) => r.label).join(", ")} |`
      ),
      "",
      "## 2. Page-by-Page Component Breakdown",
      "| Page | Route | Shared Template | Reusable Components Used |",
      "| :--- | :--- | :--- | :--- |",
      ...PAGE_MATRIX.map(
        (p) =>
          `| **${p.pageName}** | \`${p.route}\` | ${p.template} | ${p.reusableComponents.map((rc) => `\`${rc}\``).join(", ")} |`
      ),
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2600);
  };

  return (
    <main className={styles.handoverPage} data-nav-theme="dark">
      <div className={styles.container}>
        <header className={styles.headerSection}>
          <div className={styles.eyebrow}>
            <Layers size={14} />
            <span>PM &amp; Engineering Handover Hub</span>
          </div>

          <div className={styles.titleRow}>
            <div>
              <h1 className={styles.pageTitle}>
                Reusable Component Catalog &amp; Page Matrix
              </h1>
              <p className={styles.subtitle}>
                A single source of truth for Product Managers and Developers showing how 14+ Health Library, Clinical Detail, and Editorial routes are built from <strong>3 Shared Page Templates</strong> and <strong>12 Core Reusable Components</strong>.
              </p>
            </div>

            <button type="button" className={styles.copyBtn} onClick={handleCopyMarkdown}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? "Copied Markdown for Jira / Notion!" : "Copy Handover Table (Markdown)"}</span>
            </button>
          </div>
        </header>

        {/* KPI Summary Strip */}
        <section className={styles.kpiGrid} aria-label="Architecture Summary">
          <div className={styles.kpiCard}>
            <span className={styles.kpiValue}>3</span>
            <span className={styles.kpiLabel}>Master Page Templates</span>
            <span className={styles.kpiHint}>Library Explorer, Clinical Detail, Editorial Hub</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiValue}>12</span>
            <span className={styles.kpiLabel}>Core Reusable Components</span>
            <span className={styles.kpiHint}>Shared across 4 to 14+ routes each</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiValue}>~88%</span>
            <span className={styles.kpiLabel}>Code &amp; UI Reusability</span>
            <span className={styles.kpiHint}>Build once, configure via typed props</span>
          </div>
          <div className={styles.kpiCard}>
            <span className={styles.kpiValue}>14+</span>
            <span className={styles.kpiLabel}>Routes Covered</span>
            <span className={styles.kpiHint}>Treatments, Procedures, Diseases, Symptoms, Labs, Blog</span>
          </div>
        </section>

        {/* Controls Bar */}
        <div className={styles.controlsBar}>
          <div className={styles.tabGroup} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "components"}
              className={`${styles.tabBtn} ${activeTab === "components" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("components")}
            >
              <FileCode2 size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              By Reusable Component ({REUSABLE_COMPONENTS.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "pages"}
              className={`${styles.tabBtn} ${activeTab === "pages" ? styles.tabBtnActive : ""}`}
              onClick={() => setActiveTab("pages")}
            >
              <LayoutTemplate size={14} style={{ display: "inline", marginRight: 6, verticalAlign: "middle" }} />
              By Page / Route ({PAGE_MATRIX.length})
            </button>
          </div>

          {activeTab === "components" && (
            <div className={styles.filterChipsRow}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`${styles.filterChip} ${selectedCategory === cat ? styles.filterChipActive : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tab 1: Reusable Components Catalog */}
        {activeTab === "components" ? (
          <div className={styles.componentsGrid}>
            {filteredComponents.map((comp) => (
              <div key={comp.id} className={styles.componentCard}>
                <div className={styles.cardTopRow}>
                  <span className={styles.compName}>{comp.name}</span>
                  <span className={styles.reuseBadge}>{comp.reuseCount}</span>
                </div>
                <div className={styles.filePath}>{comp.filePath}</div>
                <p className={styles.compDesc}>{comp.description}</p>
                <div className={styles.usedInRow}>
                  {comp.routes.map((r) => (
                    <Link key={r.href} href={r.href} className={styles.routePill}>
                      <span>{r.label}</span>
                      <ExternalLink size={11} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Page-by-Page Breakdown */
          <div className={styles.pagesStack}>
            {PAGE_MATRIX.map((page) => (
              <div key={page.route} className={styles.pageRowCard}>
                <div className={styles.pageRowHeader}>
                  <div className={styles.pageRouteTitle}>
                    <h2 className={styles.pageName}>{page.pageName}</h2>
                    <span className={styles.templateBadge}>{page.template}</span>
                  </div>
                  <Link href={page.route} className={styles.openLiveLink}>
                    <span>Open Live Page ({page.route})</span>
                    <ExternalLink size={13} />
                  </Link>
                </div>
                <p className={styles.compDesc}>{page.notes}</p>
                <div className={styles.pageComponentsList}>
                  {page.reusableComponents.map((rc) => (
                    <span key={rc} className={styles.pageCompChip}>
                      {rc}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

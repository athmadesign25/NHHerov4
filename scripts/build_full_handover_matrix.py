import os
import csv
from generate_handover_excel import make_clean_xlsx, make_excel_xml

# ─── 1. SHEET 1: COMPONENTS & DESIGN TOKEN MATRIX ────────────────────────────
components_headers = [
    "Simple Name",
    "Tech Component (JSX)",
    "Category",
    "File Path (TSX)",
    "CSS Module Path",
    "Token Status",
    "Core Design Tokens Applied",
    "Key Props & Parameters",
    "Variant States / Themes",
    "Mounted On Pages"
]

components_rows = [
    [
        "Breadcrumbs Navigation Trail",
        "<Breadcrumbs />",
        "Navigation",
        "src/components/ui/Breadcrumbs.tsx",
        "src/components/ui/Breadcrumbs.module.css",
        "Tokenized (100%)",
        "var(--slate-500), var(--slate-900), var(--blue-brand), var(--font-size-xs), var(--duration-fast)",
        "items: [{ label, href }], theme: 'light' | 'dark'",
        "Dark scrim header & light page reading modes",
        "Treatments, Diseases, Symptoms, Diagnostics, Blog, all Detail pages"
    ],
    [
        "Animated Gradient Shimmer Heading",
        "<TextSweepEffect />",
        "Clinical Editorial",
        "src/components/ui/TextSweepEffect.tsx",
        "Inline motion styles + globals.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--color-primary), var(--slate-900), var(--font-size-display), var(--leading-tight)",
        "words: string[], sweepMs?: number, finalColor?: string",
        "Infinite shimmer gradient, sweep reveal",
        "Library pages, Procedure detail (V4), Blog V3 hero"
    ],
    [
        "Organ Filter Chips Carousel",
        "<OrganSystemChipsCarousel />",
        "Navigation & Filtering",
        "src/components/ui/OrganSystemChipsCarousel.tsx",
        "src/components/ui/OrganSystemChipsCarousel.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--slate-700), var(--slate-900), var(--radius-full), var(--duration-base)",
        "items: OrganItem[], activeId: string, onSelect: (id) => void, showAllOption: boolean",
        "Active pill (brand blue + glow), Inactive pill (soft slate outline)",
        "Treatments, Diseases, Symptoms, Diagnostics libraries"
    ],
    [
        "Clinical Executive Summary Banner",
        "<ClinicalSummaryBanner />",
        "Clinical Editorial",
        "src/components/ui/ClinicalReviewedBySection.tsx",
        "src/components/ui/ClinicalReviewedBySection.module.css",
        "Tokenized (100%)",
        "var(--summary-bg), var(--summary-text), var(--summary-accent), var(--summary-border), var(--radius-lg)",
        "eyebrow?: string, summary: string, reviewerName?: string, reviewAnchorId?: string",
        "V1 elevated curved sheet (charcoal text), V2 scroll blend, V4 text sweep blend",
        "Procedure, Disease, Symptom, Diagnostic, and Article detail pages"
    ],
    [
        "Google E-E-A-T 'Reviewed By' Card",
        "<ClinicalReviewedBySection />",
        "Trust & Compliance",
        "src/components/ui/ClinicalReviewedBySection.tsx",
        "src/components/ui/ClinicalReviewedBySection.module.css",
        "Tokenized (100%)",
        "var(--slate-50), var(--slate-100), var(--blue-brand), var(--radius-xl), var(--shadow-sm)",
        "doctorName, doctorRole, speciality, hospital, experience, doctorImage, reviewDate, id",
        "Full credential trust card with NABL/NABH badges and bio links",
        "Procedure, Disease, Symptom, Diagnostic, and Article detail pages"
    ],
    [
        "Clinical Editorial Figures & Suites",
        "<ClinicalEditorialFigures />",
        "Media & Clinical Content",
        "src/components/ui/ClinicalReviewedBySection.tsx",
        "src/components/ui/ClinicalReviewedBySection.module.css",
        "Tokenized (100%)",
        "var(--slate-900), var(--slate-600), var(--radius-xl), var(--elevation-2), var(--font-size-xs)",
        "items: [{ src: string, alt: string, caption: string }]",
        "Single figure highlight, 2-column surgical suite comparison",
        "Procedure, Disease, Symptom, and Diagnostic detail pages"
    ],
    [
        "Nearby Specialists Carousel",
        "<NearbySpecialistsCarousel />",
        "Clinical Consultations",
        "src/components/ui/NearbyClinicalCarousels.tsx",
        "src/components/ui/NearbyClinicalCarousels.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--navy-900), var(--radius-xl), var(--radius-md), var(--elevation-1)",
        "id?: string, title: string, subtitle: string, doctors: DoctorData[], actionLabel?: string",
        "Full doctor card with portrait, hospital unit, experience, and 8px Book CTA",
        "Procedure, Disease, Symptom, Diagnostic, and Article detail pages"
    ],
    [
        "Equipped Care Centres Carousel",
        "<NearbyCareCentresCarousel />",
        "Hospitals & Infrastructure",
        "src/components/ui/NearbyClinicalCarousels.tsx",
        "src/components/ui/NearbyClinicalCarousels.module.css",
        "Tokenized (100%)",
        "var(--navy-900), var(--slate-700), var(--blue-brand), var(--radius-xl), var(--elevation-2)",
        "id?: string, title: string, subtitle: string, hospitals: HospitalData[]",
        "Multi-unit tertiary hospitals grid/carousel with ICU count and directions link",
        "Procedure, Disease, Symptom, and Diagnostic detail pages"
    ],
    [
        "Tertiary Hospital Unit Card",
        "<HospitalCard />",
        "Hospitals & Units",
        "src/components/ui/HospitalCarousel.tsx",
        "src/components/ui/HospitalCarousel.module.css",
        "Tokenized (100%)",
        "var(--slate-800), var(--slate-500), var(--radius-xl), var(--elevation-1), var(--duration-fast)",
        "hosp: HospitalData, cardIndex?: number, className?: string",
        "Standard card, Compact carousel tile",
        "Nearby hospitals carousel, Hospital directory pages"
    ],
    [
        "Clinical FAQs Accordion",
        "<SpecialityFAQ />",
        "Editorial & Q&A",
        "src/components/ui/SpecialityFAQ.tsx",
        "src/components/ui/SpecialityFAQ.module.css",
        "Tokenized (100%)",
        "var(--slate-900), var(--blue-brand), var(--slate-100), var(--radius-lg), var(--duration-base)",
        "faqs: FAQItem[], theme?: 'light' | 'dark', fluid?: boolean",
        "Dark mode (atmospheric hero) and light mode (reading sheet)",
        "Procedure, Disease, Symptom, and Diagnostic detail pages"
    ],
    [
        "More From Our Blog Cards Carousel",
        "<MoreFromOurBlogCarousel />",
        "Editorial Discovery",
        "src/components/blog/MoreFromOurBlogCarousel.tsx",
        "src/components/blog/MoreFromOurBlogCarousel.module.css",
        "Tokenized (100%)",
        "var(--white), var(--blue-brand), var(--slate-600), var(--radius-2xl), var(--elevation-3)",
        "articles: BlogArticle[], title?: string, subtitle?: string, categoryFilter?: string",
        "Top-scrim category tag, bottom dual scrim, hover zoom (1.05)",
        "Blog listing (V3), Article reading detail pages"
    ],
    [
        "Blog Page Header Hero (V3)",
        "<BlogHeroV3 />",
        "Editorial Header",
        "src/components/blog/BlogHeroV3.tsx",
        "src/components/blog/BlogHeroV3.module.css",
        "Tokenized (100%)",
        "var(--navy-900), var(--blue-brand), var(--white), var(--radius-xl), var(--font-size-display)",
        "featuredArticle: BlogArticle, trendingTopics: string[], onTopicSelect: (t) => void",
        "Immersive split-hero with full photography and live search input",
        "Blog listing page (/blog, /articles)"
    ],
    [
        "Blog Topic Filter & Article Grid",
        "<BlogCategoryExplore />",
        "Editorial Navigation",
        "src/components/blog/BlogCategoryExplore.tsx",
        "src/components/blog/BlogCategoryExplore.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--slate-800), var(--slate-100), var(--radius-full), var(--elevation-1)",
        "categories: string[], activeCategory: string, onSelect: (c) => void",
        "Interactive filter pills + responsive 3-column editorial cards grid",
        "Blog listing page (/blog, /articles)"
    ],
    [
        "Medical Advisory Board & Experts",
        "<BlogMedicalExperts />",
        "Trust & Governance",
        "src/components/blog/BlogMedicalExperts.tsx",
        "src/components/blog/BlogMedicalExperts.module.css",
        "Tokenized (100%)",
        "var(--slate-900), var(--blue-brand), var(--radius-2xl), var(--elevation-2), var(--slate-600)",
        "experts: DoctorData[], title?: string, subtitle?: string",
        "Editorial portraits with clinical credentials and department tabs",
        "Blog listing page (/blog, /articles)"
    ],
    [
        "Narayana Health Trust Bento Grid",
        "<BlogBentoGrid />",
        "Trust & Metrics",
        "src/components/blog/BlogBentoGrid.tsx",
        "src/components/blog/BlogBentoGrid.module.css",
        "Tokenized (100%)",
        "var(--slate-900), var(--blue-brand), var(--navy-800), var(--radius-2xl), var(--elevation-2)",
        "stats: BentoStatItem[], title?: string",
        "High-contrast 4-tile Bento layout showcasing surgeries, NABL labs, and JCI units",
        "Blog listing page (/blog, /articles)"
    ],
    [
        "Article Multilingual Language Changer",
        "<BlogLanguageChanger />",
        "Accessibility & i18n",
        "src/components/blog/BlogLanguageChanger.tsx",
        "src/components/blog/BlogLanguageChanger.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--slate-700), var(--slate-100), var(--radius-md), var(--elevation-1)",
        "languages: [{ code: string, label: string }], activeLang: string, onLanguageChange: (code) => void",
        "Inline language pill dropdown with native script support (English, Hindi, Kannada, etc.)",
        "Article reading detail pages (/articles/[slug])"
    ],
    [
        "Pre-Footer Universal CTA Card Banner",
        "<BlogCtaBanner />",
        "Conversion & Outreach",
        "src/components/blog/BlogCtaBanner.tsx",
        "src/components/blog/BlogCtaBanner.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), #0b1a33, #022d61, var(--white), var(--radius-2xl), var(--radius-md)",
        "bg?: 'white' | 'dark', eyebrow?: string, title?: string, subtitle?: string, primaryBtn?: {}, secondaryBtn?: {}, phoneText?: string",
        "Mandatory 135deg dark blue card with crisp 8px rounded rectangle action buttons",
        "All Health Library listings, Detail pages, Blog pages, and Landing routes"
    ],
    [
        "Clinical Floating Side Action Pill (FAB)",
        "<ClinicalFloatingSideActions />",
        "Patient Utility",
        "src/components/ui/ClinicalFloatingSideActions.tsx",
        "src/components/ui/ClinicalFloatingSideActions.module.css",
        "Tokenized (100%)",
        "var(--blue-brand), var(--slate-900), var(--white), var(--radius-full), var(--elevation-4)",
        "consultHref: string, consultLabel?: string, phoneHref?: string, phoneLabel?: string, pulseQuery?: string, isScrolled?: boolean",
        "Fixed right dock: Quick Book OPD, 24x7 Helpline call, Ask Pulse AI modal trigger",
        "All Health Library listings, Detail pages, Blog pages, and Speciality routes"
    ]
]

# ─── 2. SHEET 2: PAGES VS COMPONENTS ARCHITECTURE MATRIX ─────────────────────
pages_headers = [
    "Page Title",
    "Route URL",
    "Main Component File",
    "CSS Module File",
    "Token Status",
    "Design Layout Architecture",
    "Mounted Handover Components"
]

pages_rows = [
    [
        "Treatments & Procedures Library",
        "/treatments (and /procedures)",
        "src/app/treatments/page.tsx",
        "src/app/treatments/TreatmentsLibrary.module.css",
        "Tokenized (100%)",
        "Hero Scrim (Sweet Spot) + Organ Chips Carousel + Search + Filterable 3-Col Cards + Pinned Drawer",
        "<Breadcrumbs />, <TextSweepEffect />, <OrganSystemChipsCarousel />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Diseases & Conditions Library",
        "/diseases",
        "src/app/diseases/page.tsx",
        "src/app/diseases/DiseasesLibrary.module.css",
        "Tokenized (100%)",
        "Hero Scrim + Organ Chips Carousel + Search + Filterable 3-Col Condition Cards + Pinned Drawer",
        "<Breadcrumbs />, <TextSweepEffect />, <OrganSystemChipsCarousel />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Symptoms Clinical Triage Library",
        "/symptoms",
        "src/app/symptoms/page.tsx",
        "src/app/symptoms/SymptomsLibrary.module.css",
        "Tokenized (100%)",
        "Hero Scrim + Organ Chips Carousel + Search + Filterable 3-Col Triage Cards + Pinned Drawer",
        "<Breadcrumbs />, <TextSweepEffect />, <OrganSystemChipsCarousel />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Diagnostics & Lab Tests Library",
        "/diagnostics",
        "src/app/diagnostics/page.tsx",
        "src/app/diagnostics/DiagnosticsLibrary.module.css",
        "Tokenized (100%)",
        "Hero Scrim + Organ Chips Carousel + Search + Filterable 3-Col Test Packages + Pinned Drawer",
        "<Breadcrumbs />, <TextSweepEffect />, <OrganSystemChipsCarousel />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Procedure & Treatment Detail Page",
        "/procedures/[slug] & /treatments/[slug]",
        "src/app/procedures/[slug]/page.tsx",
        "src/app/procedures/[slug]/ProcedureDetail.module.css",
        "Tokenized (100%)",
        "Stationary Atmospheric Canvas + V1/V2/V3/V4 Blend Modes + Sticky TOC Rail + E-E-A-T Review",
        "<Breadcrumbs />, <TextSweepEffect /> (V4), <ClinicalSummaryBanner />, <ClinicalEditorialFigures />, <NearbySpecialistsCarousel />, <NearbyCareCentresCarousel />, <SpecialityFAQ />, <ClinicalReviewedBySection />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Disease & Condition Detail Page",
        "/diseases/[slug]",
        "src/app/diseases/[slug]/page.tsx",
        "src/app/diseases/[slug]/DiseaseDetail.module.css",
        "Tokenized (100%)",
        "Full Atmospheric Canvas + Clinical Summary Box + Diagnostic Stages + Specialists Carousel",
        "<Breadcrumbs />, <ClinicalSummaryBanner />, <ClinicalEditorialFigures />, <NearbySpecialistsCarousel />, <NearbyCareCentresCarousel />, <SpecialityFAQ />, <ClinicalReviewedBySection />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Symptom Clinical Detail Page",
        "/symptoms/[slug]",
        "src/app/symptoms/[slug]/page.tsx",
        "src/app/symptoms/[slug]/SymptomDetail.module.css",
        "Tokenized (100%)",
        "Full Atmospheric Canvas + Triage Red Flag Warning + Specialty Consult + Specialists Carousel",
        "<Breadcrumbs />, <ClinicalSummaryBanner />, <ClinicalEditorialFigures />, <NearbySpecialistsCarousel />, <NearbyCareCentresCarousel />, <SpecialityFAQ />, <ClinicalReviewedBySection />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Diagnostic Test Detail Page",
        "/diagnostics/[slug]",
        "src/app/diagnostics/[slug]/page.tsx",
        "src/app/diagnostics/[slug]/DiagnosticDetail.module.css",
        "Tokenized (100%)",
        "Full Atmospheric Canvas + Test Fasting Protocol + Turnaround Time + Care Centres Carousel",
        "<Breadcrumbs />, <ClinicalSummaryBanner />, <ClinicalEditorialFigures />, <NearbySpecialistsCarousel />, <NearbyCareCentresCarousel />, <SpecialityFAQ />, <ClinicalReviewedBySection />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Narayana Health Editorial Blog Listing (V3)",
        "/blog & /articles",
        "src/app/blog/page.tsx",
        "src/app/blog/page.module.css",
        "Tokenized (100%)",
        "Split Photography Hero V3 + Trending Chips + Medical Experts + Trust Bento Grid + More From Blog",
        "<Breadcrumbs />, <BlogHeroV3 />, <MoreFromOurBlogCarousel />, <BlogCategoryExplore />, <BlogMedicalExperts />, <BlogBentoGrid />, <TextSweepEffect />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ],
    [
        "Editorial Article Reading Page",
        "/articles/[slug] & /blog/[slug]",
        "src/app/blog/[slug]/page.tsx",
        "src/app/blog/[slug]/ArticleDetail.module.css",
        "Tokenized (100%)",
        "Hero Scrim + Multilingual Language Switcher + Clinical Summary + E-E-A-T Reviewer Bio + More Blogs",
        "<Breadcrumbs />, <BlogLanguageChanger />, <ClinicalSummaryBanner />, <NearbySpecialistsCarousel />, <ClinicalReviewedBySection />, <MoreFromOurBlogCarousel />, <BlogCtaBanner />, <ClinicalFloatingSideActions />"
    ]
]

# ─── 3. SHEET 3: DESIGN TOKEN SYSTEM DICTIONARY ──────────────────────────────
tokens_headers = [
    "Token Name",
    "Category",
    "CSS Value / Definition",
    "RGB Alias for Opacity",
    "Usage Rules & Permitted Application in NH Redesign"
]

tokens_rows = [
    ["--blue-brand", "Brand Color", "#034EA2", "var(--blue-brand-rgb): 3, 78, 162", "Primary brand color for buttons, active tabs, links, and key highlights."],
    ["--navy-900", "Dark Surface", "#022d61 / rgb(3, 18, 36)", "var(--navy-900-rgb): 3, 18, 36", "Used for dark atmospheric hero scrims, footer background, and deep surfaces."],
    ["--navy-800", "Dark Surface", "#223148", "22, 31, 48", "Used for secondary dark cards, hero stat dividers, and dark borders."],
    ["--red-emergency", "Emergency Accent", "#ED1C24", "var(--red-emergency-rgb): 237, 28, 36", "RESERVED strictly for genuine 24x7 emergency alerts and ambulance CTAs."],
    ["--red-500", "Semantic Accent", "#ef4444", "239, 68, 68", "Non-emergency alert badge, warning signal, or destructive interaction."],
    ["--slate-900", "Neutral Text", "#0f172a", "15, 23, 42", "Primary high-contrast heading text on white reading sheets (WCAG AAA)."],
    ["--slate-800", "Neutral Text", "#1e293b", "30, 41, 59", "Secondary body text and clinical summary text on light cards."],
    ["--slate-600", "Neutral Text", "#475569", "71, 85, 105", "Muted body text, captions, and secondary metadata."],
    ["--slate-500", "Neutral Text", "#64748b", "100, 116, 139", "Breadcrumb inactive items, unselected icons, and tertiary labels."],
    ["--slate-100", "Neutral Surface", "#f1f5f9", "241, 245, 249", "Card backgrounds, chip containers, and subtle dividers."],
    ["--slate-50", "Neutral Surface", "#f8fafc", "248, 250, 252", "Reading sheet gradient start and executive summary card background."],
    ["--white", "Neutral Surface", "#ffffff", "var(--white-rgb): 255, 255, 255", "Pure white surfaces, primary CTA button fill, and light backgrounds."],
    ["--radius-sm", "Border Radius", "4px", "N/A", "Tooltips, micro tags, and inline badges."],
    ["--radius-md", "Border Radius", "8px", "N/A", "MANDATORY geometry for CTA action buttons (Book, Call, View Details)."],
    ["--radius-lg", "Border Radius", "12px", "N/A", "Summary cards, filter chips, and dialog corners."],
    ["--radius-xl", "Border Radius", "16px", "N/A", "Hospital cards, doctor cards, and editorial figures."],
    ["--radius-2xl", "Border Radius", "24px", "N/A", "Universal Pre-footer CTA card banner and Bento grid cards."],
    ["--radius-full", "Border Radius", "9999px", "N/A", "Circular avatar containers, floating action buttons (FABs), and pill badges."],
    ["--elevation-1", "Box Shadow", "0 1px 2px rgba(...), 0 2px 6px rgba(...)", "var(--shadow-rgb): 12, 24, 57", "Resting state for doctor cards and filter chips."],
    ["--elevation-2", "Box Shadow", "0 1px 2px rgba(...), 0 4px 12px rgba(...)", "var(--shadow-rgb)", "Resting state for editorial bento cards and care centres."],
    ["--elevation-3", "Box Shadow", "0 2px 4px rgba(...), 0 8px 24px rgba(...)", "var(--shadow-rgb)", "Hover state lift for doctor and hospital cards."],
    ["--elevation-4", "Box Shadow", "0 4px 8px -2px rgba(...), 0 16px 40px -8px rgba(...)", "var(--shadow-rgb)", "Floating clinical FAB and modal dialogs."],
    ["--elevation-5", "Box Shadow", "0 8px 16px -4px rgba(...), 0 24px 64px -12px rgba(...)", "var(--shadow-rgb)", "Pinned reading sheet top elevation shadow in V1."],
    ["--duration-fast", "Transition Motion", "150ms", "N/A", "Micro hover interactions, color changes, and icon transitions."],
    ["--duration-base", "Transition Motion", "250ms", "N/A", "Card lift hover transitions, tab switching, and dropdowns."],
    ["--duration-slow", "Transition Motion", "400ms", "N/A", "Drawer expansion, hero text reveals, and accordion folds."]
]

# ─── 4. SHEET 4: TOKENIZED CSS AUDIT LOG ──────────────────────────────────────
audit_headers = [
    "CSS File Path",
    "Section / Page",
    "Token Count (var(--))",
    "Status",
    "Key Replaced Elements"
]

audit_files = [
    ("src/app/procedures/[slug]/ProcedureDetail.module.css", "Procedure Detail Page", 119, "Tokenized", "Hero scrim, metrics, TOC rail, V1-V4 blends, figures"),
    ("src/app/diseases/[slug]/DiseaseDetail.module.css", "Disease Detail Page", 406, "Tokenized", "Overview, stages, symptoms, doctor carousel, FAQs"),
    ("src/app/symptoms/[slug]/SymptomDetail.module.css", "Symptom Detail Page", 75, "Tokenized", "Triage signals, red flags, emergency callout, consult"),
    ("src/app/diagnostics/[slug]/DiagnosticDetail.module.css", "Diagnostic Detail Page", 75, "Tokenized", "Fasting preparation, test turnaround, package inclusions"),
    ("src/app/treatments/TreatmentsLibrary.module.css", "Treatments & Procedures Library", 270, "Tokenized", "Sweet spot scrim, search input, filter chips, procedure cards"),
    ("src/app/diseases/DiseasesLibrary.module.css", "Diseases Library", 306, "Tokenized", "Search bar, category tabs, condition cards, drawer"),
    ("src/app/symptoms/SymptomsLibrary.module.css", "Symptoms Library", 306, "Tokenized", "Triage filter, red flag pills, condition mapper"),
    ("src/app/diagnostics/DiagnosticsLibrary.module.css", "Diagnostics Library", 312, "Tokenized", "Pathology tests, imaging packages, NABL accreditations"),
    ("src/components/blog/BlogHeroV3.module.css", "Blog V3 Header Hero", 25, "Tokenized", "Atmospheric image, search bar, trending topic pills"),
    ("src/components/blog/BlogCtaBanner.module.css", "Pre-Footer Universal CTA Banner", 44, "Tokenized", "135deg gradient, 8px CTA buttons, radial ambient glow"),
    ("src/components/blog/MoreFromOurBlogCarousel.module.css", "Editorial Blog Carousel", 65, "Tokenized", "Top/bottom dual scrim, zoom hover, card tags"),
    ("src/components/ui/OrganSystemChipsCarousel.module.css", "Organ Filter Carousel", 36, "Tokenized", "Active pill glow, border tokens, scroll arrows"),
    ("src/components/ui/NearbyClinicalCarousels.module.css", "Specialists & Hospital Carousels", 64, "Tokenized", "Doctor portrait, 8px Book button, hospital chips"),
    ("src/components/ui/ClinicalReviewedBySection.module.css", "E-E-A-T & Clinical Summary", 65, "Tokenized", "Summary card border, verified badge, reviewer bio"),
    ("src/components/ui/ClinicalFloatingSideActions.module.css", "Floating Clinical FAB", 49, "Tokenized", "Pill shape, elevation-4 shadow, brand blue CTA"),
    ("src/app/dev-handover/DevHandover.module.css", "Developer Handover Dashboard", 73, "Tokenized", "Matrix tables, token badges, status pills, code tags"),
]

audit_rows = []
for path, section, cnt, status, notes in audit_files:
    audit_rows.append([path, section, str(cnt), status, notes])

# ─── BUILD EXCEL WORKBOOKS ───────────────────────────────────────────────────
sheets = [
    {
        "name": "Components & Tokens",
        "headers": components_headers,
        "rows": components_rows,
        "col_widths": [24, 28, 20, 36, 42, 16, 44, 40, 38, 38]
    },
    {
        "name": "Pages vs Components",
        "headers": pages_headers,
        "rows": pages_rows,
        "col_widths": [28, 24, 32, 42, 16, 46, 50]
    },
    {
        "name": "Design Tokens Dictionary",
        "headers": tokens_headers,
        "rows": tokens_rows,
        "col_widths": [22, 20, 32, 34, 48]
    },
    {
        "name": "Tokenized CSS Audit",
        "headers": audit_headers,
        "rows": audit_rows,
        "col_widths": [48, 28, 22, 16, 44]
    }
]

excel_xlsx_path = "handover/NH_Design_Tokens_and_Components_Master.xlsx"
make_clean_xlsx(excel_xlsx_path, sheets)

excel_xls_path = "handover/NH_Design_Tokens_and_Components_Master.xls"
make_excel_xml(excel_xls_path, sheets)

# ─── BUILD CSV EXPORTS ───────────────────────────────────────────────────────
def write_csv(path, headers, rows):
    with open(path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(headers)
        writer.writerows(rows)
    print(f"Generated CSV: {path}")

write_csv("handover/NH_Components_Design_Tokens.csv", components_headers, components_rows)
write_csv("handover/NH_Pages_vs_Components.csv", pages_headers, pages_rows)
write_csv("handover/NH_Design_Tokens_Dictionary.csv", tokens_headers, tokens_rows)
write_csv("handover/components-list.csv", components_headers, components_rows)
write_csv("handover/pages-vs-components.csv", pages_headers, pages_rows)

print("All handover spreadsheets generated successfully.")

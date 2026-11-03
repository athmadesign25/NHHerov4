// Desktop editorial menus keep their expanded content separate from the mobile menu.
export const EDITORIAL_MENU_LINKS = {
  "health-library": {
    featuredLabels: ["Health Articles (Blogs)", "Patient Stories", "Video Library"],
    resources: [
      { label: "Diseases and Conditions", href: "/health-library/diseases-and-conditions" },
      { label: "Treatments & Procedures", href: "/health-library/treatments-and-procedures" },
      { label: "Symptoms Guide", href: "/health-library/symptoms" },
      { label: "Health Technology", href: "/health-library/health-technology" },
      { label: "Health Calculators", href: "/health-library/health-calculators" },
      { label: "Journals", href: "/health-library/journals" },
      { label: "Case Studies", href: "/health-library/case-studies" },
    ],
  },
  "about-us": {
    featuredLabels: ["Narayana’s Story", "Leadership", "Contact Us"],
    resources: [
      { label: "Academics & Research", href: "https://www.narayanahealth.org/academics" },
      { label: "CSR & Sustainability", href: "https://www.narayanahealth.org/csr" },
      { label: "Stakeholder Relations", href: "https://www.narayanahealth.org/stakeholder-relations" },
      { label: "News & Articles", href: "https://www.narayanahealth.org/news-and-media-relations" },
      { label: "Medha Analytics", href: "https://www.medha-analytics.ai/" },
      { label: "Atma", href: "https://demo.athma.health/" },
      { label: "Careers", href: "https://www.narayanahealth.org/careers" },
    ],
  },
} as const;

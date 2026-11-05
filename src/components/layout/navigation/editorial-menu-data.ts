import {
  BookCheck, Stethoscope, Gauge, HeartHandshake, Play, BookOpen,
  FileText, NotebookPen, Cpu, ScrollText, Users, GraduationCap,
  ChartNoAxesCombined, Waypoints, BriefcaseBusiness, Newspaper, Handshake,
  type LucideIcon,
} from "lucide-react";
import GermIcon from "./GermIcon";
import healthLibraryImage from "../../../../public/book-pills-stethoscope-wooden-table-closeup.jpg";

export type EditorialMenuKind = "health-library" | "about-us";

export interface EditorialLink {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  visual?: { src: string; kind: "photo" | "logo" };
}

export interface EditorialGroup {
  id: string;
  label: string;
  links: EditorialLink[];
}

// Existing destinations are retained; grouping changes presentation only.
export const EDITORIAL_MENU_GROUPS: Record<EditorialMenuKind, EditorialGroup[]> = {
  "health-library": [
    {
      id: "understand-health", label: "Understand your health",
      links: [
        { label: "Symptoms Guide", href: "/health-library/symptoms", description: "Check what your symptoms could mean", icon: BookCheck },
        { label: "Diseases & Conditions", href: "/health-library/diseases-and-conditions", description: "Causes, signs and treatment options", icon: GermIcon },
        { label: "Treatments & Procedures", href: "/health-library/treatments-and-procedures", description: "What to expect before and after", icon: Stethoscope },
        { label: "Health Calculators", href: "/health-library/health-calculators", description: "BMI, risk scores and more", icon: Gauge },
      ],
    },
    {
      id: "stories-learning", label: "Stories & learning",
      links: [
        { label: "Patient Stories", href: "/#patient-stories", description: "Real journeys from our patients", icon: HeartHandshake },
        { label: "Video Library", href: "/health-library/videos", description: "Explainers from our specialists", icon: Play },
        { label: "Health Articles", href: "/health-library", description: "Tips and guides for everyday health", icon: BookOpen },
      ],
    },
    {
      id: "professionals", label: "For professionals",
      links: [
        { label: "Journals", href: "/health-library/journals", description: "Published clinical research", icon: FileText },
        { label: "Case Studies", href: "/health-library/case-studies", description: "Complex cases from our teams", icon: NotebookPen },
        { label: "Health Technology", href: "/health-library/health-technology", description: "Innovation across our network", icon: Cpu },
      ],
    },
  ],
  "about-us": [
    {
      id: "who-we-are", label: "Who we are",
      links: [
        { label: "Narayana Health Story", href: "/about-us", description: "How we started and where we're going", icon: ScrollText },
        { label: "Leadership", href: "/about-us/leadership", description: "The people behind Narayana Health", icon: Users },
        { label: "CSR & Sustainability", href: "https://www.narayanahealth.org/csr", description: "Our commitment to communities", icon: HeartHandshake },
      ],
    },
    {
      id: "ecosystem", label: "Our ecosystem",
      links: [
        { label: "Academics & Research", href: "https://www.narayanahealth.org/academics", description: "Training and research programmes", icon: GraduationCap, visual: { src: "/navigation/ecosystem/academics.webp", kind: "photo" } },
        { label: "Medha Analytics", href: "https://www.medha-analytics.ai/", description: "Data and analytics in healthcare", icon: ChartNoAxesCombined, visual: { src: "/navigation/ecosystem/medha-logo.webp", kind: "logo" } },
        { label: "Athma", href: "https://demo.athma.health/", description: "Connected systems for healthcare", icon: Waypoints, visual: { src: "/navigation/ecosystem/athma-logo.webp", kind: "logo" } },
      ],
    },
    {
      id: "work-with-us", label: "Work with us",
      links: [
        { label: "Careers", href: "https://www.narayanahealth.org/careers", description: "Join our teams", icon: BriefcaseBusiness },
        { label: "News & Articles", href: "https://www.narayanahealth.org/news-and-media-relations", description: "Press releases and media", icon: Newspaper },
        { label: "Stakeholder Relations", href: "https://www.narayanahealth.org/stakeholder-relations", description: "Reports and disclosures", icon: Handshake },
      ],
    },
  ],
};

export const EDITORIAL_FEATURES = {
  "health-library": {
    image: healthLibraryImage, alt: "An open medical book, stethoscope and pills on a wooden table",
    title: "Not sure what's wrong?", description: "Start with our Symptoms Guide.",
    cta: "Explore Symptoms Guide", href: "/health-library/symptoms",
    // TODO: replace this permitted fallback with the Pulse entry point once it
    // opens the workspace directly; openPulseAI currently only updates the hero.
  },
  "about-us": {
    image: "/Dr.Devi Shetty.png", alt: "Dr. Devi Shetty, founder of Narayana Health",
    title: "Our Story", description: "",
    cta: "Read our story", href: "/about-us",
  },
} as const;

// Same contact number and destinations as the existing desktop/mobile nav.
export const EDITORIAL_CONTACT = {
  href: "/contact-us", phoneHref: "tel:18003090309", phoneLabel: "1800 309 0309",
  emergencyHref: "/emergency",
} as const;

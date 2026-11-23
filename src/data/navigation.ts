import { buildSearchUrl } from "@/features/search/searchTabs";

export const footerLinks = {
  "Patient Care": [
    { label: "Book Appointment", href: buildSearchUrl() },
    { label: "Find a Doctor", href: buildSearchUrl() },
    { label: "Our Specialities", href: "/specialities" },
    { label: "Our Hospitals", href: "/hospitals" },
    { label: "Health Packages", href: "/health-checkups" },
    { label: "International Patients", href: "/" },
  ],
  "About": [
    { label: "About Narayana Health", href: "/" },
    { label: "Leadership", href: "/" },
    { label: "Awards & Recognition", href: "/" },
    { label: "Press & Media", href: "/" },
    { label: "CSR Initiatives", href: "/csr" },
    { label: "Careers", href: "/" },
  ],
  "Resources": [
    { label: "Health Blog & Articles", href: "/articles" },
    { label: "Treatments & Procedures", href: "/treatments" },
    { label: "Symptoms Guide", href: "/symptoms" },
    { label: "Diseases & Conditions", href: "/diseases" },
    { label: "Diagnostics & Lab Tests", href: "/diagnostics" },
    { label: "Telemedicine", href: "/" },
    { label: "NH App", href: "/" },
    { label: "Quality & Accreditations", href: "/" },
    { label: "Feedback", href: "/" },
  ],
};

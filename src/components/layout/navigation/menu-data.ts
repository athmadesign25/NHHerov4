export const DESKTOP_NAV_ITEMS = [
  { id: "find-a-doctor", label: "Find a Doctor", href: "/search" },
  { id: "hospitals", label: "Find Hospital", href: "/hospitals" },
  { id: "specialities", label: "Services", href: "/specialities" },
  { id: "health-library", label: "Health Library", href: "/health-library" },
  { id: "about-us", label: "About Us", href: "/about-us" },
] as const;

export const OTHER_MENU_GROUPS = {
  "health-library": [{ label: "Health Library", links: [
    { label: "Treatments & Procedures", href: "/treatments" },
    { label: "Symptoms Guide", href: "/symptoms" },
    { label: "Diseases & Conditions", href: "/diseases" },
    { label: "Diagnostics & Lab Tests", href: "/diagnostics" },
    { label: "Health Articles & Blog", href: "/articles" },
    { label: "Patient Stories", href: "/#patient-stories" },
    { label: "Health Videos", href: "/health-library/videos" },
  ] }],
  "about-us": [{ label: "About Us", links: [
    { label: "About Narayana Health", href: "/about-us" },
    { label: "Our Leadership", href: "/about-us/leadership" },
    { label: "Contact Us", href: "/contact-us" },
  ] }],
};

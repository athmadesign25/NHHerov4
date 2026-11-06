import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { OTHER_MENU_GROUPS } from "./menu-data";
import { EDITORIAL_MENU_LINKS } from "./editorial-menu-data";
import surfaces from "./DesktopMenuSurfaces.module.css";
import styles from "./EditorialMegaMenu.module.css";

const visualContent = {
  "health-library": {
    title: "Health Library",
    description: "Information and stories to support your health journey.",
    image: "/doctor_patient.png",
    alt: "A doctor listening to a patient",
    images: ["/images/articles/blog_heart_health.png", "/assets/patient_story_1.png", "/bento-top-medical-experts.jpg"],
  },
  "about-us": {
    title: "About Narayana Health",
    description: "Meet the people and purpose behind our care.",
    image: "/navigation/hospitals/cardiac-sciences-banner.webp",
    alt: "Narayana Health hospital campus",
    images: ["/assets/doctor_team.png", "/chairman-portrait.png", "/doctor_patient.png"],
  },
} as const;

export default function EditorialMegaMenu({ kind, onNavigate }: { kind: keyof typeof visualContent; onNavigate: () => void }) {
  const content = visualContent[kind];
  const links = OTHER_MENU_GROUPS[kind][0].links;
  const menuLinks = EDITORIAL_MENU_LINKS[kind];
  return (
    <div className={styles.menu}>
      <section className={styles.feature} aria-labelledby={`nav-${kind}-title`}>
        <Image src={content.image} alt={content.alt} fill sizes={kind === "about-us" ? "1400px" : "640px"} className={styles.featureImage} />
        <div className={styles.featureWash} aria-hidden="true" />
        <div className={styles.featureText}>
          <h2 id={`nav-${kind}-title`}>{content.title}</h2>
          <p>{content.description}</p>
        </div>
      </section>
      <div className={styles.content}>
        <div className={styles.tiles} aria-label={`Featured ${content.title} links`}>
          {links.map((link, index) => <Link key={link.href} href={link.href} onClick={onNavigate} className={styles.tile}>
            <Image src={content.images[index]} alt="" fill sizes="(min-width: 1600px) 20vw, 16vw" className={styles.tileImage} />
            <span className={surfaces.radialWash} aria-hidden="true" />
            <div className={styles.tileText}><h3>{menuLinks.featuredLabels[index]}</h3></div>
            <span className={surfaces.arrow} aria-hidden="true"><ArrowUpRight /></span>
          </Link>)}
        </div>
        <ul className={styles.resources} aria-label={`More ${content.title} links`}>
          {menuLinks.resources.map(link => <li key={link.href}>
            <Link href={link.href} onClick={onNavigate} className={styles.resourceLink}>
              <span>{link.label}</span><ArrowUpRight aria-hidden="true" />
            </Link>
          </li>)}
        </ul>
      </div>
    </div>
  );
}

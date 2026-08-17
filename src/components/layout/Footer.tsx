import Link from "next/link";
import Image from "next/image";
import { Phone, Mail, MapPin, Share2, MessageSquare, Link2, Play, Camera } from "lucide-react";
import styles from "./Footer.module.css";

const footerLinks = {
  "Patient Care": [
    { label: "Book Appointment", href: "/doctors" },
    { label: "Find a Doctor", href: "/doctors" },
    { label: "Our Specialities", href: "/specialities/cardiology" },
    { label: "Our Hospitals", href: "/" },
    { label: "Health Packages", href: "/" },
    { label: "International Patients", href: "/" },
  ],
  "About": [
    { label: "About Narayana Health", href: "/" },
    { label: "Leadership", href: "/" },
    { label: "Awards & Recognition", href: "/" },
    { label: "Press & Media", href: "/" },
    { label: "CSR Initiatives", href: "/" },
    { label: "Careers", href: "/" },
  ],
  "Resources": [
    { label: "Health Blog", href: "/" },
    { label: "Patient Education", href: "/" },
    { label: "Telemedicine", href: "/" },
    { label: "NH App", href: "/" },
    { label: "Quality & Accreditations", href: "/" },
    { label: "Feedback", href: "/" },
  ],
};

export default function Footer() {
  return (
    <footer className={styles.footer}>
      {/* Emergency Strip */}
      <div className={styles.emergencyStrip}>
        <div className="container">
          <div className={styles.emergencyInner}>
            <div className={styles.emergencyLeft}>
              <div className={styles.emergencyDot} />
              <span className={styles.emergencyLabel}>24/7 Emergency Care Available</span>
            </div>
            <a href="tel:18003090309" className={styles.emergencyNumber} id="footer-emergency">
              <Phone size={16} />
              1800-309-0309
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className={styles.main}>
        <div className="container">
          <div className={styles.grid}>
            {/* Brand Column */}
            <div className={styles.brandCol}>
              <div className={styles.brand}>
                <div className={styles.brandLogo}>
                  <Image 
                    src="/logos/NH Logo_white.svg" 
                    alt="Narayana Health" 
                    width={180} 
                    height={60} 
                    style={{ objectFit: "contain" }}
                  />
                </div>
                <p className={styles.brandDesc}>
                  Delivering affordable, world-class healthcare to every corner of India and beyond. 
                  Trusted by 2.5M+ patients across 30+ specialities.
                </p>
                <div className={styles.contact}>
                  <a href="tel:18003090309" className={styles.contactItem} id="footer-phone">
                    <Phone size={14} />
                    1800-309-0309
                  </a>
                  <a href="mailto:info@narayanahealth.org" className={styles.contactItem} id="footer-email">
                    <Mail size={14} />
                    info@narayanahealth.org
                  </a>
                  <div className={styles.contactItem}>
                    <MapPin size={14} />
                    Bengaluru, India
                  </div>
                </div>
                <div style={{ marginTop: "1rem", display: "flex", gap: "10px" }}>
                  <a href="https://facebook.com/narayanahealth" target="_blank" rel="noopener noreferrer" aria-label="Facebook" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.8)", transition: "0.2s", backgroundColor: "transparent" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  </a>
                  <a href="https://instagram.com/narayanahealth" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.8)", transition: "all 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37zM17.5 6.5h.01M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9A5.5 5.5 0 0 1 16.5 22h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2z"></path>
                    </svg>
                  </a>
                  <a href="https://linkedin.com/company/narayana-health" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.8)", transition: "all 0.2s" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z M4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"></path>
                    </svg>
                  </a>
                  <a href="https://youtube.com/narayanahealth" target="_blank" rel="noopener noreferrer" aria-label="YouTube" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.8)", transition: "all 0.2s", backgroundColor: "transparent" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"></path>
                    </svg>
                  </a>
                  <a href="https://twitter.com/narayanahealth" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X" style={{ width: 36, height: 36, borderRadius: "50%", border: "1px solid rgba(255, 255, 255, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255, 255, 255, 0.8)", transition: "0.2s", backgroundColor: "transparent" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Links Columns */}
            {Object.entries(footerLinks).map(([heading, links]) => (
              <div key={heading} className={styles.linkCol}>
                <h4 className={styles.colHeading}>{heading}</h4>
                <ul className={styles.linkList}>
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className={styles.link} id={`footer-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottom}>
        <div className="container">
          <div className={styles.bottomInner}>
            <p className={styles.copyright}>
              © {new Date().getFullYear()} Narayana Health. All rights reserved.
            </p>
            <div className={styles.bottomLinks}>
              {["Privacy Policy", "Terms of Use", "Cookie Policy", "Sitemap"].map((item) => (
                <Link key={item} href="/" className={styles.bottomLink} id={`footer-${item.toLowerCase().replace(/\s+/g, "-")}`}>
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import styles from "./SeoLinksBand.module.css";
import { SEO_LINK_SECTIONS } from "@/data/seo-links";

const FIRST_SECTION = SEO_LINK_SECTIONS[0]?.id ?? null;

export default function SeoLinksBand() {
  const [open, setOpen] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const uid = useId();
  const bandRef = useRef<HTMLElement>(null);

  const panelId = `${uid}-seo-panel`;
  const ease = [0.22, 1, 0.36, 1] as const;
  const duration = reduceMotion ? 0 : 0.36;

  const toggleBand = () => {
    const next = !open;
    setOpen(next);
    // Opening reveals a tall panel below the fold, so bring the band itself to
    // the top of the viewport — otherwise the content the click just revealed
    // is entirely off-screen. Deferred one frame so the scroll target is
    // measured after the panel has begun expanding.
    if (next) {
      setOpenSection(FIRST_SECTION);
      requestAnimationFrame(() => {
        bandRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
      });
    }
  };

  return (
    <section ref={bandRef} className={styles.band} aria-label="More links">
      <div className="container">
        <h2 className={styles.srOnly}>More links</h2>

        <button
          type="button"
          className={styles.masterToggle}
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggleBand}
        >
          <span className={styles.masterLabel}>
            {open ? "Show Less Links" : "Show More Links"}
          </span>
          <ChevronDown
            size={16}
            className={styles.masterChevron}
            data-open={open || undefined}
            aria-hidden="true"
          />
        </button>

        {/* Height-collapsed rather than unmounted: every link stays in the DOM
            so the band is still crawlable while closed, which is the whole
            reason it exists. */}
        <motion.div
          id={panelId}
          className={styles.panel}
          initial={false}
          animate={{ height: open ? "auto" : 0 }}
          transition={{ duration, ease }}
          aria-hidden={!open}
        >
          <div className={styles.groups}>
            {SEO_LINK_SECTIONS.map((section) => {
              const isOpen = openSection === section.id;
              const sectionPanelId = `${uid}-${section.id}`;
              return (
                <div key={section.id} className={styles.group}>
                  <button
                    type="button"
                    className={styles.groupToggle}
                    aria-expanded={isOpen}
                    aria-controls={sectionPanelId}
                    tabIndex={open ? 0 : -1}
                    onClick={() => setOpenSection(isOpen ? null : section.id)}
                  >
                    <span className={styles.groupTitle}>{section.title}</span>
                    <ChevronDown
                      size={16}
                      className={styles.groupChevron}
                      data-open={isOpen || undefined}
                      aria-hidden="true"
                    />
                  </button>

                  <motion.div
                    id={sectionPanelId}
                    className={styles.groupPanel}
                    initial={false}
                    animate={{ height: isOpen ? "auto" : 0 }}
                    transition={{ duration, ease }}
                  >
                    <ul className={styles.linkGrid}>
                      {section.links.map((link) => {
                        const external = link.href.startsWith("http");
                        const tab = open && isOpen ? 0 : -1;
                        return (
                          <li key={`${section.id}-${link.href}-${link.label}`}>
                            {external ? (
                              <a
                                href={link.href}
                                className={styles.link}
                                tabIndex={tab}
                                rel="noopener noreferrer"
                              >
                                {link.label}
                              </a>
                            ) : (
                              <Link
                                href={link.href}
                                className={styles.link}
                                tabIndex={tab}
                              >
                                {link.label}
                              </Link>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

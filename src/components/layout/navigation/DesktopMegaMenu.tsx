"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "framer-motion";
import { duration, ease } from "@/lib/motion";
import DoctorMegaMenu from "./DoctorMegaMenu";
import ServicesMegaMenu from "./ServicesMegaMenu";
import HospitalMegaMenu from "./HospitalMegaMenu";
import { OTHER_MENU_GROUPS } from "./menu-data";
import styles from "./DesktopMegaMenu.module.css";

function MenuBody({ children }: { children: ReactNode }) {
  const present = useIsPresent();
  return <div className={styles.body} data-desktop-menu-content={present ? "active" : undefined} inert={!present} aria-hidden={!present || undefined}>{children}</div>;
}

export default function DesktopMegaMenu({ activeMenu, direction, onNavigate }: { activeMenu: string; direction: number; onNavigate: () => void }) {
  const reduced = useReducedMotion();
  const otherGroups = activeMenu === "health-library" ? OTHER_MENU_GROUPS["health-library"] : OTHER_MENU_GROUPS["about-us"];
  const content = activeMenu === "find-a-doctor" ? <DoctorMegaMenu onNavigate={onNavigate} />
    : activeMenu === "hospitals" ? <HospitalMegaMenu onNavigate={onNavigate} />
    : activeMenu === "specialities" ? <ServicesMegaMenu onNavigate={onNavigate} />
    : <div className={styles.linkGroups}>{otherGroups.map((group) => <section key={group.label}>
      <h2>{group.label}</h2>
      <ul>{group.links.map((link) => <li key={link.href}><Link href={link.href} onClick={onNavigate}>{link.label}</Link></li>)}</ul>
    </section>)}</div>;

  return (
    <div className={styles.shell} id="desktop-navigation-panel" data-desktop-menu={activeMenu}>
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div key={activeMenu} className={styles.slide} custom={direction}
          variants={{
            enter: (travel: number) => ({ x: reduced ? 0 : travel * 32, opacity: reduced ? 1 : 0 }),
            centre: { x: 0, opacity: 1 },
            leave: (travel: number) => ({ x: reduced ? 0 : travel * -32, opacity: 0 }),
          }} initial="enter" animate="centre" exit="leave"
          transition={{ duration: reduced ? 0 : duration.emphasis, ease: ease.out }}>
          <MenuBody>{content}</MenuBody>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

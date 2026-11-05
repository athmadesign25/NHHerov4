import type { ReactNode } from "react";
import Link from "next/link";
import styles from "./MenuAction.module.css";

type MenuActionProps = {
  label?: string;
  context: string;
  icon?: ReactNode;
} & ({ href: string; onClick: () => void } | { href?: never; onClick: () => void });

export default function MenuAction({ label = "View all", context, icon, href, onClick }: MenuActionProps) {
  const content = <>{icon}<span className={styles.label}>{label}</span></>;
  return href
    ? <Link href={href} onClick={onClick} aria-label={context} className={styles.action}>{content}</Link>
    : <button type="button" onClick={onClick} aria-label={context} className={styles.action}>{content}</button>;
}

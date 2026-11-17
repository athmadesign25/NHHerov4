"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { personInitials } from "../personInitials";
import styles from "./MemberAvatar.module.css";

export default function MemberAvatar({ src, name, size = 32, className }: { src?: string; name?: string; size?: number; className: string }) {
  const [failed, setFailed] = useState<string>();
  const initials = personInitials(name);
  return src && failed !== src
    ? <Image src={src} alt="" width={size} height={size} sizes={`${size}px`} unoptimized={src.startsWith("https://i.pravatar.cc/")} className={className} onError={() => setFailed(src)} />
    : <span className={`${className} ${styles.monogram}`} data-size={size} aria-hidden="true">{initials || <User size={16} aria-hidden />}</span>;
}

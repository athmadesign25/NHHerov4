"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";

export default function MemberAvatar({ src, className }: { src?: string; className: string }) {
  const [failed, setFailed] = useState<string>();
  return src && failed !== src
    ? <Image src={src} alt="" width={32} height={32} sizes="32px" unoptimized className={className} onError={() => setFailed(src)} />
    : <span className={className}><User size={16} aria-hidden /></span>;
}

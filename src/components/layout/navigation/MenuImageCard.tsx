import type { ReactNode } from "react";
import Image, { type ImageProps } from "next/image";
import styles from "./MenuImageCard.module.css";

export default function MenuImageCard({ title, image, alt, imageSizes = "(min-width: 1100px) 384px, 90vw", imageLoading = "lazy", description, portrait = false, alignRight = false, className = "", visualClassName = "", children, captionPosition = "bottom", headingAction }: {
  title?: string;
  image: ImageProps["src"];
  alt: string;
  imageSizes?: string;
  imageLoading?: ImageProps["loading"];
  description?: string;
  portrait?: boolean;
  alignRight?: boolean;
  className?: string;
  visualClassName?: string;
  children?: ReactNode;
  captionPosition?: "top" | "bottom";
  headingAction?: ReactNode;
}) {
  return (
    <aside className={`${styles.card} ${portrait ? styles.portrait : ""} ${alignRight ? styles.alignRight : ""} ${description ? styles.withDescription : ""} ${headingAction ? styles.withHeadingAction : ""} ${children && captionPosition === "bottom" ? styles.withCaption : ""} ${className}`} aria-label={title || alt} data-menu-image-card>
      <div className={`${styles.visual} ${visualClassName}`}>
        <Image src={image} alt={alt} fill sizes={imageSizes} loading={imageLoading} />
      </div>
      {(title || children) && <div className={styles.wash} aria-hidden="true" />}
      {title && <header className={styles.heading}>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
        {headingAction}
      </header>}
      {children && <div className={`${styles.caption} ${captionPosition === "top" ? styles.captionTop : ""}`}>{children}</div>}
    </aside>
  );
}

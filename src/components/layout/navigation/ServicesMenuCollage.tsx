import Image from "next/image";
import card from "./MenuImageCard.module.css";
import styles from "./ServicesMenuCollage.module.css";

const photos = [
  { src: "/health-checkup-consultation.jpg", alt: "Preventive health checkups and specialist care" },
  { src: "/images/procedures/procedure_mri.png", alt: "MRI diagnostics and imaging" },
  { src: "/bento-advanced-technology.jpg", alt: "Advanced medical technology" },
];

/** Reuses the shared image-card frame so every menu keeps the same dimensions. */
export default function ServicesMenuCollage() {
  return (
    <aside className={`${card.card} ${styles.collage}`} aria-label="Health checkups, diagnostics and advanced care" data-menu-image-card data-services-collage>
      <div className={styles.grid}>
        {photos.map((photo, index) => <div key={photo.src} className={styles.cell}>
          <Image src={photo.src} alt={photo.alt} fill sizes={index === 0 ? "(min-width: 1100px) 384px, 90vw" : "(min-width: 1100px) 192px, 45vw"} />
        </div>)}
      </div>
      <div className={card.wash} aria-hidden="true" />
      <header className={card.heading}><h2>Services</h2></header>
    </aside>
  );
}

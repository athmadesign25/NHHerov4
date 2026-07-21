"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import React from "react";
import styles from "./PatientStories.module.css";

const stories = [
  {
    id: "story-1",
    name: "Priya & Ramesh Kumar",
    location: "Bengaluru, India",
    condition: "Cardiac Surgery",
    quote: "The team at Narayana Health gave my husband a second chance at life. The care was exceptional — from diagnosis to recovery, every step was handled with the utmost precision and compassion.",
    image: "/assets/patient_1.png",
    rating: 5,
  },
  {
    id: "story-2",
    name: "Mohammed Al-Farsi",
    location: "Dubai, UAE",
    condition: "Bone Marrow Transplant",
    quote: "I traveled from Dubai after hearing about Narayana's world-class oncology team. The outcomes exceeded our expectations, and the international patient services made everything seamless.",
    image: "/assets/doctor_1.png",
    rating: 5,
  },
  {
    id: "story-3",
    name: "Sarah Thompson",
    location: "London, UK",
    condition: "Spinal Surgery",
    quote: "After 3 failed surgeries in the UK, Dr. Rao at NH Bangalore performed a minimally invasive procedure that completely restored my mobility. I'm walking pain-free for the first time in 4 years.",
    image: "/assets/doctor_2.png",
    rating: 5,
  },
  {
    id: "story-4",
    name: "Anita Desai",
    location: "Mumbai, India",
    condition: "Liver Transplant",
    quote: "The dedication of the transplant team was remarkable. They guided our entire family through the process with empathy and expertise. We can never thank Narayana Health enough.",
    image: "/assets/doctor_3.png",
    rating: 5,
  },
];

export default function PatientStories() {
  const videos = [
    { videoId: "ZSEB_JWPLXE", thumb: "/assets/patient_in_1.png", title: "Cardiac Recovery Journey with NH Team" },
    { videoId: "zj57LyreDYU", thumb: "/assets/patient_in_2.png", title: "Cancer Care Experience from Diagnosis to Healing" },
    { videoId: "k09KKJSy8e8", thumb: "/assets/patient_in_3.png", title: "Spine Surgery Success and Mobility Restoration" },
    { videoId: "UBNybY1lc6k", thumb: "/assets/patient_in_4.png", title: "Transplant Care Testimonial and Family Support" }
  ];

  const items = Array.from({ length: stories.length * 2 }, (_, i) => {
    if (i % 2 === 0) {
      return { type: "text" as const, data: stories[(i / 2) % stories.length] };
    } else {
      const vidObj = videos[Math.floor(i / 2) % videos.length];
      return { type: "video" as const, data: vidObj };
    }
  });

  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handlePrev = () => setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setActiveIndex((prev) => (prev + 1) % items.length);

  const getCardTransform = (index: number) => {
    let diff = index - activeIndex;
    if (diff < -items.length / 2) diff += items.length;
    if (diff > items.length / 2) diff -= items.length;

    if (isMobile) {
      return {
        x: diff * 96,
        opacity: diff === 0 ? 1 : 0,
        scale: diff === 0 ? 1 : 0.96,
        zIndex: diff === 0 ? 10 : 1,
      };
    }

    if (diff === 0) {
      return { x: 0, opacity: 1, scale: 1, zIndex: 10 };
    }
    if (diff === -1) {
      return { x: -456, opacity: 0.86, scale: 0.96, zIndex: 6 };
    }
    if (diff === 1) {
      return { x: 456, opacity: 0.86, scale: 0.96, zIndex: 6 };
    }
    return { x: diff < 0 ? -860 : 860, opacity: 0, scale: 0.94, zIndex: 1 };
  };

  const handleDragEnd = (_event: unknown, info: { offset: { x: number } }) => {
    const threshold = 50;
    if (info.offset.x < -threshold) handleNext();
    if (info.offset.x > threshold) handlePrev();
  };

  return (
    <section className={`section ${styles.section}`} id="patient-stories">
      <div className="container">
        {/* Section Header */}
        <div className={styles.header}>
          <div className="section-eyebrow">Patient Stories</div>
          <h2 className="section-title">Lives Changed, Stories Told</h2>
          <p className="section-subtitle">
            Real patients. Real outcomes. Thousands of life-changing stories.
          </p>
        </div>
      </div>

      <div className={styles.carouselWrap}>
        <motion.div
          className={styles.carouselViewport}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ cursor: "grab" }}
          whileTap={{ cursor: "grabbing" }}
        >
          {items.map((item, i) => {
            const transform = getCardTransform(i);
            if (item.type === "text") {
              const story = item.data;
              return (
                <motion.article
                  key={`story-${story.id}-${i}`}
                  className={styles.card}
                  animate={transform}
                  transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveIndex(i)}
                >
                  <p className={styles.quote}>"{story.quote}"</p>
                  <div className={styles.patient}>
                    <div className={styles.avatar}>
                      <Image src={story.image} alt={story.name} fill sizes="48px" style={{ objectFit: "cover" }} />
                    </div>
                    <div>
                      <h4 className={styles.patientName}>{story.name}</h4>
                      <p className={styles.patientMeta}>{story.condition}</p>
                    </div>
                  </div>
                </motion.article>
              );
            }

            const video = item.data;
            return (
              <motion.article
                key={`video-${video.videoId}-${i}`}
                className={`${styles.card} ${styles.videoCard}`}
                animate={transform}
                transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setActiveIndex(i)}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.videoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.videoLink}
                >
                  <div className={styles.videoThumbWrap}>
                    <Image src={video.thumb} alt={video.title} fill sizes="(max-width: 768px) 90vw, 420px" className={styles.videoThumb} />
                    <div className={styles.videoOverlay} />
                    <div className={styles.videoBadge}>
                      <Play size={14} />
                      <span>YouTube</span>
                    </div>
                    <div className={styles.playButtonWrapper}>
                      <Play size={28} fill="var(--color-primary)" stroke="var(--color-primary)" />
                    </div>
                    <div className={styles.videoTitle}>{video.title}</div>
                  </div>
                </a>
              </motion.article>
            );
          })}
        </motion.div>

        <div className={styles.carouselArrows}>
          <button type="button" className={styles.navBtn} onClick={handlePrev} aria-label="Previous story">
            <ChevronLeft size={18} />
          </button>
          <button type="button" className={styles.navBtn} onClick={handleNext} aria-label="Next story">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, Quote } from "lucide-react";
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
    image: "/assets/patient_in_2.png",
    rating: 5,
  },
  {
    id: "story-3",
    name: "Sarah Thompson",
    location: "London, UK",
    condition: "Spinal Surgery",
    quote: "After 3 failed surgeries in the UK, Dr. Rao at NH Bangalore performed a minimally invasive procedure that completely restored my mobility. I'm walking pain-free for the first time in 4 years.",
    image: "/assets/patient_in_3.png",
    rating: 5,
  },
  {
    id: "story-4",
    name: "Anita Desai",
    location: "Mumbai, India",
    condition: "Liver Transplant",
    quote: "The dedication of the transplant team was remarkable. They guided our entire family through the process with empathy and expertise. We can never thank Narayana Health enough.",
    image: "/assets/patient_in_4.png",
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

  const allItems = [...items, ...items]; // Duplicate for seamless scrolling

  const backgroundGridItems = [
    ...stories.map(s => s.image), // Top row
    null, null, null, null,       // Middle row (empty)
    ...videos.map(v => v.thumb)   // Bottom row
  ];

  return (
    <section className={`section ${styles.section}`} id="patient-stories">
      <div className={`container ${styles.contentContainer}`}>
        {/* Section Header */}
        <motion.div 
          className={styles.header}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.eyebrowWrap}>
            <div className="section-eyebrow" style={{ marginBottom: 0 }}>PATIENT STORIES</div>
            <div className={styles.eyebrowDash} />
          </div>
          <h2 className={`section-title ${styles.sectionTitle}`}>Lives Changed, Stories Told</h2>
          <p className="section-subtitle">
            Real patients. Real outcomes. Thousands of life-changing stories.
          </p>
        </motion.div>
      </div>

      <div className={styles.carouselWrap}>
        {/* Background Image Grid */}
        <div className={styles.backgroundGridWrap}>
          <div className={styles.backgroundGrid}>
            {backgroundGridItems.map((src, i) => (
              src ? (
                <motion.div 
                  key={`bg-${i}`} 
                  className={styles.gridImageItem}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                >
                  <Image src={src} alt="" fill sizes="25vw" style={{ objectFit: "cover" }} />
                </motion.div>
              ) : (
                <div key={`bg-empty-${i}`} />
              )
            ))}
          </div>
          <div className={styles.gridOverlay} />
        </div>

        <motion.div 
          className={styles.marqueeContainer}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className={styles.marqueeContent}>
            {allItems.map((item, i) => {
              if (item.type === "text") {
                const story = item.data;
                return (
                  <article key={`story-${story.id}-${i}`} className={styles.card}>
                    <div className={styles.quoteIconWrap}>
                      <Quote size={40} className={styles.quoteIcon} fill="var(--color-primary)" stroke="none" />
                    </div>
                    <p className={styles.quote}>{story.quote}</p>
                    <div className={styles.patient}>
                      <div className={styles.avatar}>
                        <Image src={story.image} alt={story.name} fill sizes="48px" style={{ objectFit: "cover" }} />
                      </div>
                      <div>
                        <h4 className={styles.patientName}>{story.name}</h4>
                        <p className={styles.patientMeta}>{story.condition}</p>
                      </div>
                    </div>
                  </article>
                );
              }

              const video = item.data;
              return (
                <article key={`video-${video.videoId}-${i}`} className={`${styles.card} ${styles.videoCard}`}>
                  <a
                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.videoLink}
                  >
                    <div className={styles.videoThumbWrap}>
                      <Image src={video.thumb} alt={video.title} fill sizes="(max-width: 768px) 90vw, 420px" className={styles.videoThumb} />
                      <div className={styles.videoOverlay} />
                      <div className={styles.playButtonWrapper}>
                        <Play size={28} fill="var(--color-primary)" stroke="var(--color-primary)" />
                      </div>
                      <div className={styles.videoTitle}>{video.title}</div>
                    </div>
                  </a>
                </article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

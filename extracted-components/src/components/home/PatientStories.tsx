"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Play } from "lucide-react";
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
    { videoId: "ZSEB_JWPLXE", thumb: "/assets/patient_story_1.png" },
    { videoId: "zj57LyreDYU", thumb: "/assets/patient_story_2.png" },
    { videoId: "k09KKJSy8e8", thumb: "/assets/patient_story_3.png" },
    { videoId: "UBNybY1lc6k", thumb: "/assets/patient_story_4.png" }
  ];

  // Alternating items: text, video, text, video... (length 16 to support seamless marquee scrolling)
  const row1Items = Array.from({ length: 16 }, (_, i) => {
    if (i % 2 === 0) {
      return { type: "text", data: stories[(i / 2) % stories.length] };
    } else {
      const vidObj = videos[Math.floor(i / 2) % videos.length];
      return { type: "video", videoId: vidObj.videoId, thumb: vidObj.thumb };
    }
  });

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

      <div className={styles.carouselWrap} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* First row: Scrolling Left */}
        <ul className={styles.marqueeTrack}>
          {row1Items.map((item, i) => {
            if (item.type === "text" && item.data) {
              const story = item.data;
              return (
                <li
                  key={`row1-text-${story.id}-${i}`}
                  className={styles.card}
                  id={`row1-text-${story.id}-${i}`}
                >
                  <div className={styles.topSection}>
                    <p className={styles.quote}>"{story.quote}"</p>
                  </div>
                  <div className={styles.patient}>
                    <div className={styles.avatar}>
                      <Image 
                        src={story.image} 
                        alt={story.name} 
                        fill 
                        sizes="48px" 
                        style={{ objectFit: "cover" }} 
                      />
                    </div>
                    <div>
                      <h4 className={styles.patientName}>{story.name}</h4>
                      <p className={styles.patientMeta}>
                        {story.condition}
                      </p>
                    </div>
                  </div>
                </li>
              );
            } else {
              return (
                <li
                  key={`row1-video-${item.videoId}-${i}`}
                  className={`${styles.card} ${styles.videoCard}`}
                  id={`row1-video-${item.videoId}-${i}`}
                >
                  <a href={`https://www.youtube.com/watch?v=${item.videoId}`} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                    <div className={styles.playButtonWrapper}>
                      <Play size={28} fill="var(--color-primary, #034EA2)" stroke="var(--color-primary, #034EA2)" />
                    </div>
                  </a>
                </li>
              );
            }
          })}
        </ul>
      </div>
    </section>
  );
}

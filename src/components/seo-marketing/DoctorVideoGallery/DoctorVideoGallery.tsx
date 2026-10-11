"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Play } from "lucide-react";
import styles from "./DoctorVideoGallery.module.css";

interface VideoData {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
}

interface DoctorVideoGalleryProps {
  doctorName: string;
  videos?: VideoData[];
}

const DEFAULT_VIDEOS: VideoData[] = [
  {
    id: "v1",
    title: "Understanding Complex Heart Procedures",
    thumbnail: "https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&q=80&w=600&h=400",
    duration: "3:45"
  },
  {
    id: "v2",
    title: "When should you consult a specialist?",
    thumbnail: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&q=80&w=600&h=400",
    duration: "2:10"
  },
  {
    id: "v3",
    title: "Patient Success Story: A New Lease on Life",
    thumbnail: "https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=600&h=400",
    duration: "4:30"
  }
];

export default function DoctorVideoGallery({ doctorName, videos = DEFAULT_VIDEOS }: DoctorVideoGalleryProps) {
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  if (!videos || videos.length === 0) return null;

  return (
    <div className={styles.wrapper}>
      <h2 className={styles.heading}>Videos & Insights by {doctorName}</h2>
      <p className={styles.subheading}>Watch educational videos and procedure explanations directly from the specialist.</p>
      
      <div className={styles.grid}>
        {videos.map((vid) => (
          <div key={vid.id} className={styles.videoCard}>
            <div className={styles.thumbnailWrap} onClick={() => setActiveVideo(vid.id)}>
              <Image 
                src={vid.thumbnail} 
                alt={vid.title} 
                fill 
                className={styles.thumbnail}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className={styles.playOverlay}>
                <div className={styles.playBtn}>
                  <Play size={20} fill="currentColor" />
                </div>
              </div>
              <span className={styles.duration}>{vid.duration}</span>
            </div>
            <h3 className={styles.videoTitle}>{vid.title}</h3>
          </div>
        ))}
      </div>
      
      {activeVideo && (
        <div className={styles.modalOverlay} onClick={() => setActiveVideo(null)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.videoPlaceholder}>
              <Play size={48} className={styles.placeholderIcon} />
              <p>Video Player Integration Goes Here</p>
            </div>
            <button className={styles.closeBtn} onClick={() => setActiveVideo(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

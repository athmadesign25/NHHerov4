import React from 'react';
import { motion } from 'framer-motion';
import SplitText from '@/components/ui/SplitText';
import styles from '@/components/sections/hero/Hero.module.css';

interface HeroHeadlineProps {
  isOpen: boolean;
}

export default function HeroHeadline({ isOpen }: HeroHeadlineProps) {
  return (
    <div className={`${styles.titleUnit} ${isOpen ? styles.titleHidden : ""}`}>
      <SplitText text="Trusted Care, Every Day" tag="h1" className={styles.headline} delay={0.08} />
      <motion.p 
        className={styles.subHeadline}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: "easeOut" }}
      >
        Compassion Backed by Expertise
      </motion.p>
    </div>
  );
}

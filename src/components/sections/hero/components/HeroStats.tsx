"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from '@/components/sections/hero/Hero.module.css';
import MetricValueReveal from './MetricValueReveal';
import { STAT_GROUPS } from '../hero-stats.data';

interface HeroStatsProps {
  isOpen: boolean;
  currentStatGroup: number;
}

export default function HeroStats({ isOpen, currentStatGroup }: HeroStatsProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
      animate={isOpen ? { opacity: 0, y: 20, filter: "blur(8px)", pointerEvents: "none" } : { opacity: 1, y: 0, filter: "blur(0px)", pointerEvents: "auto" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={styles.metricsRow}
    >
      {STAT_GROUPS[currentStatGroup].map((stat: any, i: number) => (
        <div className={styles.metricItem} key={i}>
          <AnimatePresence mode="wait">
            <motion.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25, delay: i * 0.05, ease: "easeOut" }}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div className={styles.metricValue}>
                <MetricValueReveal value={stat.value} suffix={stat.suffix} />
              </div>
              <div className={styles.metricLabel}>
                {stat.label.split('\n').map((line: string, idx: number) => (
                  <React.Fragment key={idx}>
                    {line}
                    {idx !== stat.label.split('\n').length - 1 && <br/>}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      ))}
    </motion.div>
  );
}

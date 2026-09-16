import React from 'react';
import styles from '@/components/sections/hero/Hero.module.css';

interface QuickTagsProps {
  tags: string[];
  onSelectTag: (tag: string) => void;
}

export default function QuickTags({ tags, onSelectTag }: QuickTagsProps) {
  return (
    <div className={styles.popularSearches}>
      <div className={styles.popularTitle}>what people are searching for :</div>
      <div className={styles.popularTags}>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag(tag)}
            className={styles.popularTagBtn}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}

import React from "react";
import styles from "./SpecialityResultCard.module.css";
import HighlightMatch from "./HighlightMatch";

interface SpecialityResultCardProps {
  spec: {
    name: string;
    image?: string;
    matchingKeyword?: string | null;
  };
  searchQuery?: string;
  onClick: (name: string) => void;
}

export default function SpecialityResultCard({ spec, searchQuery = "", onClick }: SpecialityResultCardProps) {
  return (
    <div
      key={spec.name}
      onClick={() => onClick(spec.name)}
      className={styles.specCard}
    >
      <img
        src={spec.image || "/Specialities icons/General Medicine.svg"}
        alt={spec.name}
        className={styles.specImage}
      />
      <div className={styles.specInfo} style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
        <div className={styles.specName}>
          <HighlightMatch text={spec.name} query={searchQuery} />
        </div>
        {spec.matchingKeyword && (
          <div style={{ fontSize: "10.5px", color: "#64748B", fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Relates to: <HighlightMatch text={spec.matchingKeyword} query={searchQuery} />
          </div>
        )}
      </div>
    </div>
  );
}

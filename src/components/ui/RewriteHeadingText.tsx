"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./RewriteHeadingText.module.css";

interface RewriteHeadingTextProps {
  text: string;
}

interface HeadingToken {
  text: string;
  isWhitespace: boolean;
  delayMs: number;
}

function buildHeadingTokens(text: string): HeadingToken[] {
  const parts = text.split(/(\s+)/);
  const result: HeadingToken[] = [];
  let wordIndex = 0;
  for (const part of parts) {
    const isWhitespace = /^\s+$/.test(part);
    if (isWhitespace) {
      result.push({ text: part, isWhitespace: true, delayMs: 0 });
    } else {
      result.push({
        text: part,
        isWhitespace: false,
        delayMs: Math.min(260, wordIndex * 45),
      });
      wordIndex += 1;
    }
  }
  return result;
}

/**
 * Renders a filter heading with a calm, left-to-right editorial word reveal
 * whenever `text` changes after initial mount — avoiding width/layout bounce
 * on the adjacent result count.
 */
export default function RewriteHeadingText({ text }: RewriteHeadingTextProps) {
  const isFirstMountRef = useRef(true);
  const prevTextRef = useRef(text);
  const [rewriteGen, setRewriteGen] = useState(0);

  useEffect(() => {
    if (isFirstMountRef.current) {
      isFirstMountRef.current = false;
      prevTextRef.current = text;
      return;
    }

    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
      setRewriteGen((g) => g + 1);
    }
  }, [text]);

  const tokens = useMemo(() => buildHeadingTokens(text), [text]);

  if (rewriteGen === 0) {
    return <span className={styles.wrapper}>{text}</span>;
  }

  return (
    <span key={rewriteGen} className={styles.wrapper} aria-label={text}>
      <span aria-hidden="true">
        {tokens.map((token, idx) =>
          token.isWhitespace ? (
            <React.Fragment key={idx}>{token.text}</React.Fragment>
          ) : (
            <span
              key={idx}
              className={styles.word}
              style={{ animationDelay: `${token.delayMs}ms` }}
            >
              {token.text}
            </span>
          )
        )}
      </span>
    </span>
  );
}

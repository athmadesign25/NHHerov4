"use client";

/**
 * Token proof sheet.
 *
 * Reads the custom properties off :root at runtime rather than listing them
 * by hand, so it cannot disagree with globals.css. Add a token and it shows
 * up here; delete one and it disappears. A hand-maintained version drifts
 * from the stylesheet within a sprint, which makes it worse than nothing —
 * it looks authoritative while being wrong.
 *
 * Not linked from any navigation. It exists to be looked at while making
 * design decisions, which is when gaps become obvious: a missing disabled
 * colour, a focus ring that vanishes on dark, two radii you cannot tell
 * apart until they sit side by side.
 */

import { useEffect, useState } from "react";
import styles from "./ds-lab.module.css";

type Token = { name: string; value: string };

/**
 * Custom properties are not enumerable from getComputedStyle, so they are
 * read from the stylesheet rules directly. A CSSStyleDeclaration does list
 * custom properties as indexed entries, which is what makes this possible.
 */
function readRootTokens(): Token[] {
  const found = new Map<string, string>();
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // A cross-origin sheet (the Google Fonts import) throws on access.
      continue;
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule)) continue;
      if (!rule.selectorText?.split(",").some((s) => s.trim() === ":root")) continue;
      const decl = rule.style;
      for (let i = 0; i < decl.length; i++) {
        const prop = decl[i];
        if (prop.startsWith("--")) found.set(prop, decl.getPropertyValue(prop).trim());
      }
    }
  }
  return [...found.entries()]
    .map(([name, value]) => ({ name, value }))
    // Numeric-aware, or a plain string sort files --slate-50 after
    // --slate-450 and the ramp reads out of order.
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
}

/** Resolve a token to the value the browser actually paints. */
function resolve(name: string): string {
  if (typeof window === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

const match = (t: Token, ...pats: RegExp[]) => pats.some((p) => p.test(t.name));

export default function DsLab() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [onDark, setOnDark] = useState(false);

  useEffect(() => {
    setTokens(readRootTokens());
  }, []);

  if (!tokens.length) {
    return <main className={styles.page}><p className={styles.empty}>Reading tokens…</p></main>;
  }

  // A token is a colour if it resolves to something a colour swatch can show.
  const isColour = (t: Token) => {
    const v = resolve(t.name);
    return /^(#|rgb|hsl)/.test(v);
  };

  const colours = tokens.filter((t) => isColour(t) && !match(t, /-rgb$/));
  const channels = tokens.filter((t) => match(t, /-rgb$/));
  const sizes = tokens.filter((t) => match(t, /^--font-size-/));
  const leading = tokens.filter((t) => match(t, /^--leading-/));
  const spacing = tokens.filter((t) => match(t, /^--sp-/));
  const radii = tokens.filter((t) => match(t, /^--radius-/));
  // --shadow-rgb is a channel triplet rather than a shadow, so it would
  // render as an empty card here.
  const elevation = tokens.filter((t) => match(t, /^--elevation-/, /^--shadow-/) && !/-rgb$/.test(t.name));
  const motion = tokens.filter((t) => match(t, /^--duration-/, /^--ease-/, /^--transition-/));

  const group = (list: Token[], prefixes: string[]) =>
    prefixes.map((p) => ({ p, items: list.filter((t) => t.name.startsWith(p)) })).filter((g) => g.items.length);

  const colourGroups = group(colours, [
    "--white", "--black", "--slate-", "--grey-", "--blue-", "--cyan-", "--sky-",
    "--red-", "--navy-", "--green-", "--emerald-", "--teal-", "--amber-",
    "--violet-", "--pink-", "--color-",
  ]);

  return (
    <main className={`${styles.page} ${onDark ? styles.dark : ""}`}>
      <header className={styles.head}>
        <div>
          <h1 className={styles.h1}>Token proof sheet</h1>
          <p className={styles.sub}>
            {tokens.length} tokens, read from <code>:root</code> at runtime — this page cannot
            disagree with <code>globals.css</code>.
          </p>
        </div>
        <button className={styles.toggle} onClick={() => setOnDark((v) => !v)}>
          {onDark ? "Light surface" : "Dark surface"}
        </button>
      </header>

      {/* ── COLOUR ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Colour <span className={styles.count}>{colours.length}</span></h2>
        {colourGroups.map(({ p, items }) => (
          <div key={p} className={styles.block}>
            <h3 className={styles.h3}>{p.replace(/^--/, "").replace(/-$/, "") || "base"}</h3>
            <div className={styles.swatches}>
              {items.map((t) => (
                <div key={t.name} className={styles.swatch}>
                  <div className={styles.chip} style={{ background: `var(${t.name})` }} />
                  <code className={styles.tokName}>{t.name}</code>
                  <code className={styles.tokVal}>{resolve(t.name)}</code>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── ALPHA ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Alpha ramp <span className={styles.count}>{channels.length} channels</span></h2>
        <p className={styles.note}>
          Colours used at opacity more often than solid are held as channels, so the alpha composes
          at the call site. The ramp tightens near transparent because a small absolute step is a
          large relative change there.
        </p>
        {channels.slice(0, 4).map((t) => (
          <div key={t.name} className={styles.alphaRow}>
            <code className={styles.tokName}>{t.name}</code>
            <div className={styles.alphaStrip}>
              {[0.03, 0.05, 0.08, 0.1, 0.12, 0.16, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95].map((a) => (
                <div key={a} className={styles.alphaCell}
                     style={{ background: `rgba(var(${t.name}), ${a})` }} title={String(a)}>
                  <span>{a}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* ── TYPE ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Typography <span className={styles.count}>{sizes.length} sizes · {leading.length} leading</span></h2>
        {sizes.map((t) => (
          <div key={t.name} className={styles.typeRow}>
            <code className={styles.tokName}>{t.name}</code>
            <code className={styles.tokVal}>{resolve(t.name)}</code>
            <p className={styles.specimen} style={{ fontSize: `var(${t.name})` }}>
              Trusted care, every day — 0123456789
            </p>
          </div>
        ))}
        <div className={styles.block}>
          <h3 className={styles.h3}>Leading</h3>
          <p className={styles.note}>
            Chosen by the size it accompanies: small text needs proportionally more room, display
            type needs less. Shown here at 16px so the steps are comparable.
          </p>
          <div className={styles.leadGrid}>
            {leading.map((t) => (
              <div key={t.name} className={styles.leadCell}>
                <code className={styles.tokName}>{t.name}</code>
                <code className={styles.tokVal}>{resolve(t.name)}</code>
                <p style={{ lineHeight: `var(${t.name})` }}>
                  Narayana Health provides affordable, high quality care across more than thirty
                  specialities and twenty four cities.
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ELEVATION ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Elevation <span className={styles.count}>{elevation.length}</span></h2>
        <p className={styles.note}>
          Two layers per step: a tight contact shadow holding the object to the surface, and a wide
          ambient one giving it height. Navy rather than black — pure black over a blue-tinted UI
          reads as grime rather than depth.
        </p>
        <div className={styles.elevGrid}>
          {elevation.map((t) => (
            <div key={t.name} className={styles.elevCell} style={{ boxShadow: `var(${t.name})` }}>
              <code className={styles.tokName}>{t.name}</code>
            </div>
          ))}
        </div>
      </section>

      {/* ── RADIUS + SPACING ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Radius &amp; spacing</h2>
        <div className={styles.radGrid}>
          {radii.map((t) => (
            <div key={t.name} className={styles.radCell}>
              <div className={styles.radBox} style={{ borderRadius: `var(${t.name})` }} />
              <code className={styles.tokName}>{t.name}</code>
              <code className={styles.tokVal}>{resolve(t.name)}</code>
            </div>
          ))}
        </div>
        <div className={styles.block}>
          {spacing.map((t) => (
            <div key={t.name} className={styles.spaceRow}>
              <code className={styles.tokName}>{t.name}</code>
              <code className={styles.tokVal}>{resolve(t.name)}</code>
              <div className={styles.spaceBar} style={{ width: `var(${t.name})` }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── MOTION ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>Motion <span className={styles.count}>{motion.length}</span></h2>
        <p className={styles.note}>
          Hover a bar to see its duration and easing. Framer cannot read these — the same values are
          mirrored in <code>src/lib/motion.ts</code>.
        </p>
        <div className={styles.block}>
          {motion.filter((t) => t.name.startsWith("--duration-")).map((t) => (
            <div key={t.name} className={styles.motionRow}>
              <code className={styles.tokName}>{t.name}</code>
              <code className={styles.tokVal}>{resolve(t.name)}</code>
              <div className={styles.motionTrack}>
                <div className={styles.motionDot}
                     style={{ transitionDuration: `var(${t.name})`, transitionTimingFunction: "var(--ease-out)" }} />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATES ── */}
      <section className={styles.section}>
        <h2 className={styles.h2}>States</h2>
        <p className={styles.note}>
          The gap worth noticing: there is no disabled colour token and no dedicated focus colour on
          dark. Both are needed before any form component gets built.
        </p>
        <div className={styles.stateRow}>
          <button className={styles.btnPrimary}>Primary</button>
          <button className={`${styles.btnPrimary} ${styles.isFocus}`}>Focus ring</button>
          <button className={styles.btnPrimary} disabled>Disabled</button>
          <button className={styles.btnOutline}>Outline</button>
          <button className={styles.btnGhost}>Ghost</button>
        </div>
      </section>
    </main>
  );
}

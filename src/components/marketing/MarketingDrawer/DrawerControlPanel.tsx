"use client";

/**
 * Prototyping panel for the marketing drawer.
 *
 * Stands in for the CMS form. Everything here is a closed set, so whatever
 * is built with it is reproducible by a marketer later. The set is
 * deliberately small — size, break points and scrim shades were all
 * controls once and are not any more, because each one was a way for two
 * banners to stop looking like the same brand.
 *
 * DEV ONLY. Renders nothing in a production build.
 */

import { motion, useDragControls } from "framer-motion";
import { Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import styles from "./DrawerControlPanel.module.css";
import {
  type BannerConfig,
  type Orientation,
  type CollapseMode,
  type FieldKind,
  FIELD_PRESETS,
  MAX_FIELDS,
  TEXT_COLORS,
} from "./types";
import { useIsMobile } from "./useIsMobile";

type Props = {
  config: BannerConfig;
  onChange: (next: BannerConfig) => void;
};

const ORIENTATIONS: Orientation[] = ["vertical", "horizontal"];
const COLLAPSE: CollapseMode[] = ["none", "toast"];
const KINDS: FieldKind[] = ["name", "phone", "custom"];

function Switch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={onToggle}
      className={on ? styles.switchOn : styles.switchOff}
    >
      <span className={styles.knob} />
    </button>
  );
}

export default function DrawerControlPanel({ config, onChange }: Props) {
  const controls = useDragControls();
  const isMobile = useIsMobile();
  if (process.env.NODE_ENV === "production") return null;
  // There is no room for it beside a 92vw panel, and mobile is a preview
  // of what desktop produced rather than its own thing to configure.
  if (isMobile) return null;

  const set = (patch: Partial<BannerConfig>) => onChange({ ...config, ...patch });

  const parts = config.headline.parts;
  const setParts = (next: typeof parts) =>
    set({ headline: { ...config.headline, parts: next } });

  const fields = config.form.fields;
  const setFields = (next: typeof fields) => set({ form: { ...config.form, fields: next } });

  const movePart = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= parts.length) return;
    const next = [...parts];
    [next[i], next[j]] = [next[j], next[i]];
    setParts(next);
  };

  return (
    <motion.aside
      // The banner is always centred, so the panel no longer has an edge
      // to dodge — it sits in the corner furthest from it.
      className={`${styles.panel} ${styles.atBottomRight}`}
      drag
      // Drag starts from the header ONLY. On the whole panel, framer captures
      // the pointer and the scrollable body never receives it.
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
    >
      <header
        className={styles.head}
        onPointerDown={(e) => controls.start(e)}
        style={{ cursor: "grab", touchAction: "none" }}
      >
        <span className={styles.title}>Drawer controls</span>
        <span className={styles.hint}>drag header</span>
      </header>

      {/* data-lenis-prevent: Lenis swallows wheel events globally, so an
          overflow container has to opt out explicitly or it will not scroll.
          This is the convention the rest of the codebase uses.
          data-drawer-scrollable is ours, for the drawer's own blocker. */}
      <div className={styles.body} data-drawer-scrollable data-lenis-prevent>
        {/* The only spatial choice left. Position (four edges) and overlay
            tone (dark/light) were both controls; each one let two banners
            stop looking like the same brand without buying any range. */}
        <section className={styles.row}>
          <label className={styles.label}>Orientation</label>
          <div className={styles.seg}>
            {ORIENTATIONS.map((o) => (
              <button
                key={o}
                onClick={() => set({ orientation: o })}
                className={o === config.orientation ? styles.segOn : styles.segOff}
              >
                {o}
              </button>
            ))}
          </div>
        </section>

        <section className={styles.row}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Headline</label>
            <Switch
              on={config.headline.enabled}
              onToggle={() =>
                set({ headline: { ...config.headline, enabled: !config.headline.enabled } })
              }
            />
          </div>
          {/* Off means the artwork carries its own type, and the panel
              drops its readability scrim to stop covering it up. */}
          {config.headline.enabled && (
          <div className={styles.labelRow}>
            <span className={styles.hint}>lines</span>
            <button
              className={styles.add}
              onClick={() =>
                setParts([
                  ...parts,
                  { id: `h${Date.now()}`, text: "New line", colorId: TEXT_COLORS[0].id },
                ])
              }
            >
              <Plus size={12} /> add
            </button>
          </div>
          )}

          {config.headline.enabled &&
            parts.map((p, i) => (
            <div key={p.id} className={styles.part}>
              <input
                className={styles.input}
                value={p.text}
                onChange={(e) =>
                  setParts(parts.map((x) => (x.id === p.id ? { ...x, text: e.target.value } : x)))
                }
              />
              <div className={styles.partTools}>
                {TEXT_COLORS.map((c) => (
                  <button
                    key={c.id}
                    title={c.label}
                    onClick={() =>
                      setParts(parts.map((x) => (x.id === p.id ? { ...x, colorId: c.id } : x)))
                    }
                    className={c.id === p.colorId ? styles.dotOn : styles.dot}
                    style={{ background: c.value }}
                  />
                ))}
                <span className={styles.spacer} />
                <button className={styles.icon} onClick={() => movePart(i, -1)} title="move up">
                  <ArrowUp size={12} />
                </button>
                <button className={styles.icon} onClick={() => movePart(i, 1)} title="move down">
                  <ArrowDown size={12} />
                </button>
                <button
                  className={styles.icon}
                  onClick={() => parts.length > 1 && setParts(parts.filter((x) => x.id !== p.id))}
                  title="remove"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            ))}
        </section>

        {/* No colour control: body copy takes the readable neutral for its
            tone, and anything else is a mistake the system should not offer. */}
        <section className={styles.row}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Description</label>
            <Switch
              on={config.description.enabled}
              onToggle={() =>
                set({ description: { ...config.description, enabled: !config.description.enabled } })
              }
            />
          </div>
          {config.description.enabled && (
            <input
              className={styles.input}
              value={config.description.text}
              onChange={(e) => set({ description: { ...config.description, text: e.target.value } })}
            />
          )}
        </section>

        {/* What survives the close. */}
        <section className={styles.row}>
          <label className={styles.label}>On close</label>
          <div className={styles.seg}>
            {COLLAPSE.map((c) => (
              <button
                key={c}
                onClick={() => set({ collapse: c })}
                className={c === config.collapse ? styles.segOn : styles.segOff}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Sits directly above the buttons in the panel, because the
            buttons are what submit it. Two fields maximum. */}
        <section className={styles.row}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Form</label>
            <Switch
              on={config.form.enabled}
              onToggle={() => set({ form: { ...config.form, enabled: !config.form.enabled } })}
            />
          </div>

          {config.form.enabled && (
            <>
              {fields.map((f) => (
                <div key={f.id} className={styles.part}>
                  <input
                    className={styles.input}
                    value={f.label}
                    placeholder={FIELD_PRESETS[f.kind].label}
                    onChange={(e) =>
                      setFields(
                        fields.map((x) => (x.id === f.id ? { ...x, label: e.target.value } : x)),
                      )
                    }
                  />
                  <div className={styles.partTools}>
                    <div className={styles.seg}>
                      {KINDS.map((k) => (
                        <button
                          key={k}
                          // Switching kind renames the field too, unless it
                          // has been renamed by hand already.
                          onClick={() =>
                            setFields(
                              fields.map((x) =>
                                x.id === f.id
                                  ? {
                                      ...x,
                                      kind: k,
                                      label:
                                        x.label === FIELD_PRESETS[x.kind].label
                                          ? FIELD_PRESETS[k].label
                                          : x.label,
                                    }
                                  : x,
                              ),
                            )
                          }
                          className={k === f.kind ? styles.segOn : styles.segOff}
                        >
                          {k}
                        </button>
                      ))}
                    </div>
                    <span className={styles.spacer} />
                    <button
                      className={styles.icon}
                      onClick={() => setFields(fields.filter((x) => x.id !== f.id))}
                      title="remove"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {fields.length < MAX_FIELDS && (
                <button
                  className={styles.add}
                  onClick={() =>
                    setFields([...fields, { id: `f${Date.now()}`, kind: "custom", label: "Label" }])
                  }
                >
                  <Plus size={12} /> add field
                </button>
              )}
            </>
          )}
        </section>

        <section className={styles.row}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Primary button</label>
            <Switch
              on={config.cta.primary.enabled}
              onToggle={() =>
                set({
                  cta: {
                    ...config.cta,
                    primary: { ...config.cta.primary, enabled: !config.cta.primary.enabled },
                  },
                })
              }
            />
          </div>
          {config.cta.primary.enabled && (
            <input
              className={styles.input}
              value={config.cta.primary.label}
              onChange={(e) =>
                set({
                  cta: { ...config.cta, primary: { ...config.cta.primary, label: e.target.value } },
                })
              }
            />
          )}
        </section>

        {/* The second one is always the quieter of the two. A pair of
            equally loud buttons is a pair nobody presses. */}
        <section className={styles.row}>
          <div className={styles.labelRow}>
            <label className={styles.label}>Secondary button</label>
            <Switch
              on={config.cta.secondary.enabled}
              onToggle={() =>
                set({
                  cta: {
                    ...config.cta,
                    secondary: { ...config.cta.secondary, enabled: !config.cta.secondary.enabled },
                  },
                })
              }
            />
          </div>
          {config.cta.secondary.enabled && (
            <input
              className={styles.input}
              value={config.cta.secondary.label}
              onChange={(e) =>
                set({
                  cta: {
                    ...config.cta,
                    secondary: { ...config.cta.secondary, label: e.target.value },
                  },
                })
              }
            />
          )}
        </section>
      </div>
    </motion.aside>
  );
}

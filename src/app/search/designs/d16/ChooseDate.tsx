"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, X } from "lucide-react";
import SearchDialog from "../d3/SearchDialog";
import chipStyles from "../../doctors/DoctorControlChip.module.css";
import styles from "./ChooseDate.module.css";

interface Props {
  value: string;
  min: string;
  max: string;
  disabled?: boolean;
  onChange: (date: string) => void;
}

const DAY_MS = 86_400_000;
const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const iso = (date: Date) => date.toISOString().slice(0, 10);
function readDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && iso(date) === value ? date : null;
}
const format = (value: string, options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-IN", { ...options, timeZone: "UTC" }).format(readDate(value)!);
function shiftMonth(value: string, amount: number): string {
  const date = readDate(value)!;
  const first = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1, 12));
  const last = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12)).getUTCDate();
  first.setUTCDate(Math.min(date.getUTCDate(), last));
  return iso(first);
}

export default function ChooseDate({ value, min, max, disabled = false, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const validRange = Boolean(readDate(min) && readDate(max) && min <= max);
  const selected = readDate(value) && value >= min && value <= max ? value : "";
  const label = selected ? format(selected, { weekday: "short", day: "numeric", month: "short" }) : "Choose date";
  return <>
    <button type="button" className={chipStyles.chip} data-selected={Boolean(selected) || undefined} disabled={disabled || !validRange}
      aria-haspopup="dialog" aria-expanded={open} aria-label={selected ? `Appointment date: ${format(selected, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}. Change date` : "Choose appointment date"}
      onClick={() => setOpen(true)}><CalendarDays size={16} aria-hidden /><span>{label}</span></button>
    {open && validRange && <Calendar key={`${min}-${max}`} value={selected} min={min} max={max} onClose={() => setOpen(false)}
      onChange={(date) => { onChange(date); setOpen(false); }} />}
  </>;
}

function Calendar({ value, min, max, onChange, onClose }: Omit<Props, "disabled"> & { onClose: () => void }) {
  const id = useId();
  const grid = useRef<HTMLTableElement>(null);
  const [focused, setFocused] = useState(value >= min && value <= max ? value : min);
  const month = focused.slice(0, 7);
  const first = readDate(`${month}-01`)!;
  const count = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth() + 1, 0, 12)).getUTCDate();
  const offset = first.getUTCDay();
  const weeks = Math.ceil((offset + count) / 7);
  const move = (date: string) => setFocused(date < min ? min : date > max ? max : date);

  useEffect(() => {
    // Focus after the native modal opens; allow its scroll area to reveal the
    // selected day on short screens and during keyboard navigation.
    const frame = requestAnimationFrame(() => {
      const day = grid.current?.querySelector<HTMLButtonElement>(`[data-date="${focused}"]`);
      day?.focus({ preventScroll: true });
      day?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    return () => cancelAnimationFrame(frame);
  }, [focused]);

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>, date: string) => {
    const current = readDate(date)!;
    let next: string;
    switch (event.key) {
      case "ArrowLeft": next = iso(new Date(current.getTime() - DAY_MS)); break;
      case "ArrowRight": next = iso(new Date(current.getTime() + DAY_MS)); break;
      case "ArrowUp": next = iso(new Date(current.getTime() - 7 * DAY_MS)); break;
      case "ArrowDown": next = iso(new Date(current.getTime() + 7 * DAY_MS)); break;
      case "Home": next = iso(new Date(current.getTime() - current.getUTCDay() * DAY_MS)); break;
      case "End": next = iso(new Date(current.getTime() + (6 - current.getUTCDay()) * DAY_MS)); break;
      case "PageUp": next = shiftMonth(date, event.shiftKey ? -12 : -1); break;
      case "PageDown": next = shiftMonth(date, event.shiftKey ? 12 : 1); break;
      default: return;
    }
    event.preventDefault();
    move(next);
  };

  return <SearchDialog title="Choose appointment date" doctorPreview onClose={onClose}
    footer={value ? <button type="button" className={styles.clear} onClick={() => onChange("")}><X size={16} aria-hidden />Clear date</button> : undefined}>
    <div className={styles.calendar}>
      <div className={styles.monthNav}>
        <button type="button" disabled={month <= min.slice(0, 7)} aria-label="Previous month" onClick={() => move(`${shiftMonth(focused, -1).slice(0, 7)}-01`)}><ChevronLeft size={20} aria-hidden /></button>
        <h3 id={`${id}-month`} aria-live="polite" aria-atomic="true">{format(`${month}-01`, { month: "long", year: "numeric" })}</h3>
        <button type="button" disabled={month >= max.slice(0, 7)} aria-label="Next month" onClick={() => move(`${shiftMonth(focused, 1).slice(0, 7)}-01`)}><ChevronRight size={20} aria-hidden /></button>
      </div>
      <p id={`${id}-keyboard`} className={styles.srOnly}>Use arrow keys to move by day or week, Home and End for the start or end of the week, and Page Up or Page Down to change month. Press Enter to choose a date.</p>
      <table ref={grid} className={styles.grid} role="grid" aria-labelledby={`${id}-month`} aria-describedby={`${id}-keyboard`}>
        <thead><tr>{weekdays.map((day) => <th key={day} scope="col" abbr={day}>{day.slice(0, 2)}</th>)}</tr></thead>
        <tbody>{Array.from({ length: weeks }, (_, week) => <tr key={week}>{weekdays.map((_, weekday) => {
          const day = week * 7 + weekday - offset + 1;
          if (day < 1 || day > count) return <td key={weekday} aria-hidden="true" />;
          const date = `${month}-${String(day).padStart(2, "0")}`;
          const unavailable = date < min || date > max;
          const today = date === min;
          return <td key={weekday} aria-selected={date === value}>
            <button type="button" data-date={date} data-selected={date === value || undefined} aria-current={today ? "date" : undefined} disabled={unavailable} tabIndex={date === focused ? 0 : -1}
              aria-label={`${today ? "Today, " : ""}${format(date, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${date === value ? ", selected" : ""}`}
              onFocus={() => setFocused(date)} onKeyDown={(event) => onKeyDown(event, date)} onClick={() => onChange(date)}>
              <span className={styles.dayNumber}>{day}</span>
            </button>
          </td>;
        })}</tr>)}</tbody>
      </table>
    </div>
  </SearchDialog>;
}

// Timezone-aware date helpers. No deps — Node's Intl handles zone conversion.

export type Today = { iso: string; label: string };

/** Current date in the given IANA timezone: { iso: "2026-09-18", label: "Thursday, 2026-09-18" }. */
export function todayInTz(tz: string): Today {
  const zone = safeZone(tz);
  const iso = new Intl.DateTimeFormat("en-CA", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date()); // en-CA => YYYY-MM-DD
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    weekday: "long",
  }).format(new Date());
  return { iso, label: `${weekday}, ${iso}` };
}

/** Falls back to UTC if the zone string is missing or invalid. */
export function safeZone(tz: string | null | undefined): string {
  if (!tz) return "UTC";
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return tz;
  } catch {
    return "UTC";
  }
}

export type DueBucket = "overdue" | "today" | "week" | "later";

/** Classify a YYYY-MM-DD due date relative to today (also YYYY-MM-DD). */
export function dueBucket(dueDate: string, todayIso: string): DueBucket {
  if (dueDate < todayIso) return "overdue";
  if (dueDate === todayIso) return "today";
  if (dueDate <= addDays(todayIso, 7)) return "week";
  return "later";
}

/** Add days to a YYYY-MM-DD string, returning YYYY-MM-DD (UTC math, date-only). */
export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Date formatting (English, en-US) for the whole UI. */

const TAG = "en-US";

function toDate(value: string | Date): Date {
  return value instanceof Date ? value : new Date(value);
}

/** « Saturday, June 14, 2026 » */
export function formatDate(value: string | Date): string {
  return new Intl.DateTimeFormat(TAG, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(toDate(value));
}

/** « Saturday, June 14, 2026 at 6:30 PM » */
export function formatDateTime(value: string | Date): string {
  const d = toDate(value);
  const time = d.toLocaleTimeString(TAG, {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${formatDate(d)} at ${time}`;
}

/** « Jun 14, 2026 » (compact cards) */
export function formatShort(value: string | Date): string {
  return new Intl.DateTimeFormat(TAG, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(toDate(value));
}

/** Time only: « 6:30 PM » */
export function formatTime(value: string | Date): string {
  return toDate(value).toLocaleTimeString(TAG, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Short month for the card banner: « Jun » */
export function formatMonthShort(value: string | Date): string {
  return toDate(value).toLocaleDateString(TAG, { month: "short" });
}

/** True when both values fall on the same calendar day (local time). */
export function isSameDay(a: string | Date, b: string | Date): boolean {
  const da = toDate(a);
  const db = toDate(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

/** « Saturday, June 14, 2026, 6:00 – 9:30 PM » (same day) or a full range. */
export function formatDateRange(start: string | Date, end: string | Date): string {
  if (isSameDay(start, end)) {
    return `${formatDate(start)}, ${formatTime(start)} – ${formatTime(end)}`;
  }
  return `${formatDateTime(start)} → ${formatDateTime(end)}`;
}

export function dayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDay(key: string, delta: number) {
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, (m ?? 1) - 1, d ?? 1);
  date.setDate(date.getDate() + delta);
  return dayKey(date);
}

export function lastDays(count: number) {
  const today = dayKey();
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) keys.push(shiftDay(today, -i));
  return keys;
}

export function weekdayNarrow(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y ?? 2026, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en", {
    weekday: "narrow",
  });
}

export function dayNumber() {
  const [y, m, d] = dayKey().split("-").map(Number);
  return Math.floor(Date.UTC(y ?? 2026, (m ?? 1) - 1, d ?? 1) / 86_400_000);
}

export function liveStreak(streak: number, lastPracticeDate: string | null) {
  if (!lastPracticeDate || streak <= 0) return 0;
  const today = dayKey();
  if (lastPracticeDate === today || lastPracticeDate === shiftDay(today, -1)) return streak;
  return 0;
}

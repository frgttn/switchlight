export function formatTime(minutes: number): string {
  if (typeof minutes !== "number" || isNaN(minutes) || minutes < 0) {
    throw new Error("Invalid minutes: must be a non-negative number");
  }

  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  let result = [];

  if (h > 0) result.push(`${h} ч.`);
  if (m > 0) result.push(`${m} мин.`);

  return result.length > 0 ? result.join(" ") : "0 мин.";
}

export function formatTimeOfDay(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

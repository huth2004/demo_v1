import { Period } from "./type";

export const BLOCK_TIME_MINUTES = 15;

export function convertToBlockTime(date: Date, isRoundUp = false): number {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const diffInMs = date.getTime() - startOfDay.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));

  if (!isRoundUp) return Math.floor(diffInMinutes / BLOCK_TIME_MINUTES);
  return Math.ceil(diffInMinutes / BLOCK_TIME_MINUTES);
}

export function convertToDateTime(block: number, date = Date.now()) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const minutes = block * BLOCK_TIME_MINUTES;
  const dateTime = new Date(startOfDay.getTime() + minutes * 60 * 1000);

  return dateTime;
}

export function isOverlap(periodA: Period, periodB: Period) {
  return !(
    periodA.startDate >= periodB.endDate || periodA.endDate <= periodB.startDate
  );
}

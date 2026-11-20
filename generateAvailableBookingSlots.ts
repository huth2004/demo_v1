import { AvailableBookingPeriods } from "./getAvailableBookingPeriods";
import { SuggestedBooking } from "./type";
import { BLOCK_TIME_MINUTES, convertToBlockTime } from "./util";

export type AvailableBookingSlots = Map<number, SuggestedBooking>;

export function generateAvailableBookingSlots(
  sameDaySortedAvailablePeriods: AvailableBookingPeriods,
  bookingDate: Date,
  requiredTotalMinutes: number,
  startBufferMinutes: number,
  endBufferMinutes: number,
): AvailableBookingSlots {
  const startOfDay = new Date(bookingDate);
  startOfDay.setHours(0, 0, 0, 0);

  const slotMap: Map<number, SuggestedBooking> = new Map();

  const requiredStartBufferMs = startBufferMinutes * 60_000;
  const requiredEndBufferMs = endBufferMinutes * 60_000;

  const requiredServiceMs =
    requiredTotalMinutes * 60_000 - requiredStartBufferMs - requiredEndBufferMs;

  sameDaySortedAvailablePeriods.forEach((periods, employeeId) => {
    periods.forEach((period) => {
      // Earliest possible service start
      const earliestStartDate = new Date(
        period.startDate.getTime() + requiredStartBufferMs,
      );

      // Latest possible service start
      const latestStartDate = new Date(
        period.endDate.getTime() - requiredServiceMs - requiredEndBufferMs,
      );

      // Skip periods without sufficient available time
      if (earliestStartDate > latestStartDate) return;

      // Calculate valid start blocks
      const startBlock = convertToBlockTime(earliestStartDate, true);
      const endBlock = convertToBlockTime(latestStartDate);

      for (let i = startBlock; i <= endBlock; i++) {
        const slotStartDate = new Date(
          startOfDay.getTime() + i * BLOCK_TIME_MINUTES * 60_000,
        );

        const slot: SuggestedBooking = slotMap.get(i) ?? {
          startDate: slotStartDate,
          endDate: new Date(slotStartDate.getTime() + requiredServiceMs),
          durationMinutes: requiredServiceMs / 60_000,
          availableEmployees: [],
        };

        if (!slot.availableEmployees.includes(employeeId)) {
          slot.availableEmployees.push(employeeId);
        }

        slotMap.set(i, slot);
      }
    });
  });

  return slotMap;
}

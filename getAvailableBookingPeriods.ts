import { Shift, Booking, Period } from "./type";

export type AvailableBookingPeriods = Map<string, Period[]>;

export function getAvailableBookingPeriods(
  sameDaySortedShifts: Shift[],
  sameDaySortedBookings: Booking[],
  requiredTotalMinutes: number,
): AvailableBookingPeriods {
  const bookingMap: Map<string, Booking[]> = new Map();

  // Map sameDayBookings theo shiftId
  sameDaySortedBookings.forEach((booking) => {
    const bookings = bookingMap.get(booking.shiftId) ?? [];
    bookings.push(booking);
    bookingMap.set(booking.shiftId, bookings);
  });

  const availableMap: Map<string, Period[]> = new Map();

  // Duyet tung shift trong sameDayShift
  sameDaySortedShifts.forEach((shift) => {
    const periods = availableMap.get(shift.employeeId) ?? [];
    const bookings = bookingMap.get(shift.id) ?? [];

    // Khoang thoi gian can kiem tra con lai
    let remainingPeriod: Period = {
      startDate: shift.startDate,
      endDate: shift.endDate,
    };

    // Duyet tung booking thuoc ve ca
    bookings.forEach((booking) => {
      // Khoang thoi gian tu dau remainingPeriod den khi bat dau booking
      const availablePeriod: Period = {
        startDate: remainingPeriod.startDate,
        endDate: booking.startDate,
      };

      const availableDurationMinutes =
        (availablePeriod.endDate.getTime() -
          availablePeriod.startDate.getTime()) /
        60_000;

      // Neu khoang thoi gian nay dap ung yeu cau thi them vao periods
      if (availableDurationMinutes >= requiredTotalMinutes)
        periods.push(availablePeriod);

      // Khoang thoi gian con lai sau khi loai bo availablePeriod va booking
      remainingPeriod = {
        startDate: booking.endDate,
        endDate: remainingPeriod.endDate,
      };
    });

    const remainingDurationMinutes =
      (remainingPeriod.endDate.getTime() -
        remainingPeriod.startDate.getTime()) /
      60_000;

    // Neu khoang thoi gian con lai dap ung yeu cau thi them vao periods
    if (remainingDurationMinutes >= requiredTotalMinutes)
      periods.push(remainingPeriod);

    availableMap.set(shift.employeeId, periods);
  });

  return availableMap;
}

import { getAvailableBookingPeriods } from "./getAvailableBookingPeriods";
import { generateAvailableBookingSlots } from "./generateAvailableBookingSlots";
import {
  BookingRepository,
  EmployeeRepository,
  ServiceRepository,
  ShiftRepository,
} from "./repository";

export class GetListSuggestPeriodBookingUseCase {
  constructor(
    private readonly bookingRepository: BookingRepository,
    private readonly serviceRepository: ServiceRepository,
    private readonly employeeRepository: EmployeeRepository,
    private readonly shiftRepository: ShiftRepository,
  ) {}

  async execute(
    serviceId: string,
    branchId: string,
    bookingDate: Date,
    employeeId: string | null,
  ) {
    const [existingService, existingEmployee] = await Promise.all([
      this.serviceRepository.findById(serviceId),
      employeeId !== null
        ? this.employeeRepository.findById(employeeId)
        : undefined,
    ]);

    if (existingService === null) {
      throw Error("Service not found");
    }

    if (existingEmployee === null) {
      throw Error("Employee not found");
    }

    if (!existingService.branchIds.includes(branchId)) {
      throw Error("Service does not belong branch");
    }

    const [from, to] = [new Date(bookingDate), new Date(bookingDate)];

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    const [shifts, bookings] = await Promise.all([
      this.shiftRepository.findAndSortAllByBranchAndDate(branchId, from, to),
      this.bookingRepository.findAndSortAllByBranchAndDate(branchId, from, to),
    ]);

    const filteredShifts = shifts.filter(
      (shift) =>
        (!existingEmployee || shift.employeeId === existingEmployee.id) &&
        shift.employees?.level >= existingService.requiredEmployeeLevel &&
        shift.workArea.type === existingService.requiredWorkAreaType,
    );

    const requiredTotalMinutes =
      existingService.serviceMinutes +
      existingService.bufferStartMinutes +
      existingService.bufferEndMinutes;

    const availabeBookingPeriods = getAvailableBookingPeriods(
      filteredShifts,
      bookings,
      requiredTotalMinutes,
    );

    return generateAvailableBookingSlots(
      availabeBookingPeriods,
      bookingDate,
      requiredTotalMinutes,
      existingService.bufferStartMinutes,
      existingService.bufferEndMinutes,
    );
  }
}

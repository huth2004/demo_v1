import {
  EmployeeRepository,
  ShiftRepository,
  WorkAreaRepository,
} from "./repository";
import { Period, Shift, WorkArea } from "./type";
import { isOverlap } from "./util";

export class AssignWorkAreaForShiftUseCase {
  constructor(
    private readonly shiftRepository: ShiftRepository,
    private readonly workAreaRepository: WorkAreaRepository,
    private readonly employeeRepository: EmployeeRepository,
  ) {}

  async execute(
    shiftId: string,
    workAreaId: string,
    employeeId: string,
  ): Promise<Shift> {
    // 1. Retrieve required entities
    const [existingShift, existingWorkArea, employeeExists] = await Promise.all(
      [
        this.shiftRepository.findById(shiftId),
        this.workAreaRepository.findById(workAreaId),
        this.employeeRepository.existsById(employeeId),
      ],
    );

    // 2. Validate existence
    if (!employeeExists) {
      throw new Error("Employee not found");
    }

    if (!existingShift) {
      throw new Error("Shift not found");
    }

    if (!existingWorkArea) {
      throw new Error("Work area not found");
    }

    // 3. Validate employee assignment
    if (existingShift.employeeId !== employeeId) {
      throw new Error("The specified employee is not assigned to this shift");
    }

    // 4. Validate branch
    if (existingWorkArea.branchId !== existingShift.branchId) {
      throw new Error("Work area and shift must belong to the same branch");
    }

    // 5. Validate shift period
    const assignShiftPeriod: Period = {
      startDate: existingShift.startDate,
      endDate: existingShift.endDate,
    };

    if (
      !Number.isFinite(assignShiftPeriod.startDate.getTime()) ||
      !Number.isFinite(assignShiftPeriod.endDate.getTime()) ||
      assignShiftPeriod.startDate >= assignShiftPeriod.endDate
    ) {
      throw new Error("Shift has an invalid time period");
    }

    // 6. Define date range
    const from = new Date(existingShift.startDate);
    const to = new Date(existingShift.endDate);

    from.setHours(0, 0, 0, 0);
    to.setHours(23, 59, 59, 999);

    // 7. Retrieve assigned shifts
    const shifts = await this.shiftRepository.findAllByWorkAreaIdAndDate(
      workAreaId,
      from,
      to,
    );

    // 8. Check overlapping shifts
    shifts.some((shift) => {
      const shiftPeriod: Period = {
        startDate: shift.startDate,
        endDate: shift.endDate,
      };

      return (
        shift.id !== existingShift.id &&
        isOverlap(assignShiftPeriod, shiftPeriod)
      );
    });

    // 9. Update shift
    const updatedShift: Shift = {
      ...existingShift,
      workAreaId,
    };

    return this.shiftRepository.update(updatedShift);
  }
}

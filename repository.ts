import { Booking, Employee, Service, Shift, WorkArea } from "./type";

export abstract class BookingRepository {
  abstract findAndSortAllByBranchAndDate(
    branchId: string,
    from: Date,
    to: Date,
  ): Promise<Booking[]>;
}

export abstract class ServiceRepository {
  abstract findById(id: string): Promise<Service | null>;
}

export abstract class ShiftRepository {
  abstract findById(id: string): Promise<Shift | null>;

  abstract findAllByWorkAreaIdAndDate(
    workAreaId: string,
    from: Date,
    to: Date,
  ): Promise<Shift[]>;

  abstract findAndSortAllByBranchAndDate(
    branchId: string,
    from: Date,
    to: Date,
  ): Promise<Shift[]>;
  abstract existsById(id: string): Promise<boolean>;

  abstract update(shift: Shift): Promise<Shift>;
}

export abstract class EmployeeRepository {
  abstract findById(id: string): Promise<Employee | null>;
  abstract existsById(id: string): Promise<boolean>;
}

export abstract class WorkAreaRepository {
  abstract findById(id: string): Promise<WorkArea | null>;
}

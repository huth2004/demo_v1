export type Shift = {
  id: string;
  branchId: string;
  employeeId: string;
  employees: Employee;
  startDate: Date;
  endDate: Date;
  workAreaId: string | null;
  workArea: WorkArea;
};

export type Booking = {
  id: string;
  branchId: string;
  serviceId: string;
  shiftId: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
  workAreaId: string;
};

export type Period = {
  startDate: Date;
  endDate: Date;
};

export type SuggestedBooking = {
  startDate: Date;
  endDate: Date;
  durationMinutes: number;
  availableEmployees: string[];
};

export type Employee = {
  id: string;
  name: string;
  level: number;
};

export enum WorkAreaType {
  ROOOM,
  BED,
  BOOTH,
}

export type WorkArea = {
  id: string;
  branchId: string;
  name: string;
  type: WorkAreaType;
};

export type Service = {
  id: string;
  branchIds: string[];
  name: string;
  serviceMinutes: number;
  bufferStartMinutes: number;
  bufferEndMinutes: number;
  requiredEmployeeLevel: number;
  requiredWorkAreaType: WorkAreaType;
};

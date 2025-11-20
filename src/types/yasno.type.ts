export type SlotType = "NotPlanned" | "Definite" | string;

export type ScheduleStatus =
  | "ScheduleApplies"
  | "WaitingForSchedule"
  | "EmergencyShutdowns";

export interface ScheduleSlot {
  start: number;
  end: number;
  type: SlotType;
}

export interface DaySchedule {
  slots: ScheduleSlot[];
  date: string; // ISO Date string
  status: ScheduleStatus;
}

export interface GroupScheduleData {
  today: DaySchedule;
  tomorrow: DaySchedule;
  updatedOn: string;
}

export type YasnoResponse = Record<string, GroupScheduleData>;

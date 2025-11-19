import { ScheduleSlot } from "./yasno.type";

export interface OutageAnalysisResult {
  message: string;
  lightIsOn: boolean | null;
  minutesUntilChange: number | null;
  nextChange: ScheduleSlot | null;
}

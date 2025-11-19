import type { ScheduleSlot } from "./yasno.type.js";

export interface OutageAnalysisResult {
  message: string;
  lightIsOn: boolean | null;
  minutesUntilChange: number | null;
  nextChange: ScheduleSlot | null;
}

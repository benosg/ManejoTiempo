import type { DayMode, ShiftType } from "../models";
import { fromIsoDate } from "./date";

export const TOLERANCE_MINUTES = 15;

const expectedNormalMinutes = (dateIso: string): number => {
  const day = fromIsoDate(dateIso).getDay();
  if (day >= 1 && day <= 4) return 510;
  if (day === 5) return 450;
  return 0;
};

const expectedShiftMinutes = (shiftType: ShiftType | undefined): number => {
  if (shiftType === "manana") return 450;
  if (shiftType === "tarde") return 420;
  return 450;
};

export const expectedMinutesForDay = (
  dateIso: string,
  mode: DayMode,
  shiftType: ShiftType | undefined,
  isHolidayOrWeekend: boolean
): number => {
  if (isHolidayOrWeekend) return 0;
  if (mode === "turno") return expectedShiftMinutes(shiftType);
  return expectedNormalMinutes(dateIso);
};

export const dayBalanceStatus = (
  recordedMinutes: number,
  expectedMinutes: number,
  isHolidayOrWeekend: boolean
): "incompleto" | "completo" | "excedido" | "inhabil" => {
  if (isHolidayOrWeekend) return recordedMinutes > 0 ? "excedido" : "inhabil";
  if (recordedMinutes < expectedMinutes - TOLERANCE_MINUTES) return "incompleto";
  if (recordedMinutes > expectedMinutes + TOLERANCE_MINUTES) return "excedido";
  return "completo";
};

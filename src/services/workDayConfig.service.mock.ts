import type { DayMode, ShiftType, WorkDayConfig } from "../models";
import type { IWorkDayConfigService } from "./interfaces";

const keyFor = (userId: string, date: string) => `${userId}:${date}`;

const store = new Map<string, WorkDayConfig>();

export class WorkDayConfigServiceMock implements IWorkDayConfigService {
  async getConfig(userId: string, date: string): Promise<WorkDayConfig> {
    const key = keyFor(userId, date);
    const existing = store.get(key);
    if (existing) return existing;
    const defaultConfig: WorkDayConfig = {
      userId,
      date,
      mode: "normal"
    };
    store.set(key, defaultConfig);
    return defaultConfig;
  }

  async setConfig(userId: string, date: string, mode: DayMode, shiftType?: ShiftType): Promise<WorkDayConfig> {
    const key = keyFor(userId, date);
    const next: WorkDayConfig = {
      userId,
      date,
      mode,
      shiftType: mode === "turno" ? shiftType ?? "manana" : undefined
    };
    store.set(key, next);
    return next;
  }
}

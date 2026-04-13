import { useCallback, useMemo, useState } from "react";
import type { SuggestionItem, TimeEntry, WorkDayConfig } from "../models";
import { services } from "../services/container";
import type { TimeEntryCreateInput, TimeEntryUpdateInput } from "../services/interfaces";

export const useTimeEntries = (userId: string) => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [weekEntries, setWeekEntries] = useState<TimeEntry[]>([]);
  const [monthEntries, setMonthEntries] = useState<TimeEntry[]>([]);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [workDayConfig, setWorkDayConfig] = useState<WorkDayConfig | null>(null);

  const loadDay = useCallback(async (date: string) => {
    const [dailyEntries, dailySuggestions, config] = await Promise.all([
      services.timeEntries.listByDate(userId, date),
      services.suggestions.listDailySuggestions(userId, date),
      services.workDayConfig.getConfig(userId, date)
    ]);
    setEntries(dailyEntries);
    setSuggestions(dailySuggestions);
    setWorkDayConfig(config);
  }, [userId]);

  const loadWeek = useCallback(async (weekStart: string) => {
    const data = await services.timeEntries.listByWeek(userId, weekStart);
    setWeekEntries(data);
  }, [userId]);

  const loadMonth = useCallback(async (month: string) => {
    const data = await services.timeEntries.listByMonth(userId, month);
    setMonthEntries(data);
  }, [userId]);

  const createEntry = useCallback(async (payload: Omit<TimeEntryCreateInput, "userId">) => {
    await services.timeEntries.create({ ...payload, userId });
  }, [userId]);

  const updateEntry = useCallback(async (entryId: string, patch: TimeEntryUpdateInput) => {
    await services.timeEntries.update(entryId, patch);
  }, []);

  const deleteEntry = useCallback(async (entryId: string) => {
    await services.timeEntries.remove(entryId);
  }, []);

  const repeatPreviousDay = useCallback(async (date: string) => {
    return services.timeEntries.repeatPreviousDay(userId, date);
  }, [userId]);

  const setDayMode = useCallback(
    async (date: string, mode: WorkDayConfig["mode"], shiftType?: WorkDayConfig["shiftType"]) => {
      const next = await services.workDayConfig.setConfig(userId, date, mode, shiftType);
      setWorkDayConfig(next);
    },
    [userId]
  );

  return useMemo(
    () => ({
      entries,
      weekEntries,
      monthEntries,
      suggestions,
      workDayConfig,
      loadDay,
      loadWeek,
      loadMonth,
      createEntry,
      updateEntry,
      deleteEntry,
      repeatPreviousDay,
      setDayMode
    }),
    [
      entries,
      weekEntries,
      monthEntries,
      suggestions,
      workDayConfig,
      loadDay,
      loadWeek,
      loadMonth,
      createEntry,
      updateEntry,
      deleteEntry,
      repeatPreviousDay,
      setDayMode
    ]
  );
};

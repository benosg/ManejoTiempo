import type { TimeEntry } from "../models";

export const sumMinutes = (entries: TimeEntry[]): number => {
  return entries.reduce((total, item) => total + item.minutes, 0);
};

export const minutesToHoursLabel = (minutes: number): string => {
  return `${(minutes / 60).toFixed(1)}h`;
};

export const groupMinutesByCategory = (entries: TimeEntry[]): Record<string, number> => {
  return entries.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] ?? 0) + item.minutes;
    return acc;
  }, {});
};

export const groupMinutesByProject = (entries: TimeEntry[]): Record<string, number> => {
  return entries.reduce<Record<string, number>>((acc, item) => {
    acc[item.projectId] = (acc[item.projectId] ?? 0) + item.minutes;
    return acc;
  }, {});
};

import type { TimeEntry } from "../models";
import { timeEntriesMock } from "../mocks/timeEntries.mock";
import { addDays, fromIsoDate, toIsoDate } from "../utils/date";
import { makeId } from "../utils/ids";
import type { ITimeEntriesService, TimeEntryCreateInput, TimeEntryUpdateInput } from "./interfaces";

let entriesStore: TimeEntry[] = [...timeEntriesMock];

const inWeek = (entryDate: string, weekStartIso: string): boolean => {
  const d = fromIsoDate(entryDate).getTime();
  const ws = fromIsoDate(weekStartIso).getTime();
  const we = addDays(fromIsoDate(weekStartIso), 6).getTime();
  return d >= ws && d <= we;
};

const inMonth = (entryDate: string, month: string): boolean => {
  const [year, monthIndex] = month.split("-").map(Number);
  if (!year || !monthIndex) return false;
  const date = fromIsoDate(entryDate).getTime();
  const monthStart = new Date(year, monthIndex - 1, 1).getTime();
  const monthEnd = new Date(year, monthIndex, 0).getTime();
  return date >= monthStart && date <= monthEnd;
};

export class TimeEntriesServiceMock implements ITimeEntriesService {
  async listByDate(userId: string, date: string): Promise<TimeEntry[]> {
    return entriesStore
      .filter((item) => item.userId === userId && item.date === date)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async listByWeek(userId: string, weekStart: string): Promise<TimeEntry[]> {
    return entriesStore
      .filter((item) => item.userId === userId && inWeek(item.date, weekStart))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async listByMonth(userId: string, month: string): Promise<TimeEntry[]> {
    return entriesStore
      .filter((item) => item.userId === userId && inMonth(item.date, month))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async create(input: TimeEntryCreateInput): Promise<TimeEntry> {
    const now = new Date().toISOString();
    const next: TimeEntry = {
      id: makeId("e"),
      userId: input.userId,
      date: input.date,
      minutes: input.minutes,
      projectId: input.projectId,
      taskId: input.taskId,
      category: input.category,
      comment: input.comment?.trim() || undefined,
      planned: input.planned,
      source: input.source ?? "manual",
      createdAt: now,
      updatedAt: now
    };
    entriesStore = [next, ...entriesStore];
    return next;
  }

  async update(entryId: string, patch: TimeEntryUpdateInput): Promise<TimeEntry> {
    const index = entriesStore.findIndex((item) => item.id === entryId);
    if (index < 0) throw new Error("Registro no encontrado");
    const current = entriesStore[index];
    const updated: TimeEntry = {
      ...current,
      ...patch,
      comment: patch.comment?.trim() || undefined,
      updatedAt: new Date().toISOString()
    };
    entriesStore[index] = updated;
    return updated;
  }

  async remove(entryId: string): Promise<void> {
    entriesStore = entriesStore.filter((item) => item.id !== entryId);
  }

  async repeatPreviousDay(userId: string, date: string): Promise<number> {
    const previousDate = toIsoDate(addDays(fromIsoDate(date), -1));
    const source = entriesStore.filter((item) => item.userId === userId && item.date === previousDate);
    if (!source.length) return 0;
    const now = new Date().toISOString();
    const cloned = source.map<TimeEntry>((item) => ({
      ...item,
      id: makeId("e"),
      date,
      source: "quick-action",
      createdAt: now,
      updatedAt: now
    }));
    entriesStore = [...cloned, ...entriesStore];
    return cloned.length;
  }
}

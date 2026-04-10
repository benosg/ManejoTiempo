import type {
  DayMode,
  Holiday,
  ShiftType,
  SuggestionItem,
  TimeEntry,
  WorkDayConfig
} from "../models";

export interface TimeEntryCreateInput {
  userId: string;
  date: string;
  minutes: number;
  projectId: string;
  taskId?: string;
  category: TimeEntry["category"];
  comment?: string;
  planned: boolean;
  source?: TimeEntry["source"];
}

export interface TimeEntryUpdateInput {
  minutes?: number;
  projectId?: string;
  taskId?: string;
  category?: TimeEntry["category"];
  comment?: string;
  planned?: boolean;
}

export interface ITimeEntriesService {
  listByDate(userId: string, date: string): Promise<TimeEntry[]>;
  listByWeek(userId: string, weekStart: string): Promise<TimeEntry[]>;
  create(input: TimeEntryCreateInput): Promise<TimeEntry>;
  update(entryId: string, patch: TimeEntryUpdateInput): Promise<TimeEntry>;
  remove(entryId: string): Promise<void>;
  repeatPreviousDay(userId: string, date: string): Promise<number>;
}

export interface ISuggestionsService {
  listDailySuggestions(userId: string, date: string): Promise<SuggestionItem[]>;
}

export interface IWorkDayConfigService {
  getConfig(userId: string, date: string): Promise<WorkDayConfig>;
  setConfig(userId: string, date: string, mode: DayMode, shiftType?: ShiftType): Promise<WorkDayConfig>;
}

export interface IHolidayProvider {
  getHolidays(countryCode: string, year: number): Promise<Holiday[]>;
}

export interface IHolidayService {
  getHoliday(countryCode: string, date: string): Promise<Holiday | null>;
}

export interface OutlookSuggestionProvider {
  getMeetingSuggestions(userId: string, date: string): Promise<SuggestionItem[]>;
}

export interface AzureDevOpsSuggestionProvider {
  getWorkItemSuggestions(userId: string, date: string): Promise<SuggestionItem[]>;
}

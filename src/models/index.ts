export type ActivityCategory =
  | "desarrollo"
  | "reunion"
  | "soporte"
  | "incidente"
  | "documentacion"
  | "analisis"
  | "otro";

export const ACTIVITY_CATEGORIES: ActivityCategory[] = [
  "desarrollo",
  "reunion",
  "soporte",
  "incidente",
  "documentacion",
  "analisis",
  "otro"
];

export type DayMode = "normal" | "turno";
export type ShiftType = "manana" | "tarde";

export interface User {
  id: string;
  name: string;
  team: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  source: "manual" | "azure-devops";
}

export interface TimeEntry {
  id: string;
  userId: string;
  date: string;
  minutes: number;
  projectId: string;
  taskId?: string;
  category: ActivityCategory;
  comment?: string;
  planned: boolean;
  source: "manual" | "quick-action" | "outlook-suggested" | "ado-suggested";
  createdAt: string;
  updatedAt: string;
}

export interface SuggestionItem {
  id: string;
  label: string;
  category: ActivityCategory;
  minutes: number;
  projectId?: string;
  taskId?: string;
  source: "frequent" | "outlook" | "azure-devops";
}

export interface Holiday {
  date: string;
  localName: string;
  countryCode: string;
  source: "api" | "mock";
}

export interface WorkDayConfig {
  userId: string;
  date: string;
  mode: DayMode;
  shiftType?: ShiftType;
}

import type { Task } from "../models";

export const tasksMock: Task[] = [
  { id: "t-101", projectId: "p-1", title: "Implementar filtro avanzado", source: "manual" },
  { id: "t-102", projectId: "p-1", title: "Corregir bug login", source: "azure-devops" },
  { id: "t-201", projectId: "p-2", title: "Refactor modulo reportes", source: "manual" },
  { id: "t-301", projectId: "p-3", title: "Incidente API pagos", source: "azure-devops" }
];

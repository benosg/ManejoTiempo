import type { SuggestionItem } from "../models";

export const suggestionsMock: SuggestionItem[] = [
  {
    id: "s-1",
    label: "Reunion de seguimiento (Outlook mock)",
    category: "reunion",
    minutes: 30,
    projectId: "p-1",
    source: "outlook"
  },
  {
    id: "s-2",
    label: "Work item #102 (Azure DevOps mock)",
    category: "desarrollo",
    minutes: 60,
    projectId: "p-1",
    taskId: "t-102",
    source: "azure-devops"
  },
  {
    id: "s-3",
    label: "Soporte recurrente",
    category: "soporte",
    minutes: 45,
    projectId: "p-3",
    source: "frequent"
  }
];

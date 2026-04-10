import type { SuggestionItem } from "../models";
import type { AzureDevOpsSuggestionProvider, OutlookSuggestionProvider } from "./interfaces";

export class OutlookProviderPlaceholder implements OutlookSuggestionProvider {
  async getMeetingSuggestions(_userId: string, _date: string): Promise<SuggestionItem[]> {
    return [];
  }
}

export class AzureDevOpsProviderPlaceholder implements AzureDevOpsSuggestionProvider {
  async getWorkItemSuggestions(_userId: string, _date: string): Promise<SuggestionItem[]> {
    return [];
  }
}

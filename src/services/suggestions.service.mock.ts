import { suggestionsMock } from "../mocks/suggestions.mock";
import type { SuggestionItem } from "../models";
import type { ISuggestionsService } from "./interfaces";

export class SuggestionsServiceMock implements ISuggestionsService {
  async listDailySuggestions(_userId: string, _date: string): Promise<SuggestionItem[]> {
    return suggestionsMock;
  }
}

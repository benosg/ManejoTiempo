import { HolidayService } from "./holiday.service";
import { FallbackHolidayProvider, MockHolidayProvider, NagerDateHolidayProvider } from "./holiday.providers";
import { SuggestionsServiceMock } from "./suggestions.service.mock";
import { TimeEntriesServiceMock } from "./timeEntries.service.mock";
import { WorkDayConfigServiceMock } from "./workDayConfig.service.mock";

export const services = {
  timeEntries: new TimeEntriesServiceMock(),
  suggestions: new SuggestionsServiceMock(),
  workDayConfig: new WorkDayConfigServiceMock(),
  holidays: new HolidayService(new FallbackHolidayProvider(new NagerDateHolidayProvider(), new MockHolidayProvider()))
};

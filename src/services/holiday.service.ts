import type { Holiday } from "../models";
import { fromIsoDate } from "../utils/date";
import type { IHolidayProvider, IHolidayService } from "./interfaces";

export class HolidayService implements IHolidayService {
  private readonly byYearCache = new Map<string, Holiday[]>();

  constructor(private readonly provider: IHolidayProvider) {}

  async getHoliday(countryCode: string, date: string): Promise<Holiday | null> {
    const year = fromIsoDate(date).getFullYear();
    const cacheKey = `${countryCode}-${year}`;
    let holidays = this.byYearCache.get(cacheKey);
    if (!holidays) {
      holidays = await this.provider.getHolidays(countryCode, year);
      this.byYearCache.set(cacheKey, holidays);
    }
    return holidays.find((item) => item.date === date) ?? null;
  }
}

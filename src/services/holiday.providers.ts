import { holidaysClMock } from "../mocks/holidays-cl.mock";
import type { Holiday } from "../models";
import type { IHolidayProvider } from "./interfaces";

type NagerHolidayResponse = {
  date: string;
  localName: string;
  countryCode: string;
};

export class NagerDateHolidayProvider implements IHolidayProvider {
  async getHolidays(countryCode: string, year: number): Promise<Holiday[]> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo obtener feriados desde API externa");
    const data = (await response.json()) as NagerHolidayResponse[];
    return data.map((item) => ({
      date: item.date,
      localName: item.localName,
      countryCode: item.countryCode,
      source: "api"
    }));
  }
}

export class MockHolidayProvider implements IHolidayProvider {
  async getHolidays(countryCode: string, year: number): Promise<Holiday[]> {
    return holidaysClMock.filter((item) => item.countryCode === countryCode && item.date.startsWith(String(year)));
  }
}

export class FallbackHolidayProvider implements IHolidayProvider {
  constructor(private readonly primary: IHolidayProvider, private readonly fallback: IHolidayProvider) {}

  async getHolidays(countryCode: string, year: number): Promise<Holiday[]> {
    try {
      return await this.primary.getHolidays(countryCode, year);
    } catch {
      return this.fallback.getHolidays(countryCode, year);
    }
  }
}

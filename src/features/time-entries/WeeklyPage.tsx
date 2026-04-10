import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTimeEntries } from "../../hooks/useTimeEntries";
import { services } from "../../services/container";
import type { ShiftType } from "../../models";
import { addDays, shortDayName, startOfWeekMonday, toIsoDate, weekDays } from "../../utils/date";
import { expectedMinutesForDay } from "../../utils/schedule";
import { minutesToHoursLabel, sumMinutes } from "../../utils/summaries";

type Props = { userId: string };

export const WeeklyPage = ({ userId }: Props) => {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeekMonday(new Date()));
  const [dayContext, setDayContext] = useState<Record<string, { mode: "normal" | "turno"; shiftType?: ShiftType; isHolidayOrWeekend: boolean }>>({});
  const { weekEntries, loadWeek } = useTimeEntries(userId);

  useEffect(() => {
    void loadWeek(toIsoDate(weekStart));
  }, [loadWeek, weekStart]);

  useEffect(() => {
    const loadWeekContext = async () => {
      const days = weekDays(weekStart);
      const contextEntries = await Promise.all(
        days.map(async (day) => {
          const dateIso = toIsoDate(day);
          const [config, holiday] = await Promise.all([
            services.workDayConfig.getConfig(userId, dateIso),
            services.holidays.getHoliday("CL", dateIso)
          ]);
          const isHolidayOrWeekend = Boolean(holiday) || [0, 6].includes(day.getDay());
          return [dateIso, { mode: config.mode, shiftType: config.shiftType, isHolidayOrWeekend }] as const;
        })
      );

      setDayContext(Object.fromEntries(contextEntries));
    };

    void loadWeekContext();
  }, [userId, weekStart]);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const totalWeek = sumMinutes(weekEntries);

  const rows = days.map((day) => {
    const dateIso = toIsoDate(day);
    const dayEntries = weekEntries.filter((entry) => entry.date === dateIso);
    const total = sumMinutes(dayEntries);
    const context = dayContext[dateIso];
    const expected = expectedMinutesForDay(
      dateIso,
      context?.mode ?? "normal",
      context?.shiftType,
      context?.isHolidayOrWeekend ?? [0, 6].includes(day.getDay())
    );
    return { dateIso, dayName: shortDayName(day), total, expected };
  });

  return (
    <div className="space-y-4">
      <Card className="space-y-5 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-[Manrope] text-3xl font-extrabold text-slate-900">Resumen semanal</h2>
            <p className="text-sm text-slate-600">Visibilidad de carga por día para planificar con datos reales.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setWeekStart((prev) => addDays(prev, -7))}>
              Semana anterior
            </Button>
            <Button variant="secondary" onClick={() => setWeekStart((prev) => addDays(prev, 7))}>
              Semana siguiente
            </Button>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {rows.map((row) => {
            const balance = row.total - row.expected;
            const balanceTone = balance >= 0 ? "text-emerald-700" : "text-amber-700";
            return (
              <Card key={row.dateIso} className="rounded-2xl bg-blue-50/55 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{row.dayName}</p>
                <p className="mt-1 text-sm text-slate-500">{row.dateIso}</p>
                <p className="mt-2 font-[Manrope] text-3xl font-extrabold text-blue-700">{minutesToHoursLabel(row.total)}</p>
                <p className="text-xs text-slate-500">Esperado: {minutesToHoursLabel(row.expected)}</p>
                <p className={`text-xs font-semibold ${balanceTone}`}>Diferencia: {balance >= 0 ? "+" : ""}{minutesToHoursLabel(balance)}</p>
              </Card>
            );
          })}
        </div>

        <div className="overflow-x-auto">
          <table className="mt-2 w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-blue-100 text-slate-500">
                <th className="py-2">Día</th>
                <th className="py-2">Fecha</th>
                <th className="py-2">Registrado</th>
                <th className="py-2">Esperado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.dateIso} className="border-b border-blue-50">
                  <td className="py-2 capitalize">{row.dayName}</td>
                  <td className="py-2">{row.dateIso}</td>
                  <td className="py-2 font-medium">{minutesToHoursLabel(row.total)}</td>
                  <td className="py-2 text-slate-500">{minutesToHoursLabel(row.expected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
          <p className="text-sm text-slate-600">Total semanal registrado</p>
          <p className="font-[Manrope] text-3xl font-extrabold text-slate-900">{minutesToHoursLabel(totalWeek)}</p>
        </div>
      </Card>
    </div>
  );
};

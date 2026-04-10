import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { useTimeEntries } from "../../hooks/useTimeEntries";
import { addDays, shortDayName, startOfWeekMonday, toIsoDate, weekDays } from "../../utils/date";
import { expectedMinutesForDay } from "../../utils/schedule";
import { minutesToHoursLabel, sumMinutes } from "../../utils/summaries";

type Props = { userId: string };

export const WeeklyPage = ({ userId }: Props) => {
  const [weekStart, setWeekStart] = useState<Date>(startOfWeekMonday(new Date()));
  const { weekEntries, loadWeek } = useTimeEntries(userId);

  useEffect(() => {
    void loadWeek(toIsoDate(weekStart));
  }, [loadWeek, weekStart]);

  const days = useMemo(() => weekDays(weekStart), [weekStart]);
  const totalWeek = sumMinutes(weekEntries);

  const rows = days.map((day) => {
    const dateIso = toIsoDate(day);
    const dayEntries = weekEntries.filter((entry) => entry.date === dateIso);
    const total = sumMinutes(dayEntries);
    const expected = expectedMinutesForDay(dateIso, "normal", undefined, [0, 6].includes(day.getDay()));
    return { dateIso, dayName: shortDayName(day), total, expected };
  });

  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Resumen semanal</h2>
            <p className="text-sm text-slate-500">Visibilidad de carga de trabajo por dia.</p>
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

        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="py-2">Dia</th>
                <th className="py-2">Fecha</th>
                <th className="py-2">Horas registradas</th>
                <th className="py-2">Jornada referencia</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.dateIso} className="border-b border-slate-100">
                  <td className="py-2 capitalize">{row.dayName}</td>
                  <td className="py-2">{row.dateIso}</td>
                  <td className="py-2 font-medium">{minutesToHoursLabel(row.total)}</td>
                  <td className="py-2 text-slate-500">{minutesToHoursLabel(row.expected)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm text-slate-600">Total semanal</p>
          <p className="text-lg font-semibold text-slate-900">{minutesToHoursLabel(totalWeek)}</p>
        </div>
      </Card>
    </div>
  );
};

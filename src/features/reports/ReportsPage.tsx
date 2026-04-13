import { useEffect, useMemo, useState } from "react";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { projectsMock } from "../../mocks/projects.mock";
import { useTimeEntries } from "../../hooks/useTimeEntries";
import { startOfWeekMonday, toIsoDate } from "../../utils/date";
import { groupMinutesByCategory, groupMinutesByProject, minutesToHoursLabel, sumMinutes } from "../../utils/summaries";
import { BarChart } from "./BarChart";

type Props = { userId: string };

export const ReportsPage = ({ userId }: Props) => {
  const [period, setPeriod] = useState<"semanal" | "mensual">("semanal");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => toIsoDate(new Date()).slice(0, 7));
  const { weekEntries, monthEntries, loadWeek, loadMonth } = useTimeEntries(userId);

  const moveMonth = (offset: number) => {
    const [year, month] = selectedMonth.split("-").map(Number);
    if (!year || !month) return;
    const next = new Date(year, month - 1 + offset, 1);
    setSelectedMonth(toIsoDate(next).slice(0, 7));
  };

  useEffect(() => {
    if (period === "semanal") {
      void loadWeek(toIsoDate(startOfWeekMonday(new Date())));
      return;
    }
    void loadMonth(selectedMonth);
  }, [loadMonth, loadWeek, period, selectedMonth]);

  const reportEntries = period === "semanal" ? weekEntries : monthEntries;

  const byCategory = useMemo(() => {
    const grouped = groupMinutesByCategory(reportEntries);
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }, [reportEntries]);

  const byProject = useMemo(() => {
    const grouped = groupMinutesByProject(reportEntries);
    return Object.entries(grouped).map(([projectId, value]) => ({
      label: projectsMock.find((project) => project.id === projectId)?.name ?? projectId,
      value
    }));
  }, [reportEntries]);

  const plannedMinutes = reportEntries.filter((entry) => entry.planned).reduce((acc, entry) => acc + entry.minutes, 0);
  const unplannedMinutes = reportEntries.filter((entry) => !entry.planned).reduce((acc, entry) => acc + entry.minutes, 0);

  const periodLabel = period === "semanal" ? "semanal" : "mensual";

  return (
    <div className="space-y-4">
      <Card className="space-y-2 rounded-3xl p-6 md:p-8">
        <h2 className="font-[Manrope] text-3xl font-extrabold text-slate-900">Reportes de carga</h2>
        <p className="text-sm text-slate-600">Distribución de tiempo para priorización, capacidad y mejora continua.</p>
        <p className="text-xs text-slate-500">Estos reportes son para visibilidad y planificación, no para fiscalización.</p>
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <Button variant={period === "semanal" ? "primary" : "secondary"} onClick={() => setPeriod("semanal")}>
            Vista semanal
          </Button>
          <Button variant={period === "mensual" ? "primary" : "secondary"} onClick={() => setPeriod("mensual")}>
            Vista mensual
          </Button>
          {period === "mensual" && (
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" onClick={() => moveMonth(-1)}>
                Mes anterior
              </Button>
              <input
                className="rounded-xl border border-blue-100 px-3 py-2 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
              />
              <Button variant="secondary" onClick={() => moveMonth(1)}>
                Mes siguiente
              </Button>
            </div>
          )}
        </div>
        <p className="text-sm font-semibold text-slate-700">Total {periodLabel}: {minutesToHoursLabel(sumMinutes(reportEntries))}</p>
      </Card>

      <Card className="space-y-3 rounded-2xl bg-blue-50/55 p-5">
        <h3 className="font-[Manrope] text-xl font-bold text-slate-800">Horas por categoría</h3>
        <BarChart rows={byCategory} />
      </Card>

      <Card className="space-y-3 rounded-2xl bg-blue-50/55 p-5">
        <h3 className="font-[Manrope] text-xl font-bold text-slate-800">Horas por proyecto</h3>
        <BarChart rows={byProject} />
      </Card>

      <Card className="grid gap-2 rounded-2xl bg-white p-5 md:grid-cols-2">
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs text-emerald-700">Trabajo planificado</p>
          <p className="font-[Manrope] text-3xl font-extrabold text-emerald-700">{minutesToHoursLabel(plannedMinutes)}</p>
        </div>
        <div className="rounded-xl bg-amber-50 p-4">
          <p className="text-xs text-amber-700">Trabajo no planificado</p>
          <p className="font-[Manrope] text-3xl font-extrabold text-amber-700">{minutesToHoursLabel(unplannedMinutes)}</p>
        </div>
      </Card>
    </div>
  );
};

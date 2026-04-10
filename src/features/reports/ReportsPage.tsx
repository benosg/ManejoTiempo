import { useEffect, useMemo } from "react";
import { Card } from "../../components/ui/Card";
import { projectsMock } from "../../mocks/projects.mock";
import { useTimeEntries } from "../../hooks/useTimeEntries";
import { startOfWeekMonday, toIsoDate } from "../../utils/date";
import { groupMinutesByCategory, groupMinutesByProject, minutesToHoursLabel, sumMinutes } from "../../utils/summaries";
import { BarChart } from "./BarChart";

type Props = { userId: string };

export const ReportsPage = ({ userId }: Props) => {
  const { weekEntries, loadWeek } = useTimeEntries(userId);

  useEffect(() => {
    void loadWeek(toIsoDate(startOfWeekMonday(new Date())));
  }, [loadWeek]);

  const byCategory = useMemo(() => {
    const grouped = groupMinutesByCategory(weekEntries);
    return Object.entries(grouped).map(([label, value]) => ({ label, value }));
  }, [weekEntries]);

  const byProject = useMemo(() => {
    const grouped = groupMinutesByProject(weekEntries);
    return Object.entries(grouped).map(([projectId, value]) => ({
      label: projectsMock.find((project) => project.id === projectId)?.name ?? projectId,
      value
    }));
  }, [weekEntries]);

  const plannedMinutes = weekEntries.filter((entry) => entry.planned).reduce((acc, entry) => acc + entry.minutes, 0);
  const unplannedMinutes = weekEntries.filter((entry) => !entry.planned).reduce((acc, entry) => acc + entry.minutes, 0);

  return (
    <div className="space-y-4">
      <Card className="space-y-2 rounded-3xl p-6 md:p-8">
        <h2 className="font-[Manrope] text-3xl font-extrabold text-slate-900">Reportes de carga</h2>
        <p className="text-sm text-slate-600">Distribución de tiempo para priorización, capacidad y mejora continua.</p>
        <p className="text-xs text-slate-500">Estos reportes son para visibilidad y planificación, no para fiscalización.</p>
        <p className="text-sm font-semibold text-slate-700">Total semanal: {minutesToHoursLabel(sumMinutes(weekEntries))}</p>
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

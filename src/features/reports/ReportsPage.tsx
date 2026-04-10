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
      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Reporte basico</h2>
        <p className="text-sm text-slate-500">Distribucion de tiempo para entender carga y priorizacion.</p>
        <p className="text-sm text-slate-700">Total semanal: {minutesToHoursLabel(sumMinutes(weekEntries))}</p>
      </Card>

      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Horas por categoria</h3>
        <BarChart rows={byCategory} />
      </Card>

      <Card className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-700">Horas por proyecto</h3>
        <BarChart rows={byProject} />
      </Card>

      <Card className="grid gap-2 md:grid-cols-2">
        <div>
          <p className="text-xs text-slate-500">Planificado</p>
          <p className="text-lg font-semibold text-emerald-700">{minutesToHoursLabel(plannedMinutes)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-500">No planificado</p>
          <p className="text-lg font-semibold text-amber-700">{minutesToHoursLabel(unplannedMinutes)}</p>
        </div>
      </Card>
    </div>
  );
};

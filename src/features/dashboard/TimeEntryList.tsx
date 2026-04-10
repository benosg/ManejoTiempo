import { EmptyState } from "../../components/common/EmptyState";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { projectsMock } from "../../mocks/projects.mock";
import { tasksMock } from "../../mocks/tasks.mock";
import type { TimeEntry } from "../../models";
import { minutesToHoursLabel } from "../../utils/summaries";

type Props = {
  entries: TimeEntry[];
  onEdit: (entry: TimeEntry) => void;
  onDelete: (entry: TimeEntry) => Promise<void>;
  onDuplicate: (entry: TimeEntry) => Promise<void>;
  onAdjustMinutes: (entry: TimeEntry, delta: number) => Promise<void>;
  onTogglePlanned: (entry: TimeEntry) => Promise<void>;
};

const projectNameById = (projectId: string): string => {
  return projectsMock.find((item) => item.id === projectId)?.name ?? projectId;
};

const taskNameById = (taskId?: string): string | null => {
  if (!taskId) return null;
  return tasksMock.find((item) => item.id === taskId)?.title ?? taskId;
};

export const TimeEntryList = ({ entries, onEdit, onDelete, onDuplicate, onAdjustMinutes, onTogglePlanned }: Props) => {
  if (!entries.length) {
    return (
      <EmptyState
        title="Sin registros hoy"
        description="Agrega un registro o usa sugerencias para completar el día rápidamente."
      />
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Card key={entry.id} className="flex flex-col gap-4 rounded-2xl bg-blue-50/45 p-5 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="font-[Manrope] text-lg font-bold text-slate-900">
              {entry.category}
            </p>
            <p className="text-sm font-medium text-slate-700">{projectNameById(entry.projectId)}</p>
            {taskNameById(entry.taskId) && <p className="text-xs text-slate-500">{taskNameById(entry.taskId)}</p>}
            {entry.comment && <p className="text-xs text-slate-500">{entry.comment}</p>}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            <div className="mr-2 text-right">
              <p className="font-[Manrope] text-xl font-extrabold text-blue-700">{minutesToHoursLabel(entry.minutes)}</p>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">duración</p>
            </div>
            <Badge tone={entry.planned ? "success" : "warning"}>{entry.planned ? "Trabajo planificado" : "Trabajo no planificado"}</Badge>
            <Button variant="ghost" onClick={() => onAdjustMinutes(entry, -15)}>
              -15m
            </Button>
            <Button variant="ghost" onClick={() => onAdjustMinutes(entry, 15)}>
              +15m
            </Button>
            <Button variant="ghost" onClick={() => onTogglePlanned(entry)}>
              {entry.planned ? "Marcar no planificado" : "Marcar planificado"}
            </Button>
            <Button variant="secondary" onClick={() => onEdit(entry)}>
              Editar
            </Button>
            <Button variant="secondary" onClick={() => onDuplicate(entry)}>
              Duplicar
            </Button>
            <Button variant="danger" onClick={() => onDelete(entry)}>
              Eliminar
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

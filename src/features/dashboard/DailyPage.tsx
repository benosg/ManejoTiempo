import { useEffect, useMemo, useState } from "react";
import { Toast } from "../../components/common/Toast";
import { StatPill } from "../../components/common/StatPill";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";
import { useTimeEntries } from "../../hooks/useTimeEntries";
import { projectsMock } from "../../mocks/projects.mock";
import { ACTIVITY_CATEGORIES, type ActivityCategory, type SuggestionItem, type TimeEntry } from "../../models";
import { services } from "../../services/container";
import { toIsoDate } from "../../utils/date";
import { dayBalanceStatus, expectedMinutesForDay } from "../../utils/schedule";
import { minutesToHoursLabel, sumMinutes } from "../../utils/summaries";
import { QuickActions } from "./QuickActions";
import { TimeEntryForm } from "./TimeEntryForm";
import { TimeEntryList } from "./TimeEntryList";

type Props = { userId: string };

type Notice = {
  message: string;
  tone: "info" | "success";
  actionLabel?: string;
  onAction?: () => void;
  autoHideMs?: number;
};

export const DailyPage = ({ userId }: Props) => {
  const [selectedDate, setSelectedDate] = useState<string>(toIsoDate(new Date()));
  const [editing, setEditing] = useState<TimeEntry | null>(null);
  const [holidayName, setHolidayName] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [filterCategory, setFilterCategory] = useState<ActivityCategory | "all">("all");
  const [filterProject, setFilterProject] = useState<string>("all");
  const {
    entries,
    suggestions,
    workDayConfig,
    loadDay,
    createEntry,
    updateEntry,
    deleteEntry,
    repeatPreviousDay
  } = useTimeEntries(userId);

  useEffect(() => {
    void loadDay(selectedDate);
  }, [loadDay, selectedDate]);

  useEffect(() => {
    const loadHoliday = async () => {
      const holiday = await services.holidays.getHoliday("CL", selectedDate);
      setHolidayName(holiday?.localName ?? null);
    };
    void loadHoliday();
  }, [selectedDate]);

  useEffect(() => {
    if (!notice) return;
    const timeoutId = setTimeout(() => setNotice(null), notice.autoHideMs ?? 2200);
    return () => clearTimeout(timeoutId);
  }, [notice]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "r") {
        event.preventDefault();
        void (async () => {
          const created = await repeatPreviousDay(selectedDate);
          await loadDay(selectedDate);
          if (created > 0) {
            setNotice({ message: `Se copiaron ${created} registros de ayer`, tone: "success" });
            return;
          }
          setNotice({ message: "No hay registros en el dia anterior", tone: "info" });
        })();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loadDay, repeatPreviousDay, selectedDate]);

  const totalMinutes = useMemo(() => sumMinutes(entries), [entries]);
  const isWeekend = [0, 6].includes(new Date(`${selectedDate}T00:00:00`).getDay());
  const isHolidayOrWeekend = Boolean(holidayName) || isWeekend;
  const expectedMinutes = expectedMinutesForDay(
    selectedDate,
    workDayConfig?.mode ?? "normal",
    workDayConfig?.shiftType,
    isHolidayOrWeekend
  );
  const balance = totalMinutes - expectedMinutes;
  const status = dayBalanceStatus(totalMinutes, expectedMinutes, isHolidayOrWeekend);
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const categoryOk = filterCategory === "all" || entry.category === filterCategory;
      const projectOk = filterProject === "all" || entry.projectId === filterProject;
      return categoryOk && projectOk;
    });
  }, [entries, filterCategory, filterProject]);

  const refreshDay = async () => {
    await loadDay(selectedDate);
  };

  const handleSave = async (payload: {
    minutes: number;
    projectId: string;
    taskId?: string;
    category: TimeEntry["category"];
    comment?: string;
    planned: boolean;
  }) => {
    if (editing) {
      await updateEntry(editing.id, payload);
      setEditing(null);
    } else {
      await createEntry({
        date: selectedDate,
        source: "manual",
        ...payload
      });
    }
    await refreshDay();
    setNotice({ message: editing ? "Registro actualizado" : "Registro agregado", tone: "success" });
  };

  const handleApplySuggestion = async (item: SuggestionItem) => {
    await createEntry({
      date: selectedDate,
      minutes: item.minutes,
      category: item.category,
      projectId: item.projectId ?? "p-1",
      taskId: item.taskId,
      planned: item.source !== "outlook",
      source: item.source === "outlook" ? "outlook-suggested" : "ado-suggested"
    });
    await refreshDay();
    setNotice({ message: "Sugerencia agregada", tone: "success" });
  };

  const handleRepeat = async () => {
    const created = await repeatPreviousDay(selectedDate);
    await refreshDay();
    if (created > 0) {
      setNotice({ message: `Se copiaron ${created} registros de ayer`, tone: "success" });
      return;
    }
    setNotice({ message: "No hay registros en el dia anterior", tone: "info" });
  };

  const handleAdjustMinutes = async (entry: TimeEntry, delta: number) => {
    const next = Math.max(15, entry.minutes + delta);
    await updateEntry(entry.id, { minutes: next });
    await refreshDay();
  };

  const handleTogglePlanned = async (entry: TimeEntry) => {
    await updateEntry(entry.id, { planned: !entry.planned });
    await refreshDay();
    setNotice({ message: !entry.planned ? "Marcado como planificado" : "Marcado como no planificado", tone: "info" });
  };

  const handleDuplicate = async (entry: TimeEntry) => {
    await createEntry({
      date: selectedDate,
      minutes: entry.minutes,
      projectId: entry.projectId,
      taskId: entry.taskId,
      category: entry.category,
      comment: entry.comment,
      planned: entry.planned,
      source: "quick-action"
    });
    await refreshDay();
    setNotice({ message: "Registro duplicado", tone: "success" });
  };

  const handleDelete = async (entry: TimeEntry) => {
    await deleteEntry(entry.id);
    await refreshDay();
    setNotice({
      message: "Registro eliminado",
      tone: "info",
      actionLabel: "Deshacer",
      autoHideMs: 5000,
      onAction: () => {
        void (async () => {
          await createEntry({
            date: entry.date,
            minutes: entry.minutes,
            projectId: entry.projectId,
            taskId: entry.taskId,
            category: entry.category,
            comment: entry.comment,
            planned: entry.planned,
            source: "quick-action"
          });
          await refreshDay();
          setNotice({ message: "Registro restaurado", tone: "success" });
        })();
      }
    });
  };

  const statusBadge =
    status === "completo"
      ? { label: "Dia completo", tone: "success" as const }
      : status === "incompleto"
      ? { label: "Dia incompleto", tone: "warning" as const }
      : status === "inhabil"
      ? { label: "Dia inhabil", tone: "default" as const }
      : { label: "Exceso de horas", tone: "danger" as const };

  return (
    <div className="space-y-4">
      {notice && (
        <Toast message={notice.message} tone={notice.tone} actionLabel={notice.actionLabel} onAction={notice.onAction} />
      )}
      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Registro diario</h2>
            <p className="text-sm text-slate-500">Registrar el trabajo diario debe tomar muy poco tiempo.</p>
            <p className="mt-1 text-xs text-slate-400">Atajo rapido: Ctrl/Cmd + R para repetir ayer.</p>
          </div>
          <input
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
          {holidayName && <Badge tone="warning">Feriado CL: {holidayName}</Badge>}
          {isWeekend && <Badge>Fin de semana</Badge>}
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <StatPill label="Esperado" value={minutesToHoursLabel(expectedMinutes)} />
          <StatPill label="Registrado" value={minutesToHoursLabel(totalMinutes)} />
          <StatPill label="Diferencia" value={`${balance >= 0 ? "+" : ""}${minutesToHoursLabel(balance)}`} />
        </div>
      </Card>

      <QuickActions
        mode={workDayConfig?.mode ?? "normal"}
        shiftType={workDayConfig?.shiftType}
        suggestions={suggestions}
        onApplySuggestion={handleApplySuggestion}
        onRepeatPreviousDay={handleRepeat}
      />

      <TimeEntryForm editing={editing} onSave={handleSave} onCancelEdit={() => setEditing(null)} />

      <Card className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-slate-700">Filtrar actividades</p>
          <button
            type="button"
            onClick={() => {
              setFilterCategory("all");
              setFilterProject("all");
            }}
            className="text-xs text-slate-500 underline"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as ActivityCategory | "all")}
          >
            <option value="all">Todas las categorias</option>
            {ACTIVITY_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
          >
            <option value="all">Todos los proyectos</option>
            {projectsMock.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      </Card>

      <TimeEntryList
        entries={filteredEntries}
        onEdit={setEditing}
        onDuplicate={handleDuplicate}
        onAdjustMinutes={handleAdjustMinutes}
        onTogglePlanned={handleTogglePlanned}
        onDelete={handleDelete}
      />
    </div>
  );
};

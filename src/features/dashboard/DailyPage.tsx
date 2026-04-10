import { useEffect, useMemo, useRef, useState } from "react";
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
  const formSectionRef = useRef<HTMLDivElement | null>(null);
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
          setNotice({ message: "No hay registros en el día anterior", tone: "info" });
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
    setNotice({ message: "No hay registros en el día anterior", tone: "info" });
  };

  const handleAdjustMinutes = async (entry: TimeEntry, delta: number) => {
    const next = Math.max(15, entry.minutes + delta);
    await updateEntry(entry.id, { minutes: next });
    await refreshDay();
  };

  const handleTogglePlanned = async (entry: TimeEntry) => {
    await updateEntry(entry.id, { planned: !entry.planned });
    await refreshDay();
    setNotice({ message: !entry.planned ? "Marcado como trabajo planificado" : "Marcado como trabajo no planificado", tone: "info" });
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
      ? { label: "Día completo", tone: "success" as const }
      : status === "incompleto"
      ? { label: "Día incompleto", tone: "warning" as const }
      : status === "inhabil"
      ? { label: "Día inhábil", tone: "default" as const }
      : { label: "Exceso de horas", tone: "danger" as const };

  const progressPercent =
    expectedMinutes <= 0 ? (totalMinutes > 0 ? 100 : 0) : Math.max(0, Math.min(100, Math.round((totalMinutes / expectedMinutes) * 100)));
  const progressMessage =
    status === "completo"
      ? "Buen avance. Ya cumpliste tu jornada referencial."
      : status === "incompleto"
      ? "Vas bien. Te faltan pocos minutos para completar el día."
      : status === "inhabil"
      ? "Día inhábil. Si trabajas, quedará registrado como excepción."
      : "Hoy llevas más horas que la jornada referencial.";

  return (
    <div className="space-y-4">
      {notice && (
        <Toast message={notice.message} tone={notice.tone} actionLabel={notice.actionLabel} onAction={notice.onAction} />
      )}
      <Card className="space-y-5 rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-[Manrope] text-4xl font-extrabold tracking-tight text-slate-900">Hola de nuevo</h2>
            <p className="text-slate-600">
              Llevas {minutesToHoursLabel(totalMinutes)} de {minutesToHoursLabel(expectedMinutes)} registradas hoy
            </p>
            <p className="text-xs text-slate-400">Atajo rápido: Ctrl/Cmd + R para repetir ayer.</p>
          </div>
          <div className="text-right">
            <p className="font-[Manrope] text-5xl font-extrabold text-blue-700">{progressPercent}%</p>
          </div>
        </div>

        <div className="h-3 overflow-hidden rounded-full bg-blue-100">
          <div
            className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <p className="text-sm text-slate-600">{progressMessage}</p>

        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={statusBadge.tone}>{statusBadge.label}</Badge>
          {holidayName && <Badge tone="warning">Feriado CL: {holidayName}</Badge>}
          {isWeekend && <Badge>Fin de semana</Badge>}
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
            onClick={() => formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}
          >
            Registrar ahora
          </button>
          <input
            className="ml-auto rounded-xl border border-blue-100 px-3 py-2 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="grid gap-2 md:grid-cols-3">
          <StatPill label="Esperado" value={minutesToHoursLabel(expectedMinutes)} />
          <StatPill label="Registrado" value={minutesToHoursLabel(totalMinutes)} />
          <StatPill label="Diferencia" value={`${balance >= 0 ? "+" : ""}${minutesToHoursLabel(balance)}`} />
        </div>
      </Card>

      <div ref={formSectionRef} className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <h3 className="font-[Manrope] text-2xl font-extrabold text-slate-900">Registro rápido</h3>
        <p className="text-sm text-slate-600">Completa tu registro en pocos pasos.</p>
      </div>

      <TimeEntryForm editing={editing} onSave={handleSave} onCancelEdit={() => setEditing(null)} />

      <QuickActions
        mode={workDayConfig?.mode ?? "normal"}
        shiftType={workDayConfig?.shiftType}
        suggestions={suggestions}
        onApplySuggestion={handleApplySuggestion}
        onRepeatPreviousDay={handleRepeat}
      />

      <Card className="space-y-3 rounded-2xl bg-blue-100/70">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-[Manrope] text-lg font-bold text-slate-800">Filtrar actividades</p>
          <button
            type="button"
            onClick={() => {
              setFilterCategory("all");
              setFilterProject("all");
            }}
            className="text-xs font-semibold text-slate-500 underline"
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
            <option value="all">Todas las categorías</option>
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

      <div>
        <h3 className="font-[Manrope] text-2xl font-extrabold text-slate-900">Registros de hoy</h3>
      </div>

      <TimeEntryList
        entries={filteredEntries}
        onEdit={setEditing}
        onDuplicate={handleDuplicate}
        onAdjustMinutes={handleAdjustMinutes}
        onTogglePlanned={handleTogglePlanned}
        onDelete={handleDelete}
      />
      <p className="text-xs text-slate-500">Mostrando {filteredEntries.length} de {entries.length} actividades del día.</p>
    </div>
  );
};

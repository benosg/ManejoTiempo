import { useEffect, useMemo, useState } from "react";
import { ACTIVITY_CATEGORIES, type ActivityCategory, type TimeEntry } from "../../models";
import { projectsMock } from "../../mocks/projects.mock";
import { tasksMock } from "../../mocks/tasks.mock";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

type FormData = {
  minutes: number;
  projectId: string;
  taskId: string;
  category: ActivityCategory;
  comment: string;
  planned: boolean;
};

type Props = {
  editing?: TimeEntry | null;
  onSave: (payload: {
    minutes: number;
    projectId: string;
    taskId?: string;
    category: ActivityCategory;
    comment?: string;
    planned: boolean;
  }) => Promise<void>;
  onCancelEdit: () => void;
};

const buildInitial = (editing?: TimeEntry | null): FormData => ({
  minutes: editing?.minutes ?? 60,
  projectId: editing?.projectId ?? projectsMock[0].id,
  taskId: editing?.taskId ?? "",
  category: editing?.category ?? "desarrollo",
  comment: editing?.comment ?? "",
  planned: editing?.planned ?? true
});

const QUICK_MINUTE_PRESETS = [30, 60, 90, 120];

export const TimeEntryForm = ({ editing, onSave, onCancelEdit }: Props) => {
  const [form, setForm] = useState<FormData>(buildInitial(editing));

  useEffect(() => {
    setForm(buildInitial(editing));
  }, [editing]);

  const filteredTasks = useMemo(
    () => tasksMock.filter((task) => task.projectId === form.projectId),
    [form.projectId]
  );

  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async () => {
    if (form.minutes < 15 || form.minutes > 720) return;
    await onSave({
      minutes: form.minutes,
      projectId: form.projectId,
      taskId: form.taskId || undefined,
      category: form.category,
      comment: form.comment.trim() || undefined,
      planned: form.planned
    });
    if (!editing) {
      setForm(buildInitial(null));
    }
  };

  return (
    <Card className="space-y-5 rounded-3xl border-2 border-blue-200/80 bg-gradient-to-b from-white to-blue-50/40 p-6 shadow-[0_12px_30px_rgba(37,99,235,0.18)] md:p-8">
      <h2 className="font-[Manrope] text-xl font-extrabold text-slate-900">{editing ? "Editar actividad" : "Registrar actividad"}</h2>

      <div className="flex flex-wrap items-center gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Duración rápida</p>
        {QUICK_MINUTE_PRESETS.map((minutes) => {
          const active = form.minutes === minutes;
          return (
            <button
              key={minutes}
              type="button"
              onClick={() => updateField("minutes", minutes)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                active ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
              }`}
            >
              {minutes % 60 === 0 ? `${minutes / 60} h` : `${minutes} min`}
            </button>
          );
        })}
      </div>

      <div className="grid gap-2 md:grid-cols-5">
        <input
          className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
          type="number"
          min={15}
          max={720}
          step={15}
          value={form.minutes}
          onChange={(e) => updateField("minutes", Number(e.target.value))}
          aria-label="Minutos"
        />

        <select
          className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value as ActivityCategory)}
        >
          {ACTIVITY_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
          value={form.projectId}
          onChange={(e) => updateField("projectId", e.target.value)}
        >
          {projectsMock.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-blue-100 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
          value={form.taskId}
          onChange={(e) => updateField("taskId", e.target.value)}
        >
          <option value="">Tarea (opcional)</option>
          {filteredTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-blue-100 px-3 py-2.5 text-sm text-slate-700 shadow-sm">
          <input type="checkbox" checked={form.planned} onChange={(e) => updateField("planned", e.target.checked)} />
          Planificado
        </label>
      </div>

      <input
        className="w-full rounded-xl border border-blue-100 px-3 py-2.5 text-sm shadow-sm outline-none ring-blue-300 focus:ring-2"
        placeholder="Comentario breve (opcional)"
        maxLength={140}
        value={form.comment}
        onChange={(e) => updateField("comment", e.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
            event.preventDefault();
            void onSubmit();
          }
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button className="w-full rounded-full py-3 text-base md:w-auto md:min-w-56" onClick={onSubmit}>
          {editing ? "Guardar cambios" : "Registrar actividad"}
        </Button>
        {editing && (
          <Button variant="ghost" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-500">Atajo: Ctrl/Cmd + Enter para guardar rápido. Duración en minutos.</p>
    </Card>
  );
};

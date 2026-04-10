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
    <Card className="space-y-3">
      <h2 className="text-sm font-semibold text-slate-700">{editing ? "Editar registro" : "Nuevo registro"}</h2>

      <div className="grid gap-2 md:grid-cols-5">
        <input
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          type="number"
          min={15}
          max={720}
          step={15}
          value={form.minutes}
          onChange={(e) => updateField("minutes", Number(e.target.value))}
        />

        <select
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
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
          className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
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

        <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.planned} onChange={(e) => updateField("planned", e.target.checked)} />
          Planificado
        </label>
      </div>

      <input
        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
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

      <div className="flex gap-2">
        <Button onClick={onSubmit}>{editing ? "Guardar" : "Agregar"}</Button>
        {editing && (
          <Button variant="ghost" onClick={onCancelEdit}>
            Cancelar
          </Button>
        )}
      </div>
      <p className="text-xs text-slate-500">Atajo: Ctrl/Cmd + Enter para guardar rapido.</p>
    </Card>
  );
};

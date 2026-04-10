import type { DayMode, ShiftType, SuggestionItem } from "../../models";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Card } from "../../components/ui/Card";

type Props = {
  mode: DayMode;
  shiftType?: ShiftType;
  suggestions: SuggestionItem[];
  onApplySuggestion: (item: SuggestionItem) => Promise<void>;
  onRepeatPreviousDay: () => Promise<void>;
};

export const QuickActions = ({
  mode,
  shiftType,
  suggestions,
  onApplySuggestion,
  onRepeatPreviousDay
}: Props) => {
  const modeLabel =
    mode === "turno"
      ? shiftType === "tarde"
        ? "Turno tarde 14:00-21:00"
        : "Turno mañana 08:30-17:00"
      : "Horario normal";

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-semibold text-slate-700">Modalidad del día:</span>
        <Badge tone={mode === "turno" ? "warning" : "default"}>{modeLabel}</Badge>
        <span className="text-xs text-slate-500">Asignado por jefatura (solo lectura)</span>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" className="min-w-60 justify-center" onClick={onRepeatPreviousDay}>
          Repetir registros de ayer
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-slate-700">Sugerencias rápidas</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <Button
              key={item.id}
              variant="ghost"
              className="border border-blue-100 bg-blue-50/50 text-slate-700"
              onClick={() => onApplySuggestion(item)}
            >
              + {item.label}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  );
};

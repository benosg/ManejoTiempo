type Row = { label: string; value: number };

export const BarChart = ({ rows }: { rows: Row[] }) => {
  const max = Math.max(...rows.map((item) => item.value), 1);

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.label} className="grid grid-cols-[140px_1fr_60px] items-center gap-2 text-sm">
          <span className="truncate text-slate-600">{row.label}</span>
          <div className="h-3 rounded-full bg-blue-100">
            <div
              className="h-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-400"
              style={{ width: `${(row.value / max) * 100}%` }}
            />
          </div>
          <span className="text-right font-semibold text-slate-700">{(row.value / 60).toFixed(1)}h</span>
        </div>
      ))}
    </div>
  );
};

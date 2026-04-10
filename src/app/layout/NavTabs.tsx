export type AppTab = "diario" | "semanal" | "reportes";

export const NavTabs = ({ tab, onChange }: { tab: AppTab; onChange: (tab: AppTab) => void }) => {
  const base = "text-sm font-semibold transition-colors";
  const active = "text-blue-600 border-b-2 border-blue-600 pb-1";
  const inactive = "text-slate-500 hover:text-blue-600";

  return (
    <div className="flex items-center gap-6">
      <button className={`${base} ${tab === "diario" ? active : inactive}`} onClick={() => onChange("diario")}>
        Diario
      </button>
      <button className={`${base} ${tab === "semanal" ? active : inactive}`} onClick={() => onChange("semanal")}>
        Semanal
      </button>
      <button className={`${base} ${tab === "reportes" ? active : inactive}`} onClick={() => onChange("reportes")}>
        Reportes
      </button>
    </div>
  );
};

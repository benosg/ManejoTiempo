import { Button } from "../../components/ui/Button";

export type AppTab = "diario" | "semanal" | "reportes";

export const NavTabs = ({ tab, onChange }: { tab: AppTab; onChange: (tab: AppTab) => void }) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant={tab === "diario" ? "primary" : "secondary"} onClick={() => onChange("diario")}>Diario</Button>
      <Button variant={tab === "semanal" ? "primary" : "secondary"} onClick={() => onChange("semanal")}>Semanal</Button>
      <Button variant={tab === "reportes" ? "primary" : "secondary"} onClick={() => onChange("reportes")}>Reportes</Button>
    </div>
  );
};

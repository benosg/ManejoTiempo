import { useState } from "react";
import { AppShell } from "./layout/AppShell";
import { NavTabs, type AppTab } from "./layout/NavTabs";
import { currentUserId } from "../mocks/users.mock";
import { DailyPage } from "../features/dashboard/DailyPage";
import { WeeklyPage } from "../features/time-entries/WeeklyPage";
import { ReportsPage } from "../features/reports/ReportsPage";

export const App = () => {
  const [tab, setTab] = useState<AppTab>("diario");

  return (
    <AppShell>
      <div className="mb-4 space-y-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Time Visibility MVP</h1>
          <p className="text-sm text-slate-600">
            El sistema ayuda a entender la carga de trabajo real del equipo, no se transforma en una herramienta de vigilancia.
          </p>
        </div>
        <NavTabs tab={tab} onChange={setTab} />
      </div>

      {tab === "diario" && <DailyPage userId={currentUserId} />}
      {tab === "semanal" && <WeeklyPage userId={currentUserId} />}
      {tab === "reportes" && <ReportsPage userId={currentUserId} />}
    </AppShell>
  );
};

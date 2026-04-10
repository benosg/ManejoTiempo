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
    <>
      <nav className="fixed left-0 right-0 top-0 z-40 border-b border-blue-100 bg-white/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <div className="font-[Manrope] text-xl font-extrabold tracking-tight text-slate-900">ManejoTiempo</div>
          <NavTabs tab={tab} onChange={setTab} />
          <div className="flex items-center gap-3 text-slate-500">
            <span className="hidden text-xs font-medium md:inline">Equipo de desarrollo</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">BR</div>
          </div>
        </div>
      </nav>

      <AppShell>
        <div className="mb-6">
          <p className="text-sm text-slate-600">
            Registra tu jornada en pocos pasos y mantén tus avances al día.
          </p>
        </div>

        {tab === "diario" && <DailyPage userId={currentUserId} />}
        {tab === "semanal" && <WeeklyPage userId={currentUserId} />}
        {tab === "reportes" && <ReportsPage userId={currentUserId} />}
      </AppShell>
    </>
  );
};

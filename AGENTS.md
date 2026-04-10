# AGENTS

## Repo Reality (read first)
- Single-package Vite app (not a monorepo).
- Stack is fixed: React + TypeScript + Tailwind v4 via `@tailwindcss/vite`.
- There is no backend and no database; app state is mocked in-memory.
- There are no test/lint scripts configured. The reliable verification command is `npm run build`.

## Commands that matter
- Install deps: `npm install`
- Run locally: `npm run dev`
- Production build/typecheck gate: `npm run build`
- Preview build: `npm run preview`

Use `npm run build` before committing; it is the only enforced quality gate in this repo.

## App wiring (high-signal map)
- Entry point: `src/main.tsx`
- Root UI shell + tab routing: `src/app/App.tsx`
- Main product screens:
  - Diario: `src/features/dashboard/DailyPage.tsx`
  - Semanal: `src/features/time-entries/WeeklyPage.tsx`
  - Reportes: `src/features/reports/ReportsPage.tsx`
- Shared state hook (client-side): `src/hooks/useTimeEntries.ts`
- Service container (singletons): `src/services/container.ts`

## Data + persistence gotchas
- Time entries are stored in module-level memory in `src/services/timeEntries.service.mock.ts` (`entriesStore`).
- Workday mode/shift config is also module-level memory in `src/services/workDayConfig.service.mock.ts` (`Map`).
- Refreshing the page resets in-memory state to mocks.
- `src/mocks/timeEntries.mock.ts` currently starts empty; if totals look “wrong,” check seed data first.

## Calendar/holiday behavior
- Holiday lookup uses external API first (`NagerDateHolidayProvider`) and falls back to local mock holidays.
- Provider wiring is in `src/services/holiday.providers.ts` and `src/services/container.ts`.
- Weekly expected-hours logic depends on day mode/shift + holiday/weekend context (do not revert to fixed "normal").

## UX/business constraints already encoded
- UI copy is Spanish and user-facing; avoid internal/policy wording in visible text.
- Turno is treated as assigned context (not user-controlled in daily flow UI).
- Editing flow is intentionally explicit: selected row highlight + “modo edición” block + scroll to form.

## Deployment notes
- Vercel project is already linked (`.vercel/project.json` exists).
- Deploy command used in this repo: `npx vercel --prod --yes`.

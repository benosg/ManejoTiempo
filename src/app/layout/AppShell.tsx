import type { ReactNode } from "react";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto min-h-screen max-w-6xl px-4 py-6">{children}</div>;
};

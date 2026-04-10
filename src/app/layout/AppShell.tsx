import type { ReactNode } from "react";

export const AppShell = ({ children }: { children: ReactNode }) => {
  return <div className="mx-auto min-h-screen max-w-6xl px-4 pb-8 pt-24 md:px-6">{children}</div>;
};

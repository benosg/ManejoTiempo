import type { ReactNode } from "react";

export const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => {
  return (
    <section className={`rounded-2xl border border-blue-100/60 bg-white/95 p-4 shadow-[0_8px_24px_rgba(30,64,175,0.08)] ${className}`}>
      {children}
    </section>
  );
};

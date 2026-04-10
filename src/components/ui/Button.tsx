import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = ({ variant = "primary", className = "", ...props }: Props) => {
  const base = "rounded-xl px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60";
  const color =
    variant === "primary"
      ? "bg-blue-600 text-white hover:bg-blue-700"
      : variant === "secondary"
      ? "bg-slate-200 text-slate-800 hover:bg-slate-300"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-transparent text-slate-700 hover:bg-slate-100";
  return <button className={`${base} ${color} ${className}`} {...props} />;
};

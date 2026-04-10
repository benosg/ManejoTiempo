import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
};

export const Button = ({ variant = "primary", className = "", ...props }: Props) => {
  const base =
    "rounded-xl px-3 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60 active:scale-[0.99]";
  const color =
    variant === "primary"
      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-sm hover:opacity-95"
      : variant === "secondary"
      ? "bg-blue-50 text-blue-800 hover:bg-blue-100"
      : variant === "danger"
      ? "bg-red-600 text-white hover:bg-red-700"
      : "bg-transparent text-slate-700 hover:bg-blue-50";
  return <button className={`${base} ${color} ${className}`} {...props} />;
};

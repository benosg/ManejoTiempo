type Props = {
  message: string;
  tone?: "info" | "success";
  actionLabel?: string;
  onAction?: () => void;
};

export const Toast = ({ message, tone = "info", actionLabel, onAction }: Props) => {
  const toneClass = tone === "success" ? "bg-emerald-600" : "bg-slate-800";

  return (
    <div
      className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm text-white shadow-lg ${toneClass}`}
    >
      <span className="flex-1">{message}</span>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="rounded-lg bg-white/20 px-2 py-1 text-xs font-semibold hover:bg-white/30"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

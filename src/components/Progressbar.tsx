interface ProgressBarProps {
  progress: number;
}

function getBarColor(progress: number) {
  if (progress === 100) return "bg-emerald-500";
  if (progress >= 75) return "bg-blue-500";
  if (progress >= 50) return "bg-cyan-500";
  if (progress >= 25) return "bg-amber-500";
  return "bg-zinc-600";
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className="flex items-center gap-3 w-full min-w-[180px]">
      <div className="flex-1 min-w-0 h-2 rounded-full bg-zinc-700/80 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor(progress)}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      <span className="text-xs font-medium tabular-nums text-zinc-500 shrink-0 w-10 text-right">
        {progress.toFixed(0)}%
      </span>
    </div>
  );
}

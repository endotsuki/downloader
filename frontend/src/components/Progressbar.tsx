interface ProgressBarProps {
  progress: number;
}

export function ProgressBar({ progress }: ProgressBarProps) {
  const getProgressColor = () => {
    if (progress === 100) return "bg-emerald-500";
    if (progress >= 75) return "bg-blue-500";
    if (progress >= 50) return "bg-cyan-500";
    if (progress >= 25) return "bg-amber-500";
    return "bg-gray-500";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 max-w-[200px]">
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          {/* Background glow */}
          <div
            className={`absolute inset-0 ${getProgressColor()} opacity-20 blur-sm transition-all duration-300`}
            style={{ width: `${progress.toFixed(1)}%` }}
          />

          {/* Progress bar */}
          <div
            className={`relative h-full ${getProgressColor()} rounded-full transition-all duration-300 shadow-lg`}
            style={{ width: `${progress.toFixed(1)}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </div>
        </div>
      </div>

      <div className="text-xs text-gray-400 min-w-[45px] text-right font-medium tabular-nums">
        {progress.toFixed(1)}%
      </div>
    </div>
  );
}

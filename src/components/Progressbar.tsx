interface ProgressBarProps {
  progress: number;
}

function getBarColor(progress: number) {
  if (progress === 100) return 'bg-emerald-500';
  if (progress >= 75) return 'bg-blue-500';
  if (progress >= 50) return 'bg-cyan-500';
  if (progress >= 25) return 'bg-amber-500';
  return 'bg-zinc-600';
}

export function ProgressBar({ progress }: ProgressBarProps) {
  return (
    <div className='flex w-full min-w-[180px] items-center gap-3'>
      <div className='h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-zinc-700/80'>
        <div
          className={`h-full rounded-full transition-all duration-300 ${getBarColor(progress)}`}
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
    </div>
  );
}

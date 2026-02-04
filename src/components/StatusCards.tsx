interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}

interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}
export function StatsCards({ total, completed, downloading, queued }: StatsCardsProps) {
  const stats = [
    { label: 'Total', value: total, color: 'text-zinc-100', ring: 'ring-zinc-500/20' },
    { label: 'Completed', value: completed, color: 'text-green-400', ring: 'ring-green-500/20' },
    { label: 'Downloading', value: downloading, color: 'text-blue-400', ring: 'ring-blue-500/20' },
    { label: 'Queued', value: queued, color: 'text-amber-400', ring: 'ring-amber-500/20' },
    { label: 'Failed', value: total - completed - downloading - queued, color: 'text-red-400', ring: 'ring-red-500/20' },
  ];

  return (
    <div className='mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`group relative rounded-2xl bg-zinc-900/40 p-6 ring-1 ${stat.ring} backdrop-blur-sm transition-all hover:border-zinc-700 hover:bg-zinc-800/50 hover:ring-4`}
        >
          <div className='mb-1 text-xs font-semibold uppercase tracking-wider text-zinc-500'>{stat.label}</div>
          <div className={`text-5xl font-bold tabular-nums ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}

export function StatsCards({ total, completed, downloading, queued }: StatsCardsProps) {
  const stats = [
    {
      label: 'Total',
      value: total,
      color: 'text-white',
      bgColor: 'bg-white/5',
    },
    {
      label: 'Completed',
      value: completed,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Downloading',
      value: downloading,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      label: 'Queued',
      value: queued,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      label: 'Failed',
      value: total - completed - downloading - queued,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <div className='mb-6 grid grid-cols-2 gap-3 md:grid-cols-5'>
      {stats.map((stat) => (
        <div
          key={stat.label}
          className='group rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all hover:bg-white/10'
        >
          <div className={`text-6xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
          <div className='text-sm text-gray-400'>{stat.label}</div>
          <div className={`mt-2 h-1 ${stat.bgColor} overflow-hidden rounded-full`}>
            <div className={`h-full ${stat.color.replace('text', 'bg')} opacity-60 transition-opacity group-hover:opacity-100`} />
          </div>
        </div>
      ))}
    </div>
  );
}

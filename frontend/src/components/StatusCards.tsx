interface StatsCardsProps {
  total: number;
  completed: number;
  downloading: number;
  queued: number;
}

export function StatsCards({
  total,
  completed,
  downloading,
  queued,
}: StatsCardsProps) {
  const stats = [
    {
      label: "Total",
      value: total,
      color: "text-white",
      bgColor: "bg-white/5",
    },
    {
      label: "Completed",
      value: completed,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Downloading",
      value: downloading,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Queued",
      value: queued,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
    },
    {
      label: "Failed",
      value: total - completed - downloading - queued,
      color: "text-red-400",
      bgColor: "bg-red-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 hover:bg-white/10 transition-all group"
        >
          <div className={`text-6xl font-bold ${stat.color} mb-1`}>
            {stat.value}
          </div>
          <div className="text-sm text-gray-400">{stat.label}</div>
          <div
            className={`mt-2 h-1 ${stat.bgColor} rounded-full overflow-hidden`}
          >
            <div
              className={`h-full ${stat.color.replace("text", "bg")} opacity-60 group-hover:opacity-100 transition-opacity`}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

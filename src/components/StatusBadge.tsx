import {
  AnonymousIcon,
  Cancel01Icon,
  Loading03Icon,
  HourglassIcon,
  Link05Icon,
  Rocket01Icon,
  Tick02Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';

interface StatusBadgeProps {
  status: string;
  icon?: React.ReactNode;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const getStatusStyle = (status: string) => {
    const statusLower = status.toLowerCase();

    switch (statusLower) {
      case 'queued':
        return {
          bg: 'bg-gray-500/20',
          text: 'text-gray-300',
          border: 'border-gray-500/30',
          icon: HourglassIcon,
        };
      case 'starting':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-300',
          border: 'border-blue-500/30',
          icon: Rocket01Icon,
        };
      case 'downloading':
        return {
          bg: 'bg-blue-500/20',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          icon: Loading03Icon,
        };
      case 'merging':
        return {
          bg: 'bg-cyan-500/20',
          text: 'text-cyan-300',
          border: 'border-cyan-500/30',
          icon: Link05Icon,
        };
      case 'completed':
        return {
          bg: 'bg-emerald-500/20',
          text: 'text-emerald-300',
          border: 'border-emerald-500/30',
          icon: Tick02Icon,
        };
      case 'error':
        return {
          bg: 'bg-red-500/20',
          text: 'text-red-300',
          border: 'border-red-500/30',
          icon: Cancel01Icon,
        };
      default:
        return {
          bg: 'bg-white/10',
          text: 'text-gray-300',
          border: 'border-white/20',
          icon: AnonymousIcon,
        };
    }
  };

  const style = getStatusStyle(status);

  const isDownloading = status.toLowerCase() === 'downloading';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium ${style.bg} ${style.text} ${style.border} backdrop-blur-sm`}
    >
      {isDownloading ? (
        <div className='h-4 w-4 animate-spin rounded-full border-2 border-blue-400/20 border-t-blue-400'></div>
      ) : (
        <HugeiconsIcon icon={style.icon} size={16} />
      )}
      {status}
    </span>
  );
}

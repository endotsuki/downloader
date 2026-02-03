import type { DownloadItem } from './App';
import { ProgressBar } from './Progressbar';

interface DownloadCardProps {
  item: DownloadItem;
  isCompleted?: boolean;
}

export function DownloadCard({ item, isCompleted = false }: DownloadCardProps) {
  const getDownloadSpeed = () => {
    // Mock speed for UI - in real app this would come from API
    if (item.status === 'Downloading') {
      // Use item ID to generate consistent speed per item
      const speed = ((item.id % 15) / 10 + 0.5).toFixed(1);
      return `${speed}MB/S`;
    }
    if (item.status === 'Queued' || item.status === 'Starting') {
      return 'Waiting...';
    }
    return '';
  };

  const displayTitle = item.filename || item.url.split('/').pop() || item.url;
  // Truncate title to fit mobile UI better
  const truncatedTitle = displayTitle.length > 35 ? displayTitle.substring(0, 35) + '...' : displayTitle;

  return (
    <div className='flex items-center gap-3 rounded-lg bg-zinc-800/40 p-3 transition-colors active:bg-zinc-800/60'>
      {/* Thumbnail Placeholder */}
      <div className='flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-700/60'>
        
      </div>

      {/* Content */}
      <div className='min-w-0 flex-1'>
        {/* Title */}
        <p className='mb-2 line-clamp-2 text-sm font-medium leading-tight text-white'>{truncatedTitle}</p>

        {!isCompleted ? (
          <>
            {/* Progress Bar */}
            <div className='mb-1.5'>
              <ProgressBar progress={item.progress ?? 0} />
            </div>
            {/* Speed and Percentage */}
            <div className='flex items-center justify-between text-xs text-zinc-400'>
              <span>{getDownloadSpeed()}</span>
              <span>{item.progress?.toFixed(1) || '0.0'}%</span>
            </div>
          </>
        ) : (
          <div className='flex items-center gap-2 text-xs text-zinc-400'>
            <svg width='14' height='14' viewBox='0 0 24 24' fill='none'>
              <path d='M8 5v14l11-7z' fill='currentColor' />
            </svg>
            <span>{item.size || 'Completed'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

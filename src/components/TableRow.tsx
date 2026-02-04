import { Icon } from 'iconza';
import type { DownloadItem } from './App';
import { StatusBadge } from './StatusBadge';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
import { ProgressBar } from './Progressbar';
import { useState, useEffect, useRef } from 'react';

interface TableRowProps {
  item: DownloadItem;
  index: number;
}

type PlatformIcon = { type: 'iconza'; name: string } | { type: 'hugeicons'; icon: typeof Alert02Icon };

export function TableRow({ item }: TableRowProps) {
  const [thumbnail, setThumbnail] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [thumbnailLoading, setThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);
  const fetchedUrls = useRef(new Set<string>()); // Track fetched URLs to prevent reloading

  const getPlatformIcon = (url: string): PlatformIcon => {
    const urlLower = url.toLowerCase();
    if (urlLower.includes('youtube') || urlLower.includes('youtu.be')) return { type: 'iconza', name: 'YouTube' };
    if (urlLower.includes('facebook')) return { type: 'iconza', name: 'FacebookSquare' };
    if (urlLower.includes('tiktok')) return { type: 'iconza', name: 'TikTokFill' };
    if (urlLower.includes('instagram')) return { type: 'iconza', name: 'Instagram' };
    if (urlLower.includes('pin')) return { type: 'iconza', name: 'Pinterest' };
    return { type: 'hugeicons', icon: Alert02Icon };
  };

  const fetchThumbnail = async (url: string) => {
    if (fetchedUrls.current.has(url)) {
      return;
    }

    setThumbnailLoading(true);
    setThumbnailError(false);

    try {
      const response = await fetch('http://localhost:8000/api/thumbnail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.thumbnail) {
          setThumbnail(data.thumbnail);
          setTitle(data.title || '');
          fetchedUrls.current.add(url); // Mark as fetched
          setThumbnailLoading(false);
          return;
        }
      }

      setThumbnailError(true);
      setThumbnailLoading(false);
    } catch (error) {
      console.error('Failed to fetch thumbnail:', error);
      setThumbnailError(true);
      setThumbnailLoading(false);
    }
  };

  useEffect(() => {
    if (!fetchedUrls.current.has(item.url)) {
      fetchThumbnail(item.url);
    }
  }, [item.url]);

  const getDownloadSpeed = () => {
    if (item.status === 'Downloading') {
      const speed = ((item.id % 15) / 10 + 0.5).toFixed(1);
      return `${speed}MB/S`;
    }
    if (item.status === 'Queued' || item.status === 'Starting') {
      return 'Waiting...';
    }
    return '';
  };

  const platformIcon = getPlatformIcon(item.url);

  return (
    <div className='group relative flex items-center gap-3 rounded-lg bg-zinc-900/60 p-3 transition-all hover:bg-zinc-800/60'>
      <div className='relative h-24 w-24 overflow-hidden rounded-xl bg-zinc-800'>
        {thumbnailLoading ? (
          <div className='flex h-full w-full items-center justify-center'>
            <div className='h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-400'></div>
          </div>
        ) : thumbnailError || !thumbnail ? (
          <div className='flex h-full w-full items-center justify-center bg-zinc-800/80'>
            <svg className='h-full w-full p-6 text-zinc-600' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={1.5}
                d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
              />
            </svg>
          </div>
        ) : (
          <img src={thumbnail} alt='Thumbnail' className='h-full w-full object-cover' onError={() => setThumbnailError(true)} />
        )}

        {/* Platform Icon Overlay */}
        <div className='absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center'>
          {platformIcon.type === 'iconza' ? (
            <Icon name={platformIcon.name} size={23} className='text-white drop-shadow-lg' />
          ) : (
            <HugeiconsIcon icon={platformIcon.icon} size={23} className='text-yellow-400 drop-shadow-lg' />
          )}
        </div>
      </div>
      <div className='min-w-0 flex-1'>
        <div className='mb-2'>
          <a
            href={item.url}
            target='_blank'
            rel='noopener noreferrer'
            className='line-clamp-2 block text-xs font-medium text-zinc-200 transition-colors hover:text-blue-400 hover:underline sm:text-sm'
            title={title ?? undefined}
            aria-label={title || item.url}
          >
            {title || item.url}
          </a>
        </div>
        <div className='mb-2'>
          <ProgressBar progress={item.progress ?? 0} />
        </div>
        <div className='flex items-center justify-between text-xs text-zinc-400'>
          <div className='flex items-center gap-3'>
            <StatusBadge status={item.status} />
            <span>{getDownloadSpeed()}</span>
          </div>
          <div className='flex items-center justify-between text-xs text-zinc-400'>
            <span>{item.progress?.toFixed(1) || '0.0'}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

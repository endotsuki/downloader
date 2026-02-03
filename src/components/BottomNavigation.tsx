import { HugeiconsIcon } from '@hugeicons/react';
import { Playlist01Icon, Search01Icon, Settings01Icon } from '@hugeicons/core-free-icons';

export function BottomNavigation() {
  return (
    <div className='fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur-sm md:hidden'>
      <div className='flex items-center justify-around px-4 py-3'>
        {/* Download Tab - Active */}
        <button className='flex flex-col items-center gap-1 text-blue-400'>
          <HugeiconsIcon icon={Search01Icon} size={24} />
          <span className='text-xs font-medium'>Download</span>
        </button>

        {/* Play Tab */}
        <button className='flex flex-col items-center gap-1 text-zinc-400 transition-colors active:text-zinc-300'>
          <HugeiconsIcon icon={Playlist01Icon} size={24} />
          <span className='text-xs font-medium'>Play</span>
        </button>

        {/* Settings Tab */}
        <button className='flex flex-col items-center gap-1 text-zinc-400 transition-colors active:text-zinc-300'>
          <HugeiconsIcon icon={Settings01Icon} size={24} />
          <span className='text-xs font-medium'>Settings</span>
        </button>
      </div>
    </div>
  );
}

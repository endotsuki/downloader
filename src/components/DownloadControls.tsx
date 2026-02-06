import { type RefObject } from 'react';
import { Button } from '../ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon, Download01Icon, Download05Icon, Folder01Icon, Task02Icon } from '@hugeicons/core-free-icons';
import { AnimatePresence, motion } from 'framer-motion';

interface DownloadControlsProps {
  videoLink: string;
  setVideoLink: (value: string) => void;
  selectedDirectory: FileSystemDirectoryHandle | null;
  setSelectedDirectory: (handle: FileSystemDirectoryHandle | null) => void;
  queueSingle: () => void;
  uploadList: () => void;
  fileInputRef: RefObject<HTMLInputElement>;
}

const inputBase =
  'w-full rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-colors focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20';

export function DownloadControls({
  videoLink,
  setVideoLink,
  selectedDirectory,
  setSelectedDirectory,
  queueSingle,
  uploadList,
  fileInputRef,
}: DownloadControlsProps) {
  const handleSelectDirectory = async () => {
    if (!('showDirectoryPicker' in window)) {
      alert('Directory picker is not supported in this browser. Please use Chrome, Edge, or Opera.');
      return;
    }

    try {
      const directoryHandle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
      setSelectedDirectory(directoryHandle);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting directory:', error);
        alert('Failed to select directory. Please try again.');
      }
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setVideoLink(text);
    } catch (error) {
      console.error('Failed to read clipboard:', error);
    }
  };

  return (
    <div className='space-y-6'>
      {/* Primary: URL + Download */}
      <div>
        <label className='mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500'>Single URL</label>
        <div className='relative flex flex-col gap-2 sm:flex-row sm:gap-3'>
          <div className='relative flex-1'>
            <input
              className={`w-full min-w-0 pr-11 ${inputBase}`}
              type='text'
              placeholder='Paste video URL…'
              value={videoLink}
              onChange={(e) => setVideoLink(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && queueSingle()}
            />
            <div className='pointer-events-none absolute right-10 top-1/2 h-6 w-px -translate-y-1/2 bg-zinc-700/80' />
            <Button variant='ghost' size='icon' onClick={handlePasteFromClipboard} className='absolute right-1 top-1/2 -translate-y-1/2'>
              <HugeiconsIcon icon={Task02Icon} size={20} />
            </Button>
          </div>

          <Button variant='on-hold' onClick={queueSingle} className='shrink-0 sm:w-auto'>
            <HugeiconsIcon icon={Download01Icon} size={20} />
            Download
          </Button>
        </div>
      </div>

      {/* Secondary: Folder, Batch, Clear */}
      <div className='flex flex-col gap-4 border-t border-zinc-800/80 py-9 sm:flex-row sm:items-center'>
        <motion.div layout className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3'>
          <span className='shrink-0 text-xs font-semibold uppercase tracking-wider text-zinc-500'>Save to</span>

          <motion.div layout className='flex min-w-0 flex-1 flex-col gap-2 sm:flex-row'>
            {/* Display / Picker */}
            <motion.button
              layout
              type='button'
              onClick={handleSelectDirectory}
              className={`flex min-h-[40px] min-w-0 flex-1 items-center ${inputBase} cursor-pointer`}
            >
              <AnimatePresence mode='popLayout'>
                {selectedDirectory ? (
                  <motion.span
                    key='selected'
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className='flex min-w-0 items-center truncate text-zinc-400'
                  >
                    <HugeiconsIcon icon={Folder01Icon} size={20} className='mr-1 fill-yellow-500 text-transparent' />
                    {selectedDirectory.name}
                  </motion.span>
                ) : (
                  <motion.span
                    key='default'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='text-zinc-400'
                  >
                    Browser default
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Actions */}
            <AnimatePresence>
              {selectedDirectory && (
                <motion.button
                  key='clear'
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={() => setSelectedDirectory(null)}
                  className='flex h-[40px] items-center gap-1 rounded-md px-3 text-zinc-500 hover:text-red-400'
                >
                  <HugeiconsIcon icon={Delete01Icon} size={20} />
                  Clear
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>

        <div className='hidden h-8 w-px shrink-0 bg-zinc-700/80 sm:block' />
        <div className='flex flex-wrap items-center gap-2'>
          <input ref={fileInputRef} type='file' accept='.txt' className='hidden' id='batch-file' onChange={uploadList} />
          <Button variant='archived'>
            <label htmlFor='batch-file' className='inline-flex cursor-pointer items-center justify-center gap-2'>
              <HugeiconsIcon icon={Download05Icon} size={20} />
              Batch link .txt
            </label>
          </Button>
        </div>
      </div>
    </div>
  );
}

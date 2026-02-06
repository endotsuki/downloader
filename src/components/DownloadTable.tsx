import { TableRow } from './TableRow';
import { TablePagination } from './TablePagination';
import type { DownloadItem } from './App';
import { Delete01Icon, Download04Icon } from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import { Button } from '../ui/button';

interface DownloadTableProps {
  queue: DownloadItem[];
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  clearDownloads: () => void;
}

export function DownloadTable({ queue, currentPage, rowsPerPage, setCurrentPage, setRowsPerPage, clearDownloads }: DownloadTableProps) {
  const paginate = (arr: DownloadItem[]) => {
    const start = (currentPage - 1) * rowsPerPage;
    return arr.slice(start, start + rowsPerPage);
  };

  const totalPages = Math.max(1, Math.ceil(queue.length / rowsPerPage));
  const paginated = paginate(queue);

  return (
    <div className='space-y-4'>
      {/* delete video */}
      <div className='flex justify-end'>
        <Button variant='ghost' onClick={clearDownloads} size='icon' className='text-zinc-500 hover:bg-red-500/20 hover:text-red-500'>
          <HugeiconsIcon icon={Delete01Icon} size={20} />
        </Button>
      </div>
      <>
        {paginated.length === 0 ? (
          <div className='flex flex-col items-center gap-3 py-16'>
            <div className='flex h-20 w-20 items-center justify-center rounded-full bg-zinc-700/60 text-zinc-500'>
              <HugeiconsIcon icon={Download04Icon} size={40} strokeWidth={1} />
            </div>
            <div className='text-center'>
              <p className='font-medium text-zinc-300'>No downloads yet</p>
              <p className='mt-0.5 text-sm text-zinc-500'>Paste a URL above to start</p>
            </div>
          </div>
        ) : (
          paginated.map((item) => <TableRow key={item.id} item={item} index={0} />)
        )}
      </>

      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        rowsPerPage={rowsPerPage}
        setCurrentPage={setCurrentPage}
        setRowsPerPage={setRowsPerPage}
        totalItems={queue.length}
      />
    </div>
  );
}

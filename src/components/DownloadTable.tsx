import { TableRow } from "./TableRow";
import { TablePagination } from "./TablePagination";
import type { DownloadItem } from "./App";
import { Download01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface DownloadTableProps {
  queue: DownloadItem[];
  currentPage: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
}

export function DownloadTable({
  queue,
  currentPage,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
}: DownloadTableProps) {
  const paginate = (arr: DownloadItem[]) => {
    const start = (currentPage - 1) * rowsPerPage;
    return arr.slice(start, start + rowsPerPage);
  };

  const totalPages = Math.max(1, Math.ceil(queue.length / rowsPerPage));

  return (
    <div className="space-y-4">
      {/* Table Container with Shadow */}
      <div className="rounded-2xl border border-white/10 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[860px]">
            {/* Table Header */}
            <thead>
              <tr className="bg-gradient-to-r from-white/10 via-white/5 to-white/10 backdrop-blur-xl">
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-300 p-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg text-[10px]">
                      #
                    </span>
                    ID
                  </div>
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-300 p-4 border-b border-white/10">
                  Platform
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-300 p-4 border-b border-white/10">
                  URL
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-300 p-4 border-b border-white/10">
                  Progress
                </th>
                <th className="text-left text-xs font-semibold uppercase tracking-wider text-gray-300 p-4 border-b border-white/10">
                  Status
                </th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="bg-white/[0.02] backdrop-blur-xl divide-y divide-white/5">
              {paginate(queue).length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-12 text-center text-gray-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center">
                        <HugeiconsIcon icon={Download01Icon} size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-white mb-1">
                          No downloads yet
                        </p>
                        <p className="text-sm text-gray-500">
                          Paste a URL above to start downloading
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginate(queue).map((item: DownloadItem, idx: number) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    index={idx + 1 + (currentPage - 1) * rowsPerPage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
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

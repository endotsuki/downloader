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
  const paginated = paginate(queue);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800/80 overflow-hidden bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table
            className="w-full border-collapse table-fixed"
            style={{ minWidth: 920 }}
          >
            <colgroup>
              <col style={{ width: "48px" }} />
              <col style={{ width: "72px" }} />
              <col style={{ width: "42%" }} />
              <col style={{ width: "260px" }} />
              <col style={{ width: "112px" }} />
            </colgroup>
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-800/60">
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-3.5 px-4">
                  #
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-3.5 px-4">
                  Platform
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-3.5 px-4">
                  URL
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-3.5 px-4">
                  Progress
                </th>
                <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-zinc-500 py-3.5 px-4">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 px-4 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-700/60 text-zinc-500">
                        <HugeiconsIcon icon={Download01Icon} size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-300">
                          No downloads yet
                        </p>
                        <p className="mt-0.5 text-sm text-zinc-500">
                          Paste a URL above to start
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((item, idx) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    index={idx + (currentPage - 1) * rowsPerPage}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

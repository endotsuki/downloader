import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  rowsPerPage: number;
  setCurrentPage: (page: number) => void;
  setRowsPerPage: (rows: number) => void;
  totalItems: number;
}

export function TablePagination({
  currentPage,
  totalPages,
  rowsPerPage,
  setCurrentPage,
  setRowsPerPage,
  totalItems,
}: TablePaginationProps) {
  const handleRowsChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1);
  };

  const startItem = (currentPage - 1) * rowsPerPage + 1;
  const endItem = Math.min(currentPage * rowsPerPage, totalItems);

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="archived" className="gap-2 text-zinc-400">
              Show <span className="font-semibold text-zinc-200">{rowsPerPage}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-36">
            <DropdownMenuLabel className="text-zinc-500">Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[25, 50, 100, 200].map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => handleRowsChange(value)}
                className="flex justify-between"
              >
                {value}
                {rowsPerPage === value && <span className="text-emerald-400">✓</span>}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="text-sm text-zinc-500 hidden sm:inline">
          {totalItems > 0 ? (
            <>
              <span className="text-zinc-400">{startItem}</span>–<span className="text-zinc-400">{endItem}</span> of{" "}
              <span className="text-zinc-400 font-medium">{totalItems}</span>
            </>
          ) : (
            "No items"
          )}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="archived"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-3"
        >
          <HugeiconsIcon size={16} icon={ArrowLeft01Icon} />
          <span className="hidden sm:inline ml-1">Previous</span>
        </Button>
        <div className="flex h-9 items-center gap-1.5 rounded-lg border border-zinc-700/80 bg-zinc-800/50 px-3 text-sm">
          <span className="text-zinc-500">Page</span>
          <span className="font-medium text-zinc-200">{currentPage}</span>
          <span className="text-zinc-500">/</span>
          <span className="font-medium text-zinc-400">{totalPages}</span>
        </div>
        <Button
          variant="archived"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-3"
        >
          <span className="hidden sm:inline mr-1">Next</span>
          <HugeiconsIcon size={16} icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  );
}

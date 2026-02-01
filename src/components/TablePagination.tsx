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
    <div className="flex gap-4 items-center justify-between flex-wrap">
      {/* Rows per page selector */}
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="design-review" className="gap-2">
              <span className="text-gray-400">Show:</span>
              <span className="font-semibold">{rowsPerPage}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            <DropdownMenuLabel>Rows per page</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {[25, 50, 100, 200].map((value) => (
              <DropdownMenuItem
                key={value}
                onClick={() => handleRowsChange(value)}
                className="flex justify-between"
              >
                {value}
                {rowsPerPage === value && (
                  <span className="text-emerald-400">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Items info */}
        <span className="text-sm text-gray-400 hidden sm:block">
          {totalItems > 0 ? (
            <>
              Showing{" "}
              <span className="text-white font-medium">{startItem}</span> to{" "}
              <span className="text-white font-medium">{endItem}</span> of{" "}
              <span className="text-white font-medium">{totalItems}</span> items
            </>
          ) : (
            "No items"
          )}
        </span>
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <Button
          variant="archived"
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-3"
        >
          <HugeiconsIcon size={16} icon={ArrowLeft01Icon} />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        <div className="flex items-center gap-1 p-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
          <span className="text-sm text-gray-400">Page</span>
          <span className="text-sm text-blue-500 font-semibold mx-1">
            {currentPage}
          </span>
          <span className="text-sm text-gray-400">of</span>
          <span className="text-sm text-white font-semibold ml-1">
            {totalPages}
          </span>
        </div>

        <Button
          variant="archived"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-3"
        >
          <span className="hidden sm:inline">Next</span>
          <HugeiconsIcon size={16} icon={ArrowRight01Icon} />
        </Button>
      </div>
    </div>
  );
}

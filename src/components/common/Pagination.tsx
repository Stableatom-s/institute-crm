import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const formattedCurrent = currentPage < 10 ? `0${currentPage}` : `${currentPage}`;
  const formattedTotal = totalPages < 10 ? `0${totalPages}` : `${totalPages}`;

  return (
    <div className="flex items-center justify-end gap-3 pt-6 text-xs text-slate-500 font-medium select-none">
      <div className="flex items-center gap-2">
        <span>Jump to</span>
        <input
          type="text"
          value={formattedCurrent}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val >= 1 && val <= totalPages) {
              onPageChange(val);
            }
          }}
          className="w-10 h-7 text-center border border-slate-200 rounded-md text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-amber-400"
        />
      </div>

      <button
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous Page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      <span className="font-semibold text-slate-700">
        {formattedCurrent} of {formattedTotal}
      </span>

      <button
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="p-1 rounded text-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next Page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};
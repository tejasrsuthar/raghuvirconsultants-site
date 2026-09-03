import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Hash } from 'lucide-react';

export default function NumberedPagination({ currentPage, totalPages, totalItems, onPageChange }) {
  const [jumpPage, setJumpPage] = useState('');

  if (totalPages <= 1 && totalItems <= 10) return null;

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const p = parseInt(jumpPage, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      onPageChange(p);
      setJumpPage('');
    }
  };

  // Generate page numbers range
  const getPageNumbers = () => {
    const pages = [];
    const delta = 2; // range around current page
    const left = currentPage - delta;
    const right = currentPage + delta + 1;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= left && i < right)) {
        pages.push(i);
      } else if (pages[pages.length - 1] !== '...') {
        pages.push('...');
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-gray-100 text-xs font-sans">
      {/* Total Items Info */}
      <div className="text-gray-500 font-medium">
        Showing Page <span className="font-bold text-gray-900">{currentPage}</span> of{' '}
        <span className="font-bold text-gray-900">{totalPages}</span> ({totalItems || 0} total records)
      </div>

      {/* Page Numbers & Jump Control */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Number Buttons */}
        {getPageNumbers().map((num, idx) => {
          if (num === '...') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 font-bold">
                ...
              </span>
            );
          }
          return (
            <button
              key={num}
              onClick={() => onPageChange(num)}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                currentPage === num
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200/80'
              }`}
            >
              {num}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Direct Page Jump Box */}
        {totalPages > 3 && (
          <form onSubmit={handleJumpSubmit} className="flex items-center gap-1.5 ml-2 pl-2 border-l border-gray-200">
            <span className="text-[11px] text-gray-400 font-medium">Jump to:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              placeholder="#"
              value={jumpPage}
              onChange={(e) => setJumpPage(e.target.value)}
              className="w-12 px-2 py-1 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-center focus:outline-none focus:border-gray-400"
            />
            <button
              type="submit"
              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-[11px] transition-colors"
            >
              Go
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

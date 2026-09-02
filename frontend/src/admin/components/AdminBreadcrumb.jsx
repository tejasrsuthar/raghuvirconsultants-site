import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export default function AdminBreadcrumb({ items = [], onNavigateHome }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-2 text-xs font-medium text-gray-500">
      <button
        type="button"
        onClick={onNavigateHome}
        className="flex items-center gap-1.5 hover:text-gray-900 transition-colors text-gray-500 font-semibold cursor-pointer"
        aria-label="Console Dashboard"
      >
        <Home className="w-3.5 h-3.5" />
        <span>Console</span>
      </button>

      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={idx}>
            <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
            {isLast || !item.onClick ? (
              <span className="text-gray-900 font-bold truncate max-w-[240px] sm:max-w-none" aria-current="page">
                {item.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={item.onClick}
                className="hover:text-gray-900 transition-colors text-gray-600 font-medium truncate max-w-[180px] sm:max-w-none cursor-pointer"
              >
                {item.label}
              </button>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

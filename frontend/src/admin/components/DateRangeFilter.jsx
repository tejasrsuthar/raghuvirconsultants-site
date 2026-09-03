import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

export const DATE_PRESETS = [
  { label: 'All Time', value: 'all' },
  { label: 'Today', value: 'today' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' },
  { label: 'This Month', value: 'this_month' },
  { label: 'Custom Range', value: 'custom' },
];

export function isDateWithinRange(dateStr, rangePreset, customStart, customEnd) {
  if (!dateStr || rangePreset === 'all') return true;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return true;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (rangePreset === 'today') {
    return d >= startOfDay;
  }
  if (rangePreset === '7d') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return d >= sevenDaysAgo;
  }
  if (rangePreset === '30d') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    return d >= thirtyDaysAgo;
  }
  if (rangePreset === 'this_month') {
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return d >= firstOfMonth;
  }
  if (rangePreset === 'custom') {
    if (customStart && d < new Date(customStart)) return false;
    if (customEnd) {
      const end = new Date(customEnd);
      end.setHours(23, 59, 59, 999);
      if (d > end) return false;
    }
    return true;
  }
  return true;
}

export default function DateRangeFilter({
  selectedRange = 'all',
  customStart = '',
  customEnd = '',
  onRangeChange,
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <div className="flex items-center gap-1.5 px-3 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
          <Calendar className="w-3.5 h-3.5 text-gray-500" />
          <select
            value={selectedRange}
            onChange={(e) => onRangeChange({ range: e.target.value, customStart, customEnd })}
            className="bg-transparent focus:outline-none cursor-pointer pr-1 text-xs font-semibold text-gray-800"
          >
            {DATE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 py-1 text-xs animate-in fade-in">
          <input
            type="date"
            value={customStart}
            onChange={(e) => onRangeChange({ range: 'custom', customStart: e.target.value, customEnd })}
            className="bg-transparent text-xs text-gray-700 focus:outline-none"
            title="Start Date"
          />
          <span className="text-gray-400 font-bold">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => onRangeChange({ range: 'custom', customStart, customEnd: e.target.value })}
            className="bg-transparent text-xs text-gray-700 focus:outline-none"
            title="End Date"
          />
        </div>
      )}
    </div>
  );
}

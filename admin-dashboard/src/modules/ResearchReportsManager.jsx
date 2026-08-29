import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Trash2, Edit3, CheckSquare, Square, Search, RefreshCw, ArrowUpDown, ExternalLink, Copy, Check } from 'lucide-react';
import ReportEditorPage from './ReportEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import { API_BASE_URL } from '../config/apiConfig';

export default function ResearchReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({ range: 'all', customStart: '', customEnd: '' });

  // Sorting State
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Confirmation Modals
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports(currentPage);
  }, [currentPage]);

  const fetchReports = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports?page=${page}&limit=10`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load research reports');
      }
    } catch (e) {
      toast.error('Network error loading reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCopyLink = (url) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    toast.success('Document URL copied to clipboard');
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting report "${deleteConfirmItem.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Research report deleted successfully', { id: toastId });
        setDeleteConfirmItem(null);
        fetchReports(currentPage);
      } else {
        toast.error('Failed to delete report', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting report', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting ${selectedIds.length} research reports...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} research reports`, { id: toastId });
        setBulkDeleteConfirm(false);
        setSelectedIds([]);
        fetchReports(currentPage);
      } else {
        toast.error('Failed to delete reports', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error executing bulk delete', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredReports.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredReports.map(r => r.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const filteredReports = reports
    .filter(r => {
      const matchesSearch = searchQuery === '' || 
        (r.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.ticker || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || (r.status || 'published') === statusFilter;
      const matchesDate = isDateWithinRange(r.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (showEditor) {
    return (
      <ReportEditorPage
        report={editingItem}
        onSave={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Research report saved successfully!');
          fetchReports(currentPage);
        }}
        onCancel={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
      />
    );
  }

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Institutional Research Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Publish in-depth company valuations, target models, and Google Docs research</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setEditingItem(null);
                setShowEditor(true);
              }}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all"
            >
              <Plus className="w-4 h-4" /> Publish Report
            </button>
            <button
              onClick={() => fetchReports(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Reports"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        {/* Stable Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reports by ticker, title, or summary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          <DateRangeFilter
            selectedRange={dateFilter.range}
            customStart={dateFilter.customStart}
            customEnd={dateFilter.customEnd}
            onRangeChange={setDateFilter}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        {/* Dedicated Zero-Shift Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200/80 p-3 px-4 rounded-2xl text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="font-bold text-blue-900">{selectedIds.length} Reports Selected</span>
            </div>
            <button
              onClick={() => setBulkDeleteConfirm(true)}
              disabled={bulkActionLoading}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete Selected
            </button>
          </div>
        )}

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Loading research reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No research reports found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 w-12 min-w-[48px] max-w-[48px] text-center">
                    <button onClick={toggleSelectAll} className="p-1 inline-flex items-center justify-center">
                      {selectedIds.length === filteredReports.length && filteredReports.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-900" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Report Title & Ticker <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Google Doc Source</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Published <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const rowActions = [
                    {
                      label: 'Edit Report',
                      icon: Edit3,
                      onClick: () => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }
                    },
                    ...(item.google_doc_url ? [
                      {
                        label: 'Open Google Doc',
                        icon: ExternalLink,
                        onClick: () => window.open(item.google_doc_url, '_blank')
                      },
                      {
                        label: 'Copy Doc Link',
                        icon: Copy,
                        onClick: () => handleCopyLink(item.google_doc_url)
                      }
                    ] : []),
                    { divider: true },
                    {
                      label: 'Delete Report',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmItem(item)
                    }
                  ];

                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${isSelected ? 'bg-blue-50/30' : ''}`}
                      title="Click to edit research report"
                    >
                      <td className="py-3.5 px-3 w-12 min-w-[48px] max-w-[48px] text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(item.id)} className="p-1 inline-flex items-center justify-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          {item.ticker && (
                            <span className="px-2.5 py-1 bg-gray-900 text-white font-mono font-bold rounded-lg text-xs shrink-0 group-hover:bg-blue-900 transition-colors">
                              {item.ticker}
                            </span>
                          )}
                          <div>
                            <span className="font-bold text-gray-900 block max-w-sm truncate group-hover:text-blue-900 transition-colors">{item.title}</span>
                            <span className="text-[11px] text-gray-500 block max-w-sm truncate">{item.summary || 'Institutional research note'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        {item.google_doc_url ? (
                          <a
                            href={item.google_doc_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full font-bold text-[11px] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> View Document
                          </a>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          (item.status || 'published') === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        }`}>
                          {item.status || 'PUBLISHED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <RowActionMenu items={rowActions} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Numbered Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-6 border-t border-gray-100 flex justify-center">
            <NumberedPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(page) => setCurrentPage(page)}
            />
          </div>
        )}
      </div>

      {/* Delete Single Report Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Research Report: ${deleteConfirmItem?.title}?`}
        message={`Are you sure you want to delete this report? Investors will lose instant access to its content.`}
        confirmText="Delete Report"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Research Reports?`}
        message={`Are you sure you want to delete ${selectedIds.length} research reports? This action cannot be reversed.`}
        confirmText="Delete Selected"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, Trash2, Edit3, ExternalLink, CheckSquare, Square, ArrowUpDown, Search, RefreshCw, FileCode, CheckCircle2 } from 'lucide-react';
import ReportEditorPage from './ReportEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function ResearchReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('published_at');
  const [sortDirection, setSortDirection] = useState('desc');

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
      const res = await fetch(`${API_BASE_URL}/api/reports?page=${page}&limit=10`);
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

  const handleSingleStatusUpdate = async (id, newStatus) => {
    const report = reports.find(r => r.id === id);
    if (!report) return;
    const toastId = toast.loading(`Updating report status...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setReports(reports.map(r => r.id === id ? { ...r, status: newStatus } : r));
        toast.success(`Report status updated to ${newStatus.toUpperCase()}`, { id: toastId });
      } else {
        toast.error('Failed to update report status', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating status', { id: toastId });
    }
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
        toast.error('Failed to execute bulk delete', { id: toastId });
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

  // Bulk Operations
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const toastId = toast.loading(`Updating ${selectedIds.length} reports to ${newStatus}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports/bulk-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Updated status for ${selectedIds.length} reports to ${newStatus.toUpperCase()}`, { id: toastId });
        fetchReports(currentPage);
      } else {
        toast.error('Failed to execute bulk status update', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error during bulk update', { id: toastId });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Sorting Handler
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filtered & Sorted Reports
  const filteredReports = reports
    .filter(r => {
      const matchesSearch = searchQuery === '' || 
        r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (r.content || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
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
              <h2 className="text-xl font-bold text-gray-900">Research & Advisory Reports</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage published institutional research, sector reports, and Google Doc links</p>
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
              <Plus className="w-4 h-4" /> New Report
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

      {/* Filter & Bulk Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports by title or content..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-blue-50/70 border border-blue-200 p-1.5 px-3 rounded-full text-xs animate-in fade-in">
              <span className="font-bold text-blue-900 mr-2">{selectedIds.length} Selected</span>
              <button
                onClick={() => handleBulkStatusChange('published')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-[11px] transition-colors"
              >
                Publish
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-[11px] transition-colors"
              >
                Draft
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>

        {/* Reports Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
            Loading research reports...
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No research reports found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.length === filteredReports.length && filteredReports.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-900" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Report Title <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Google Doc Source</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('published_at')}>
                    <div className="flex items-center gap-1.5">
                      Date <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredReports.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      <td className="py-3.5 px-3">
                        <button onClick={() => toggleSelect(item.id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="font-bold text-gray-900 leading-snug">{item.title}</div>
                        <div className="text-[11px] text-gray-400 line-clamp-1">{item.content}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        {item.doc_link ? (
                          <a
                            href={item.doc_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg text-[10px] transition-colors"
                          >
                            <ExternalLink className="w-3 h-3" /> Open Doc
                          </a>
                        ) : (
                          <span className="text-gray-400 font-mono text-[10px]">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <select
                          value={item.status}
                          onChange={(e) => handleSingleStatusUpdate(item.id, e.target.value)}
                          className={`px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase border focus:outline-none transition-all cursor-pointer ${
                            item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            item.status === 'draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-100 text-gray-600 border-gray-200'
                          }`}
                        >
                          <option value="draft">DRAFT</option>
                          <option value="published">PUBLISHED</option>
                          <option value="archived">ARCHIVED</option>
                        </select>
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(item.published_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditor(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                            title="Edit Report"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                            title="Delete Report"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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
        title={`Delete Research Report?`}
        message={`Are you sure you want to permanently delete report "${deleteConfirmItem?.title}"? Investors will lose access immediately.`}
        confirmText="Delete Report"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Bulk Delete ${selectedIds.length} Reports?`}
        message={`Are you sure you want to permanently delete all ${selectedIds.length} selected research reports? This action cannot be reversed.`}
        confirmText="Delete All Selected"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Plus, Trash2, Edit3, CheckSquare, Square, RefreshCw, ArrowUpDown, Search, CheckCircle2, ShieldAlert } from 'lucide-react';
import NotificationEditorPage from './NotificationEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import { API_BASE_URL } from '../config/apiConfig';

export default function NotificationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
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
    fetchItems(currentPage);
  }, [statusFilter, currentPage]);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const url = statusFilter 
        ? `${API_BASE_URL}/api/notifications?page=${page}&limit=10&status=${statusFilter}`
        : `${API_BASE_URL}/api/notifications?page=${page}&limit=10`;
      const res = await fetch(url, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load notifications');
      }
    } catch (e) {
      toast.error('Network error loading notifications');
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

  const handleSingleStatusUpdate = async (item, newStatus) => {
    const toastId = toast.loading(`Updating alert status to ${newStatus.toUpperCase()}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${item.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          title: item.title,
          message: item.message,
          status: newStatus
        })
      });
      if (res.ok) {
        setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
        toast.success(`Alert status updated to ${newStatus.toUpperCase()}`, { id: toastId });
      } else {
        toast.error('Failed to update alert status', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating alert status', { id: toastId });
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting alert "${deleteConfirmItem.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success('Alert notification deleted', { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems(currentPage);
      } else {
        toast.error('Failed to delete alert', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting alert', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting ${selectedIds.length} notifications...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} notifications`, { id: toastId });
        setBulkDeleteConfirm(false);
        setSelectedIds([]);
        fetchItems(currentPage);
      } else {
        toast.error('Failed to execute bulk delete', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error during bulk delete', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  // Selection Logic
  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Bulk Status Update
  const handleBulkStatusChange = async (newStatus) => {
    if (selectedIds.length === 0) return;
    setBulkActionLoading(true);
    const toastId = toast.loading(`Updating ${selectedIds.length} alerts to ${newStatus}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/bulk-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds, status: newStatus })
      });
      if (res.ok) {
        toast.success(`Updated status for ${selectedIds.length} alerts to ${newStatus.toUpperCase()}`, { id: toastId });
        fetchItems(currentPage);
      } else {
        toast.error('Failed to execute bulk status update', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error during bulk update', { id: toastId });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const filteredItems = items
    .filter(i => {
      const matchesSearch = searchQuery === '' ||
        (i.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (i.message || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = isDateWithinRange(i.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesDate;
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
      <NotificationEditorPage
        notification={editingItem}
        onSave={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Alert notification saved successfully!');
          fetchItems(currentPage);
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
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Investor System Alerts & Broadcasts</h2>
              <p className="text-xs text-gray-500 mt-0.5">Send urgent market notices, trade recommendations, and platform maintenance broadcasts</p>
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
              <Plus className="w-4 h-4" /> Create Broadcast
            </button>
            <button
              onClick={() => fetchItems(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Alerts"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4 relative">
        {/* Stable Search & Filter Bar (Never shifts when checkboxes are selected) */}
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search alerts by title or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-amber-500"
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
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="">All Broadcast Statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </div>

        {/* Dedicated Zero-Shift Bulk Action Bar */}
        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between bg-amber-50 border border-amber-200/80 p-3 px-4 rounded-2xl text-xs animate-in fade-in slide-in-from-top-1 duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-bold text-amber-900">{selectedIds.length} Alerts Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleBulkStatusChange('published')}
                disabled={bulkActionLoading}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-[11px] shadow-xs transition-colors"
              >
                Broadcast
              </button>
              <button
                onClick={() => handleBulkStatusChange('draft')}
                disabled={bulkActionLoading}
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold text-[11px] shadow-xs transition-colors"
              >
                Move to Draft
              </button>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkActionLoading}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-[11px] flex items-center gap-1 shadow-xs transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            Loading notifications...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No broadcast alerts found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 w-12 min-w-[48px] max-w-[48px] text-center">
                    <button onClick={toggleSelectAll} className="p-1 inline-flex items-center justify-center">
                      {selectedIds.length === filteredItems.length && filteredItems.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-900" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Alert Broadcast <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Message Body</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Created <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isPublished = item.status === 'published';
                  const rowActions = [
                    {
                      label: 'Edit Broadcast',
                      icon: Edit3,
                      onClick: () => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }
                    },
                    {
                      label: isPublished ? 'Move to Draft' : 'Publish Broadcast',
                      icon: CheckCircle2,
                      onClick: () => handleSingleStatusUpdate(item, isPublished ? 'draft' : 'published')
                    },
                    { divider: true },
                    {
                      label: 'Delete Broadcast',
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
                      className={`hover:bg-amber-50/40 transition-colors cursor-pointer group ${isSelected ? 'bg-amber-50/30' : ''}`}
                      title="Click to edit broadcast alert"
                    >
                      <td className="py-3.5 px-3 w-12 min-w-[48px] max-w-[48px] text-center" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => toggleSelect(item.id)} className="p-1 inline-flex items-center justify-center">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 group-hover:bg-amber-100 transition-colors">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-amber-900 transition-colors">{item.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {item.id ? item.id.slice(0, 8) : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 max-w-sm truncate">{item.message}</td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          item.status === 'published'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : item.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                            : 'bg-gray-100 text-gray-600 border border-gray-200/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'published' ? 'bg-emerald-500' :
                            item.status === 'draft' ? 'bg-amber-500' : 'bg-gray-400'
                          }`} />
                          {(item.status || 'DRAFT').toUpperCase()}
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

      {/* Delete Single Alert Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Broadcast Alert?`}
        message={`Are you sure you want to delete broadcast "${deleteConfirmItem?.title}"? It will no longer appear on investor notification bells.`}
        confirmText="Delete Alert"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Broadcast Alerts?`}
        message={`Are you sure you want to delete all ${selectedIds.length} selected alert broadcasts?`}
        confirmText="Delete Selected"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

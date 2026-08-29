import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Bell, Plus, Trash2, Edit3, CheckSquare, Square, RefreshCw, ShieldAlert, AlertCircle, Info, CheckCircle2 } from 'lucide-react';
import NotificationEditorPage from './NotificationEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import { API_BASE_URL } from '../config/apiConfig';

export default function NotificationsManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
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
      const res = await fetch(url);
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

  const handleSingleStatusUpdate = async (id, newStatus) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    const toastId = toast.loading(`Updating alert status...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}`, {
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
        setItems(items.map(i => i.id === id ? { ...i, status: newStatus } : i));
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
    if (selectedIds.length === items.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(items.map(i => i.id));
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

      {/* Filter & Bulk Bar */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-3">
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

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-amber-50/70 border border-amber-200 p-1.5 px-3 rounded-full text-xs animate-in fade-in">
              <span className="font-bold text-amber-900 mr-2">{selectedIds.length} Selected</span>
              <button
                onClick={() => handleBulkStatusChange('published')}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-[11px] transition-colors"
              >
                Broadcast
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

        {/* Notifications Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-amber-600" />
            Loading notifications...
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No broadcast alerts found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.length === items.length && items.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-900" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3">Alert Title</th>
                  <th className="py-3.5 px-3">Message Body</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 px-3">Created</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${isSelected ? 'bg-amber-50/30' : ''}`}>
                      <td className="py-3.5 px-3">
                        <button onClick={() => toggleSelect(item.id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-amber-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">{item.title}</td>
                      <td className="py-3.5 px-3 text-gray-600 max-w-sm truncate">{item.message}</td>
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
                        {new Date(item.created_at || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setShowEditor(true);
                            }}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                            title="Edit Alert"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(item)}
                            className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                            title="Delete Alert"
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

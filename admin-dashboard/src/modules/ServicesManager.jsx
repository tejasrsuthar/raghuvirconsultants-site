import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Sparkles, Plus, Trash2, Edit3, Search, RefreshCw, ArrowUpDown, Calendar, CheckCircle2 } from 'lucide-react';
import ServiceEditorPage from './ServiceEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import NumberedPagination from '../components/NumberedPagination';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function ServicesManager() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({ range: 'all', customStart: '', customEnd: '' });

  // Sorting State
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Full-page Editor state
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Confirmation Modal
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchItems(currentPage);
  }, [currentPage]);

  const fetchItems = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services?page=${page}&limit=10`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load advisory services');
      }
    } catch (e) {
      toast.error('Network error loading services');
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

  const executeDelete = async () => {
    if (!deleteConfirmItem) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting service "${deleteConfirmItem.title}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Service "${deleteConfirmItem.title}" deleted successfully`, { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems(currentPage);
      } else {
        toast.error('Failed to delete service offering', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting service', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredServices = items
    .filter(s => {
      const matchesSearch = searchQuery === '' ||
        (s.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = isDateWithinRange(s.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'price') {
        valA = Number(a.price || 0);
        valB = Number(b.price || 0);
      } else {
        if (typeof valA === 'string') valA = valA.toLowerCase();
        if (typeof valB === 'string') valB = valB.toLowerCase();
      }
      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  if (showEditor) {
    return (
      <ServiceEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Service offering saved successfully!');
          fetchItems(currentPage);
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
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Advisory Plans & Subscription Tiers</h2>
              <div className="mt-1 mb-1">
                <AdminBreadcrumb items={[{ label: 'Services Catalog' }]} />
              </div>
              <p className="text-xs text-gray-500">Manage subscription packages, monthly rates, and client advisory benefits</p>
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
              <Plus className="w-4 h-4" /> Add Service Tier
            </button>
            <button
              onClick={() => fetchItems(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Services"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search services by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-purple-500"
            />
          </div>

          <DateRangeFilter
            selectedRange={dateFilter.range}
            customStart={dateFilter.customStart}
            customEnd={dateFilter.customEnd}
            onRangeChange={setDateFilter}
          />
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-purple-600" />
            Loading advisory tiers...
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No advisory services found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      Service Offering <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-1.5">
                      Monthly Price (₹) <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Description Preview</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Created <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredServices.map((service) => {
                  const rowActions = [
                    {
                      label: 'Edit Service Tier',
                      icon: Edit3,
                      onClick: () => {
                        setEditingItem(service);
                        setShowEditor(true);
                      }
                    },
                    { divider: true },
                    {
                      label: 'Delete Service',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmItem(service)
                    }
                  ];

                  return (
                    <tr 
                      key={service.id} 
                      onClick={() => {
                        setEditingItem(service);
                        setShowEditor(true);
                      }}
                      className="hover:bg-purple-50/40 transition-colors cursor-pointer group"
                      title="Click to edit service tier"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold shrink-0 group-hover:bg-purple-100 transition-colors">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-purple-950 transition-colors">{service.title}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {service.id ? service.id.slice(0, 8) : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="text-sm font-extrabold text-gray-900">₹{Number(service.price || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-gray-400 font-semibold block">/ mo</span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 max-w-sm truncate">
                        {service.description || 'Full institutional advisory coverage and model portfolios.'}
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(service.created_at || Date.now()).toLocaleDateString()}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Service Tier?`}
        message={`Are you sure you want to permanently delete "${deleteConfirmItem?.title}"?`}
        confirmText="Delete Tier"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}

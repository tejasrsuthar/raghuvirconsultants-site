import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Layers, Plus, Trash2, Edit3, Search, RefreshCw, ArrowUpDown, TrendingUp, ExternalLink } from 'lucide-react';
import SmallCaseEditorPage from './SmallCaseEditorPage';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import NumberedPagination from '../components/NumberedPagination';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function SmallCasesManager() {
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
      const res = await fetch(`${API_BASE_URL}/api/smallcases?page=${page}&limit=10`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load Smallcase strategies');
      }
    } catch (e) {
      toast.error('Network error loading smallcases');
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
    const toastId = toast.loading(`Deleting strategy "${deleteConfirmItem.name}"...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/smallcases/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Strategy "${deleteConfirmItem.name}" deleted successfully`, { id: toastId });
        setDeleteConfirmItem(null);
        fetchItems(currentPage);
      } else {
        toast.error('Failed to delete smallcase strategy', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting strategy', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const filteredItems = items
    .filter(s => {
      const matchesSearch = searchQuery === '' ||
        (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDate = isDateWithinRange(s.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesDate;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'cagr' || sortField === 'min_investment') {
        valA = Number(a[sortField] || 0);
        valB = Number(b[sortField] || 0);
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
      <SmallCaseEditorPage
        initialData={editingItem}
        onBack={() => {
          setShowEditor(false);
          setEditingItem(null);
        }}
        onSaveSuccess={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Smallcase strategy saved successfully!');
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
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Smallcase Strategy Directory</h2>
              <div className="mt-1 mb-1">
                <AdminBreadcrumb items={[{ label: 'Smallcases Manager' }]} />
              </div>
              <p className="text-xs text-gray-500">Manage thematic equity baskets, CAGR track records, and execution URLs</p>
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
              <Plus className="w-4 h-4" /> Add Strategy
            </button>
            <button
              onClick={() => fetchItems(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Strategies"
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
              placeholder="Search strategies by name or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-teal-500"
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
            <RefreshCw className="w-5 h-5 animate-spin text-teal-600" />
            Loading Smallcase baskets...
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No Smallcase strategies found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      Strategy Name <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('cagr')}>
                    <div className="flex items-center gap-1.5">
                      3Y CAGR (%) <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('min_investment')}>
                    <div className="flex items-center gap-1.5">
                      Min Investment (₹) <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">Portal Link</th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Created <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredItems.map((sc) => {
                  const rowActions = [
                    {
                      label: 'Edit Strategy',
                      icon: Edit3,
                      onClick: () => {
                        setEditingItem(sc);
                        setShowEditor(true);
                      }
                    },
                    ...(sc.link ? [{
                      label: 'Open Smallcase Portal',
                      icon: ExternalLink,
                      onClick: () => window.open(sc.link, '_blank')
                    }] : []),
                    { divider: true },
                    {
                      label: 'Delete Strategy',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmItem(sc)
                    }
                  ];

                  return (
                    <tr 
                      key={sc.id} 
                      onClick={() => {
                        setEditingItem(sc);
                        setShowEditor(true);
                      }}
                      className="hover:bg-teal-50/40 transition-colors cursor-pointer group"
                      title="Click to edit smallcase strategy"
                    >
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold shrink-0 group-hover:bg-teal-100 transition-colors">
                            <Layers className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block group-hover:text-teal-950 transition-colors">{sc.name}</span>
                            <span className="text-[11px] text-gray-500 block max-w-sm truncate">{sc.description || 'Thematic multi-cap algorithmic portfolio'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="font-mono font-bold text-emerald-600 inline-flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          +{sc.cagr || '0'}%
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-800 font-semibold">
                        ₹{Number(sc.min_investment || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3" onClick={(e) => e.stopPropagation()}>
                        {sc.link ? (
                          <a
                            href={sc.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-3 h-3" /> Visit Portal
                          </a>
                        ) : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(sc.created_at || Date.now()).toLocaleDateString()}
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
        title={`Delete Smallcase Strategy?`}
        message={`Are you sure you want to permanently delete "${deleteConfirmItem?.name}"?`}
        confirmText="Delete Strategy"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Briefcase, Plus, Trash2, Edit3, CheckSquare, Square, ArrowUpDown, Search, RefreshCw, DollarSign } from 'lucide-react';
import StockEditorPage from './StockEditorPage';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import { API_BASE_URL } from '../config/apiConfig';

export default function PortfolioStocksManager() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({ range: 'all', customStart: '', customEnd: '' });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Multi-Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  // Sorting State
  const [sortField, setSortField] = useState('created_at');
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
    fetchStocks(currentPage);
  }, [currentPage]);

  const fetchStocks = async (page = 1) => {
    setLoading(true);
    setSelectedIds([]);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio?page=${page}&limit=10`);
      if (res.ok) {
        const data = await res.json();
        setStocks(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load portfolio stocks');
      }
    } catch (e) {
      toast.error('Network error loading stocks');
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
    const toastId = toast.loading(`Deleting stock ${deleteConfirmItem.ticker}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/stocks/${deleteConfirmItem.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Stock holding ${deleteConfirmItem.ticker} deleted successfully`, { id: toastId });
        setDeleteConfirmItem(null);
        fetchStocks(currentPage);
      } else {
        toast.error('Failed to delete stock holding', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting stock', { id: toastId });
    } finally {
      setActionLoading(false);
    }
  };

  const executeBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setActionLoading(true);
    const toastId = toast.loading(`Deleting ${selectedIds.length} stock holdings...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio/bulk-delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids: selectedIds })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} portfolio stock holdings`, { id: toastId });
        setBulkDeleteConfirm(false);
        setSelectedIds([]);
        fetchStocks(currentPage);
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
    if (selectedIds.length === filteredStocks.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStocks.map(s => s.id));
    }
  };

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  // Filtered & Sorted Stocks
  const filteredStocks = stocks
    .filter(s => {
      const matchesSearch = searchQuery === '' || 
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (s.company_name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.sector || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = typeFilter === '' || s.type === typeFilter;
      const matchesDate = isDateWithinRange(s.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      let valA = a[sortField] || '';
      let valB = b[sortField] || '';
      if (sortField === 'allocation_percentage' || sortField === 'buy_price' || sortField === 'target_price') {
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
      <StockEditorPage
        stock={editingItem}
        onSave={() => {
          setShowEditor(false);
          setEditingItem(null);
          toast.success('Stock holding saved successfully!');
          fetchStocks(currentPage);
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
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Model Portfolio Stock Positions</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage curated equity allocations, buy prices, target estimates, and sector weights</p>
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
              <Plus className="w-4 h-4" /> Add Stock
            </button>
            <button
              onClick={() => fetchStocks(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Portfolio"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col xl:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by ticker, company, or sector..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <DateRangeFilter
              selectedRange={dateFilter.range}
              customStart={dateFilter.customStart}
              customEnd={dateFilter.customEnd}
              onRangeChange={setDateFilter}
            />

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="">All Market Caps</option>
              <option value="Large Cap">Large Cap</option>
              <option value="Mid Cap">Mid Cap</option>
              <option value="Small Cap">Small Cap</option>
            </select>
          </div>

          {/* Bulk Action Controls */}
          {selectedIds.length > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50/70 border border-emerald-200 p-1.5 px-3 rounded-full text-xs animate-in fade-in">
              <span className="font-bold text-emerald-900 mr-2">{selectedIds.length} Selected</span>
              <button
                onClick={() => setBulkDeleteConfirm(true)}
                disabled={bulkActionLoading}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-[11px] flex items-center gap-1 transition-colors"
              >
                <Trash2 className="w-3 h-3" /> Delete Selected
              </button>
            </div>
          )}
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            Loading portfolio holdings...
          </div>
        ) : filteredStocks.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No stock holdings found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 w-10">
                    <button onClick={toggleSelectAll} className="p-1">
                      {selectedIds.length === filteredStocks.length && filteredStocks.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-gray-900" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('ticker')}>
                    <div className="flex items-center gap-1.5">
                      Ticker / Company <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('sector')}>
                    <div className="flex items-center gap-1.5">
                      Sector <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('allocation_percentage')}>
                    <div className="flex items-center gap-1.5">
                      Allocation <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('buy_price')}>
                    <div className="flex items-center gap-1.5">
                      Entry Price <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('target_price')}>
                    <div className="flex items-center gap-1.5">
                      Target Price <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStocks.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const rowActions = [
                    {
                      label: 'Edit Stock Position',
                      icon: Edit3,
                      onClick: () => {
                        setEditingItem(item);
                        setShowEditor(true);
                      }
                    },
                    { divider: true },
                    {
                      label: 'Delete Position',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmItem(item)
                    }
                  ];

                  return (
                    <tr key={item.id} className={`hover:bg-gray-50/60 transition-colors ${isSelected ? 'bg-emerald-50/30' : ''}`}>
                      <td className="py-3.5 px-3">
                        <button onClick={() => toggleSelect(item.id)} className="p-1">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-gray-900 text-white font-mono font-bold rounded-lg text-xs">
                            {item.ticker}
                          </span>
                          <span className="font-bold text-gray-900">{item.company_name}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2.5 py-1 bg-gray-100 rounded-md text-[10px] font-semibold text-gray-700">
                          {item.sector || 'Equities'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-bold text-gray-900">
                        {item.allocation_percentage ? `${item.allocation_percentage}%` : '—'}
                      </td>
                      <td className="py-3.5 px-3 text-gray-700 font-medium">
                        ₹{Number(item.buy_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 font-bold text-emerald-700">
                        ₹{Number(item.target_price || 0).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-3 text-right">
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

      {/* Delete Single Stock Confirm */}
      <ConfirmModal
        isOpen={!!deleteConfirmItem}
        title={`Delete Position: ${deleteConfirmItem?.ticker}?`}
        message={`Are you sure you want to delete ${deleteConfirmItem?.ticker} (${deleteConfirmItem?.company_name}) from the Model Portfolio? Investors will no longer see this holding.`}
        confirmText="Delete Stock"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmItem(null)}
      />

      {/* Bulk Delete Confirm */}
      <ConfirmModal
        isOpen={bulkDeleteConfirm}
        title={`Delete ${selectedIds.length} Stock Holdings?`}
        message={`Are you sure you want to delete ${selectedIds.length} stock allocations from the Model Portfolio? This action cannot be reversed.`}
        confirmText="Delete Selected"
        isDestructive={true}
        loading={actionLoading}
        onConfirm={executeBulkDelete}
        onCancel={() => setBulkDeleteConfirm(false)}
      />
    </div>
  );
}

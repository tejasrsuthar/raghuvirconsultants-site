import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, RefreshCw, CheckCircle2, AlertCircle, ArrowUpDown, Search, Calendar, FileText } from 'lucide-react';
import NumberedPagination from '../components/NumberedPagination';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import { API_BASE_URL } from '../config/apiConfig';

export default function BillingDashboard() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  
  // Date Range Filter State
  const [dateFilter, setDateFilter] = useState({ range: 'all', customStart: '', customEnd: '' });

  // Sorting State
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSubscriptions(currentPage);
  }, [currentPage]);

  const fetchSubscriptions = async (page = 1) => {
    setLoading(true);
    try {
      const skip = (page - 1) * 10;
      const res = await fetch(`${API_BASE_URL}/api/v1/billing/admin/subscriptions?skip=${skip}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data || []);
        // Without full count from backend, just set simple pagination
        setTotalPages(1);
        setTotalItems(data.length || 0);
      } else {
        toast.error('Failed to load subscriptions');
      }
    } catch (e) {
      toast.error('Network error loading billing data');
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

  const filteredSubscriptions = subscriptions
    .filter(sub => {
      const matchesSearch = searchQuery === '' ||
        (sub.investor_id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (sub.gateway_subscription_id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '' || sub.status === statusFilter;
      const matchesPlan = planFilter === '' || sub.plan_id === planFilter;
      const matchesDate = isDateWithinRange(sub.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesStatus && matchesPlan && matchesDate;
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

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Billing & Subscriptions Master</h2>
              <div className="mt-1 mb-1">
                <AdminBreadcrumb items={[{ label: 'Billing Dashboard' }]} />
              </div>
              <p className="text-xs text-gray-500">Monitor all platform active subscriptions, past-due payments, and cancellations.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchSubscriptions(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID, Investor ID or Gateway ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 focus:outline-none focus:border-indigo-500"
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
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="canceled">Canceled</option>
            <option value="past_due">Past Due</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
          >
            <option value="">All Plans</option>
            <option value="reports_yearly">Research Reports</option>
            <option value="portfolio_yearly">Model Portfolio</option>
          </select>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-emerald-600" />
            Loading billing records...
          </div>
        ) : filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No subscriptions found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      Sub ID <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('investor_id')}>
                    <div className="flex items-center gap-1.5">
                      Investor ID <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('plan_id')}>
                    <div className="flex items-center gap-1.5">
                      Plan <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3">
                    <div className="flex items-center gap-1.5">
                      Gateway ID
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('current_period_end')}>
                    <div className="flex items-center gap-1.5">
                      Period End <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Created <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSubscriptions.map((sub) => {
                  const isActive = sub.status === 'active';
                  const isPending = sub.status === 'pending';
                  const isCanceled = sub.status === 'canceled';

                  let statusClasses = "bg-gray-50 text-gray-700 border border-gray-200";
                  if (isActive) statusClasses = "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
                  if (isPending) statusClasses = "bg-amber-50 text-amber-700 border border-amber-200/60";
                  if (isCanceled) statusClasses = "bg-red-50 text-red-700 border border-red-200/60";

                  return (
                    <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-mono text-[10px] text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {sub.id.substring(0, 8)}...
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="font-bold text-gray-900">
                          {sub.investor_id}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-100">
                          {sub.plan_id.replace('_', ' ')}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${statusClasses}`}>
                          {sub.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        {sub.gateway_subscription_id ? (
                           <span className="font-mono text-gray-600 text-xs">
                             {sub.gateway_subscription_id}
                           </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        {sub.current_period_end ? (
                           <span className="text-gray-800 font-medium">
                             {new Date(sub.current_period_end).toLocaleDateString('en-IN')}
                           </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-gray-800 font-medium text-xs block">
                          {new Date(sub.created_at).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
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
    </div>
  );
}

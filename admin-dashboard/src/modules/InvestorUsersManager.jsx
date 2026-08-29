import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Users, Search, RefreshCw, Key, Shield, UserX, UserCheck, 
  Trash2, Edit, AlertCircle, ArrowUpDown, MoreVertical, Calendar 
} from 'lucide-react';
import NumberedPagination from '../components/NumberedPagination';
import ConfirmModal from '../components/ConfirmModal';
import RowActionMenu from '../components/RowActionMenu';
import DateRangeFilter, { isDateWithinRange } from '../components/DateRangeFilter';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorUsersManager() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
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

  // Modal States
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [usernameModalUser, setUsernameModalUser] = useState(null);
  const [newUsername, setNewUsername] = useState('');
  const [usernameLoading, setUsernameLoading] = useState(false);

  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
        setTotalPages(data.pages || 1);
        setTotalItems(data.total || 0);
      } else {
        toast.error('Failed to load investor accounts');
      }
    } catch (e) {
      toast.error('Network error loading users');
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

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    const toastId = toast.loading(`Updating ${user.username}'s status...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.ok) {
        toast.success(`Account status updated to ${nextStatus.toUpperCase()}`, { id: toastId });
        fetchUsers(currentPage);
      } else {
        toast.error('Failed to update account status', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating status', { id: toastId });
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword) return;
    if (newPassword.length < 7) {
      toast.error('Password must be at least 7 characters long');
      return;
    }
    setPasswordLoading(true);
    const toastId = toast.loading(`Resetting password for ${passwordModalUser.username}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${passwordModalUser.id}/password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ password: newPassword })
      });
      if (res.ok) {
        toast.success(`Password reset successfully for ${passwordModalUser.username}`, { id: toastId });
        setPasswordModalUser(null);
        setNewPassword('');
      } else {
        toast.error('Failed to reset password', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error resetting password', { id: toastId });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUsernameUpdate = async (e) => {
    e.preventDefault();
    if (!usernameModalUser || !newUsername.trim()) return;
    setUsernameLoading(true);
    const toastId = toast.loading(`Updating username...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${usernameModalUser.id}/username`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: newUsername.trim() })
      });
      if (res.ok) {
        toast.success('Username updated successfully', { id: toastId });
        setUsernameModalUser(null);
        setNewUsername('');
        fetchUsers(currentPage);
      } else {
        toast.error('Failed to update username', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating username', { id: toastId });
    } finally {
      setUsernameLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteConfirmUser) return;
    setDeleteLoading(true);
    const toastId = toast.loading(`Deleting account ${deleteConfirmUser.username}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/${deleteConfirmUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Account deleted for ${deleteConfirmUser.username}`, { id: toastId });
        setDeleteConfirmUser(null);
        fetchUsers(currentPage);
      } else {
        toast.error('Failed to delete account', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting account', { id: toastId });
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users
    .filter(u => {
      const matchesSearch = searchQuery === '' ||
        (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (u.id || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === '' || u.role === roleFilter;
      const matchesStatus = statusFilter === '' || (u.status || 'active') === statusFilter;
      const matchesDate = isDateWithinRange(u.created_at, dateFilter.range, dateFilter.customStart, dateFilter.customEnd);
      return matchesSearch && matchesRole && matchesStatus && matchesDate;
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
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Investor Account Directory</h2>
              <p className="text-xs text-gray-500 mt-0.5">Manage investor credentials, activate/suspend accounts, and monitor access</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchUsers(currentPage)}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 transition-all"
              title="Refresh Users"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Table Container */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
        {/* Search, Date Range & Role Filters */}
        <div className="flex flex-col xl:flex-row justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by username, email, or ID..."
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
              <option value="suspended">Suspended</option>
              <option value="blacklisted">Blacklisted</option>
              <option value="disabled">Disabled</option>
            </select>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-semibold text-gray-700 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="investor">Investor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        {/* Directory Table */}
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            Loading investor accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No investor accounts found matching the criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('username')}>
                    <div className="flex items-center gap-1.5">
                      Investor Profile <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('email')}>
                    <div className="flex items-center gap-1.5">
                      Email Address <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('role')}>
                    <div className="flex items-center gap-1.5">
                      Role <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1.5">
                      Account Status <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 cursor-pointer select-none" onClick={() => handleSort('created_at')}>
                    <div className="flex items-center gap-1.5">
                      Registration <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((user) => {
                  const isActive = (user.status || 'active') === 'active';
                  const rowActions = [
                    {
                      label: 'Edit Username',
                      icon: Edit,
                      onClick: () => {
                        setUsernameModalUser(user);
                        setNewUsername(user.username || '');
                      }
                    },
                    {
                      label: 'Reset Password',
                      icon: Key,
                      onClick: () => {
                        setPasswordModalUser(user);
                        setNewPassword('');
                      }
                    },
                    {
                      label: isActive ? 'Suspend Account' : 'Activate Account',
                      icon: isActive ? UserX : UserCheck,
                      onClick: () => handleToggleStatus(user)
                    },
                    { divider: true },
                    {
                      label: 'Delete Account',
                      icon: Trash2,
                      isDestructive: true,
                      onClick: () => setDeleteConfirmUser(user)
                    }
                  ];

                  return (
                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {(user.username || 'U').charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 block">{user.username}</span>
                            <span className="text-[10px] text-gray-400 font-mono">ID: {user.id ? user.id.slice(0, 8) : '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-gray-600 font-medium">{user.email}</td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                          {user.role || 'INVESTOR'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : 'bg-red-50 text-red-700 border border-red-200/60'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                          {(user.status || 'ACTIVE').toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-gray-400 font-medium">
                        {new Date(user.created_at || Date.now()).toLocaleDateString()}
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

      {/* Password Reset Modal */}
      {passwordModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-50 rounded-xl text-amber-700">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Reset Investor Password</h3>
                <p className="text-[11px] text-gray-500">{passwordModalUser.username} ({passwordModalUser.email})</p>
              </div>
            </div>

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 7 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-full text-xs font-bold transition-colors"
                >
                  {passwordLoading ? 'Resetting...' : 'Save Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Username Modal */}
      {usernameModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700">
                <Edit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-gray-900">Edit Username</h3>
                <p className="text-[11px] text-gray-500">{usernameModalUser.email}</p>
              </div>
            </div>

            <form onSubmit={handleUsernameUpdate} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Username</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setUsernameModalUser(null)}
                  className="px-4 py-2 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={usernameLoading}
                  className="px-5 py-2 bg-gray-900 hover:bg-black text-white rounded-full text-xs font-bold transition-colors"
                >
                  {usernameLoading ? 'Saving...' : 'Update Username'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmUser}
        title={`Delete Investor Account?`}
        message={`Are you sure you want to permanently delete investor ${deleteConfirmUser?.username} (${deleteConfirmUser?.email})? All session access and subscription entitlements will be revoked.`}
        confirmText="Delete Account"
        isDestructive={true}
        loading={deleteLoading}
        onConfirm={executeDelete}
        onCancel={() => setDeleteConfirmUser(null)}
      />
    </div>
  );
}

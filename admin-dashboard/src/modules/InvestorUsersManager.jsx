import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Users, KeyRound, UserCheck, UserX, Trash2, Edit3, Search, Shield, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';
import ConfirmModal from '../components/ConfirmModal';
import NumberedPagination from '../components/NumberedPagination';

export default function InvestorUsersManager() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [pwdModalUser, setPwdModalUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  const [editModalUser, setEditModalUser] = useState(null);
  const [editUsername, setEditUsername] = useState('');

  // Delete Confirmation Modal
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.items || []);
        setPages(data.pages || 1);
        setTotal(data.total || (data.items || []).length);
      } else {
        toast.error('Failed to load investor accounts');
      }
    } catch (e) {
      toast.error('Network error loading investors');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'disabled' : 'active';
    const toastId = toast.loading(`Updating ${user.username}'s account status...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        toast.success(`Investor ${user.username} account marked as ${newStatus.toUpperCase()}`, { id: toastId });
        fetchUsers();
      } else {
        toast.error('Failed to update status', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating status', { id: toastId });
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');

    if (newPassword.length < 7 || !/[!@#$%]/.test(newPassword)) {
      setPwdError('Password must be at least 7 characters long and contain a special character (!@#$%)');
      return;
    }

    const toastId = toast.loading(`Resetting password for ${pwdModalUser.username}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${pwdModalUser.id}/reset-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Password reset failed');
      }

      toast.success(`Password for ${pwdModalUser.username} reset successfully!`, { id: toastId });
      setPwdSuccess('Password reset successfully!');
      setNewPassword('');
      setTimeout(() => setPwdModalUser(null), 1200);
    } catch (err) {
      toast.error(err.message, { id: toastId });
      setPwdError(err.message);
    }
  };

  const handleUpdateUsername = async (e) => {
    e.preventDefault();
    const toastId = toast.loading('Updating username...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${editModalUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ username: editUsername })
      });

      if (res.ok) {
        toast.success(`Username updated to ${editUsername}`, { id: toastId });
        setEditModalUser(null);
        fetchUsers();
      } else {
        const data = await res.json();
        toast.error(data.detail || 'Failed to update username', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating username', { id: toastId });
    }
  };

  const executeDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    setIsDeleting(true);
    const toastId = toast.loading(`Deleting investor ${deleteConfirmUser.username}...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${deleteConfirmUser.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        toast.success(`Investor ${deleteConfirmUser.username} permanently deleted`, { id: toastId });
        setDeleteConfirmUser(null);
        fetchUsers();
      } else {
        toast.error('Failed to delete investor account', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error deleting user', { id: toastId });
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full space-y-6">
      {/* Module Header Bar with Stats */}
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
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by username or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 w-64"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="p-2.5 bg-gray-50 border border-gray-200 rounded-full text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-all"
              title="Refresh Users"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Investor Table */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-gray-500 flex flex-col items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
            Loading investor records...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-xs text-gray-500">
            No investor accounts matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-gray-200/80 text-gray-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-3">Investor Profile</th>
                  <th className="py-3.5 px-3">Email Address</th>
                  <th className="py-3.5 px-3">Role</th>
                  <th className="py-3.5 px-3">Account Status</th>
                  <th className="py-3.5 px-3">Registration</th>
                  <th className="py-3.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                          {(u.username || 'I').substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-bold text-gray-900 block leading-tight">{u.username}</span>
                          <span className="text-[10px] text-gray-400 font-mono">ID: {u.id?.substring(0, 8)}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-3 font-medium text-gray-600">{u.email}</td>
                    <td className="py-4 px-3">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 px-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase flex items-center gap-1.5 w-fit ${
                        u.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60' 
                          : 'bg-red-50 text-red-600 border border-red-200/60'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'active' ? 'bg-emerald-600' : 'bg-red-600'}`} />
                        {u.status}
                      </span>
                    </td>
                    <td className="py-4 px-3 text-gray-400 font-medium">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                          className={`p-2 rounded-xl transition-colors ${
                            u.status === 'active' 
                              ? 'hover:bg-amber-50 text-amber-600' 
                              : 'hover:bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {u.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setPwdModalUser(u);
                            setNewPassword('');
                            setPwdError('');
                            setPwdSuccess('');
                          }}
                          title="Reset Password"
                          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setEditModalUser(u);
                            setEditUsername(u.username);
                          }}
                          title="Edit Username"
                          className="p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmUser(u)}
                          title="Delete User"
                          className="p-2 hover:bg-red-50 rounded-xl text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Numbered Pagination */}
        {pages > 1 && (
          <div className="pt-6 border-t border-gray-100 flex justify-center">
            <NumberedPagination
              currentPage={page}
              totalPages={pages}
              onPageChange={(p) => setPage(p)}
            />
          </div>
        )}
      </div>

      {/* Password Reset Modal */}
      {pwdModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Reset Password</h3>
                <p className="text-xs text-gray-500">Account: <strong>{pwdModalUser.username}</strong> ({pwdModalUser.email})</p>
              </div>
            </div>

            {pwdError && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100">{pwdError}</div>}
            {pwdSuccess && <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl border border-emerald-100">{pwdSuccess}</div>}

            <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">New Secure Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 7 chars with !@#$%"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPwdModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-full shadow-md transition-all"
                >
                  Confirm Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Username Modal */}
      {editModalUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md border border-gray-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <Edit3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Edit Username</h3>
                <p className="text-xs text-gray-500">Account: <strong>{editModalUser.email}</strong></p>
              </div>
            </div>

            <form onSubmit={handleUpdateUsername} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase mb-1">New Username</label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditModalUser(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-gray-900 hover:bg-black rounded-full shadow-md transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Confirm Deletion Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmUser}
        title={`Delete Investor ${deleteConfirmUser?.username}?`}
        message={`Are you sure you want to permanently delete investor account "${deleteConfirmUser?.username}" (${deleteConfirmUser?.email})? All subscriptions and activity records will be archived.`}
        confirmText="Delete Account"
        isDestructive={true}
        loading={isDeleting}
        onConfirm={executeDeleteUser}
        onCancel={() => setDeleteConfirmUser(null)}
      />
    </div>
  );
}

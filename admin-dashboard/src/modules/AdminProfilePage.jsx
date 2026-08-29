import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiConfig';
import AdminBreadcrumb from '../components/AdminBreadcrumb';

export default function AdminProfilePage({ onBack }) {
  const [formData, setFormData] = useState({
    username: localStorage.getItem('username') || 'Admin',
    email: localStorage.getItem('email') || 'admin@raghuvir.com',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password && formData.password.length < 7) {
      setError('Password must be at least 7 characters long');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username
      };
      if (formData.password) payload.password = formData.password;

      const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setMessage('Profile updated successfully!');
        toast.success('Admin profile credentials updated successfully');
        localStorage.setItem('username', data.username);
        setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      } else {
        throw new Error(data.detail || 'Failed to update profile');
      }
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update admin profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs space-y-6 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="mb-3">
            <AdminBreadcrumb
              onNavigateHome={onBack}
              items={[
                { label: 'Admin Profile Settings' }
              ]}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-gray-700" />
            Edit Admin Profile Settings
          </h2>
          <p className="text-xs text-gray-500 mt-1">Manage admin credentials, email preferences, and password security</p>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> {message}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username & Email Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-gray-500" /> Admin Username
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-500" /> Email Address
            </label>
            <input
              type="email"
              disabled
              value={formData.email}
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-xs font-semibold text-gray-500 cursor-not-allowed"
            />
            <span className="text-[10px] text-gray-400 mt-1 block">Email is bound to primary admin account</span>
          </div>
        </div>

        {/* Change Password Section */}
        <div className="pt-4 border-t border-gray-100 space-y-4">
          <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-gray-500" /> Update Password (Optional)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">New Password</label>
              <input
                type="password"
                placeholder="Leave blank to keep current"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gray-400"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Min 7 chars with special char !@#$%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Updating Profile...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

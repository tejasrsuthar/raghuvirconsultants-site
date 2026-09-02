import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, Save, CheckCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function PlatformSettingsManager() {
  const [settings, setSettings] = useState({ default_page_size: 10, min_password_length: 7 });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        setSettings({
          default_page_size: data.default_page_size || 10,
          min_password_length: data.min_password_length || 7
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          default_page_size: parseInt(settings.default_page_size, 10),
          min_password_length: parseInt(settings.min_password_length, 10)
        })
      });

      if (!res.ok) {
        throw new Error('Failed to update platform settings');
      }

      setSaved(true);
      toast.success('Platform configuration saved successfully');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to update platform settings');
    }
  };

  return (
    <div className="space-y-6 w-full font-sans">
      {/* Top Banner Card */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gray-100 rounded-2xl text-gray-800 shrink-0">
            <Settings className="w-6 h-6 text-gray-700" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Platform-Wide Global Settings</h2>
            <div className="mt-1 mb-1">
              <AdminBreadcrumb items={[{ label: 'Platform Settings' }]} />
            </div>
            <p className="text-xs text-gray-500">Configure system defaults, pagination parameters, and security policies</p>
          </div>
        </div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> System settings updated and persisted successfully!
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-bold">{error}</div>}

      {loading ? (
        <div className="text-center py-12 text-xs text-gray-500 bg-white border border-gray-200 rounded-3xl">Loading platform settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pagination Configuration Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Database & Pagination Tuning</h3>
                <p className="text-xs text-gray-500 mt-0.5">Control row limits for ultra-fast response times across 50k+ records</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Default Pagination Page Size
                </label>
                <input
                  type="number"
                  min="5"
                  max="100"
                  required
                  value={settings.default_page_size}
                  onChange={(e) => setSettings({ ...settings, default_page_size: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Default number of rows returned per page across all CRUD modules</p>
              </div>
            </div>

            {/* Password Security Policy Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Authentication Security Policy</h3>
                <p className="text-xs text-gray-500 mt-0.5">Define password complexity standards for public and administrative accounts</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                  Minimum Password Length Policy
                </label>
                <input
                  type="number"
                  min="7"
                  max="32"
                  required
                  value={settings.min_password_length}
                  onChange={(e) => setSettings({ ...settings, min_password_length: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">Minimum character length required (enforces special character from !@#$%)</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs flex items-center justify-end">
            <button
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

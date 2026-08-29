import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Settings, Save, CheckCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
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
    <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
        <div className="p-3 bg-gray-100 rounded-2xl text-gray-800">
          <Settings className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Platform-Wide Global Settings</h2>
          <p className="text-xs text-gray-500 mt-0.5">Configure system defaults, pagination parameters, and security policies</p>
        </div>
      </div>

      {saved && (
        <div className="p-4 mb-6 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4" /> System settings updated successfully!
        </div>
      )}

      {error && <div className="p-4 mb-6 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-bold">{error}</div>}

      {loading ? (
        <div className="text-center py-8 text-xs text-gray-500">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Default Pagination Page Size (50,000+ Scaled Records)
            </label>
            <input
              type="number"
              min="5"
              max="100"
              required
              value={settings.default_page_size}
              onChange={(e) => setSettings({ ...settings, default_page_size: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
            />
            <p className="text-[10px] text-gray-400 mt-1">Default number of rows returned per page across all CRUD modules</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
              Minimum Password Length Policy
            </label>
            <input
              type="number"
              min="7"
              max="32"
              required
              value={settings.min_password_length}
              onChange={(e) => setSettings({ ...settings, min_password_length: e.target.value })}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold"
            />
            <p className="text-[10px] text-gray-400 mt-1">Minimum character length required (must include special character from !@#$%)</p>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save System Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { API_BASE_URL } from '../config/apiConfig';
import AdminBreadcrumb from '../components/AdminBreadcrumb';

export default function SmallCaseEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    cagr: initialData?.cagr || '',
    min_investment: initialData?.min_investment || '',
    description: initialData?.description || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const url = editingId ? `${API_BASE_URL}/api/smallcases/${editingId}` : `${API_BASE_URL}/api/smallcases`;
    const method = editingId ? 'PUT' : 'POST';

    setLoading(true);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formData.name,
          cagr: parseFloat(formData.cagr),
          min_investment: parseFloat(formData.min_investment),
          description: formData.description
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save smallcase');
      }

      setSuccess(true);
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs space-y-6 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <div className="mb-3">
            <AdminBreadcrumb
              onNavigateHome={onBack}
              items={[
                { label: 'Smallcases', onClick: onBack },
                { label: editingId ? `Edit: ${formData.name || 'Smallcase'}` : 'Create Smallcase Strategy' }
              ]}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Small Case Offering' : 'Add New Small Case Offering'}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : editingId ? 'Update Smallcase' : 'Create Smallcase'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Smallcase saved successfully! Redirecting...
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Small Case Name</label>
          <input
            type="text"
            required
            placeholder="e.g. All Weather Investing Strategy"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Expected CAGR (%)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 14.5"
              value={formData.cagr}
              onChange={(e) => setFormData({ ...formData, cagr: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Minimum Investment (₹)</label>
            <input
              type="number"
              required
              placeholder="e.g. 5000"
              value={formData.min_investment}
              onChange={(e) => setFormData({ ...formData, min_investment: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Strategy Description</label>
          <textarea
            required
            rows="6"
            placeholder="Detailed description of the investment methodology and risk profile..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-sans focus:outline-none focus:border-gray-400 leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
}

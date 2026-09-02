import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from '../config/apiConfig';
import AdminBreadcrumb from '../components/AdminBreadcrumb';

export default function StockEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    ticker: initialData?.ticker || '',
    name: initialData?.name || '',
    entry_price: initialData?.entry_price || '',
    target_price: initialData?.target_price || '',
    stop_loss: initialData?.stop_loss || '',
    weightage: initialData?.weightage || '',
    transaction_type: initialData?.transaction_type || 'BUY',
    sector: initialData?.sector || 'Equity'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const url = editingId ? `${API_BASE_URL}/api/portfolio/${editingId}` : `${API_BASE_URL}/api/portfolio`;
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
          ticker: formData.ticker,
          name: formData.name,
          entry_price: parseFloat(formData.entry_price),
          target_price: parseFloat(formData.target_price),
          stop_loss: parseFloat(formData.stop_loss),
          weightage: parseFloat(formData.weightage),
          transaction_type: formData.transaction_type,
          sector: formData.sector
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save stock holding');
      }

      setSuccess(true);
      toast.success(editingId ? 'Stock entry updated' : 'Stock entry added to portfolio');
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save stock entry');
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
                { label: 'Model Portfolio', onClick: onBack },
                { label: editingId ? `Edit: ${formData.ticker || formData.name || 'Stock'}` : 'Add Stock Holding' }
              ]}
            />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Portfolio Stock Entry' : 'Add Stock Holding Entry'}
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
            {loading ? 'Saving...' : editingId ? 'Update Stock Entry' : 'Create Stock Entry'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Stock holding saved successfully! Redirecting...
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Stock Ticker / Symbol</label>
            <input
              type="text"
              required
              placeholder="e.g. RELIANCE, TCS, INFYS"
              value={formData.ticker}
              onChange={(e) => setFormData({ ...formData, ticker: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold uppercase focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Reliance Industries Ltd."
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Entry Price (₹)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 2450.5"
              value={formData.entry_price}
              onChange={(e) => setFormData({ ...formData, entry_price: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Target Price (₹)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 3100.0"
              value={formData.target_price}
              onChange={(e) => setFormData({ ...formData, target_price: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-emerald-700 focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Stop Loss (₹)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 2200.0"
              value={formData.stop_loss}
              onChange={(e) => setFormData({ ...formData, stop_loss: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-red-700 focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Allocation Weightage (%)</label>
            <input
              type="number"
              step="0.1"
              required
              placeholder="e.g. 15.0"
              value={formData.weightage}
              onChange={(e) => setFormData({ ...formData, weightage: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Transaction Type</label>
            <select
              value={formData.transaction_type}
              onChange={(e) => setFormData({ ...formData, transaction_type: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
            >
              <option value="BUY">BUY</option>
              <option value="SELL">SELL</option>
            </select>
          </div>
        </div>
      </form>
    </div>
  );
}

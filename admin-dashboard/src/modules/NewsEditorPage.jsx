import React, { useState } from 'react';
import { ArrowLeft, Save, Newspaper, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function NewsEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    link: initialData?.link || '#'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const url = editingId ? `${API_BASE_URL}/api/news/${editingId}` : `${API_BASE_URL}/api/news`;
    const method = editingId ? 'PUT' : 'POST';

    setLoading(true);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to save news article');
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
    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs space-y-6 w-full max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-200">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to News Feed
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <Newspaper className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Market News Article' : 'Publish Market News Article'}
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
            {loading ? 'Saving...' : editingId ? 'Update Article' : 'Publish News'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Market news article saved successfully! Redirecting...
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Article Headline / Title</label>
            <input
              type="text"
              required
              placeholder="e.g. RBI Maintains Repo Rate at 6.5% with Focused Stance"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">External Source URL (Optional)</label>
            <input
              type="text"
              placeholder="e.g. https://economictimes.indiatimes.com/..."
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-gray-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">News Summary Payload</label>
          <textarea
            required
            rows="8"
            placeholder="Official advisory summary of market developments, macroeconomic trends, or regulatory announcements..."
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-sans focus:outline-none focus:border-gray-400 leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
}

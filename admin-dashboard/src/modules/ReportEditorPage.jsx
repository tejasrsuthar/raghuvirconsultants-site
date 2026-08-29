import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, FileText, CheckCircle2 } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function ReportEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    content: initialData?.content || '',
    doc_link: initialData?.doc_link || '',
    status: initialData?.status || 'published'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const url = editingId ? `${API_BASE_URL}/api/reports/${editingId}` : `${API_BASE_URL}/api/reports`;
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
        throw new Error(errData.detail || 'Failed to save report');
      }

      setSuccess(true);
      toast.success(editingId ? 'Research report updated' : 'Research report published');
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 1000);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Failed to save research report');
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
            <ArrowLeft className="w-4 h-4" /> Back to Research Reports
          </button>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-gray-700" />
            {editingId ? 'Edit Research Report' : 'Create Research Report'}
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
            {loading ? 'Saving...' : editingId ? 'Update Report' : 'Publish Report'}
          </button>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Research Report saved successfully! Redirecting...
        </div>
      )}

      {error && <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold">{error}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Report Title</label>
            <input
              type="text"
              required
              placeholder="e.g. IT Sector Quarterly Analysis & Valuation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-gray-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Publication Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none"
            >
              <option value="published">Published (Live for Subscribed Investors)</option>
              <option value="draft">Draft (Internal)</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
            Google Doc / External Report Link (Optional)
          </label>
          <input
            type="url"
            placeholder="e.g. https://docs.google.com/document/d/12345/edit"
            value={formData.doc_link}
            onChange={(e) => setFormData({ ...formData, doc_link: e.target.value })}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 focus:outline-none focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Report Content & Summary</label>
          <textarea
            required
            rows="12"
            placeholder="Detailed research publication, financial analysis, target metrics, and investment thesis..."
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-sans focus:outline-none focus:border-gray-400 leading-relaxed"
          />
        </div>
      </form>
    </div>
  );
}

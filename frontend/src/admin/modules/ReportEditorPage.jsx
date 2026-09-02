import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Save, ArrowLeft, Upload } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';
import AdminBreadcrumb from '../components/AdminBreadcrumb';

const EyebrowLabel = ({ children }) => (
  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

const PillButton = ({ children, variant = 'primary', ...props }) => {
  const base = "px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm";
  const variants = {
    primary: "bg-gray-900 hover:bg-black text-white disabled:opacity-50",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800",
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
};

export default function ReportEditorPage({ initialData, onBack, onSaveSuccess }) {
  const [editingId] = useState(initialData?.id || null);
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    summary: initialData?.summary || '',
    plan_tier: initialData?.plan_tier_required || 'reports_yearly',
    parent_report_id: initialData?.parent_report_id || ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem('token');

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingId && !file) {
      toast.error("A PDF file is required to publish a new report.");
      return;
    }
    setLoading(true);
    
    try {
      if (editingId) {
        // Just calling publish for now if editing. 
        // In full implementation, we might update metadata.
        const res = await fetch(`${API_BASE_URL}/api/reports/admin/${editingId}/publish`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Failed to publish report');
        toast.success("Report published!");
      } else {
        // Upload new draft
        const data = new FormData();
        data.append('title', formData.title);
        if (formData.summary) data.append('summary', formData.summary);
        data.append('plan_tier', formData.plan_tier);
        if (formData.parent_report_id) data.append('parent_report_id', formData.parent_report_id);
        data.append('file', file);

        const res = await fetch(`${API_BASE_URL}/api/reports/admin/upload`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.detail || 'Upload failed');
        }
        
        // Auto publish it
        const result = await res.json();
        await fetch(`${API_BASE_URL}/api/reports/admin/${result.id}/publish`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success("Research report uploaded and published!");
      }
      if (onSaveSuccess) onSaveSuccess();
    } catch (err) {
      toast.error(err.message || 'Failed to save report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F3F0EE] border border-gray-200 rounded-[40px] p-10 shadow-sm w-full max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-8 mb-8 border-b border-gray-300/50">
        <div>
          <AdminBreadcrumb onNavigateHome={onBack} items={[{ label: 'Research Reports', onClick: onBack }, { label: editingId ? 'Edit Report' : 'Upload Report' }]} />
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3 mt-3">
            <FileText className="w-8 h-8 text-gray-700" />
            {editingId ? 'Edit Report' : 'Upload Research Report'}
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <PillButton variant="secondary" type="button" onClick={onBack}>Cancel</PillButton>
          <PillButton variant="primary" onClick={handleSave} disabled={loading}>
            <Save className="w-4 h-4" /> {loading ? 'Saving...' : (editingId ? 'Publish' : 'Upload & Publish')}
          </PillButton>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="md:col-span-2">
            <EyebrowLabel>Report Title</EyebrowLabel>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#F9F8F6] border-none rounded-2xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Enter the title of the research report"
            />
          </div>

          <div className="md:col-span-2">
            <EyebrowLabel>Summary / Description</EyebrowLabel>
            <textarea
              rows="3"
              value={formData.summary}
              onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
              className="w-full px-5 py-4 bg-[#F9F8F6] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Brief summary of the report..."
            />
          </div>

          <div>
            <EyebrowLabel>Access Tier</EyebrowLabel>
            <select
              value={formData.plan_tier}
              onChange={(e) => setFormData({ ...formData, plan_tier: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#F9F8F6] border-none rounded-2xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
            >
              <option value="reports_yearly">Reports Yearly Plan</option>
              <option value="portfolio_yearly">Portfolio Yearly Plan</option>
            </select>
          </div>

          <div>
            <EyebrowLabel>Addendum To (Optional Parent ID)</EyebrowLabel>
            <input
              type="text"
              value={formData.parent_report_id}
              onChange={(e) => setFormData({ ...formData, parent_report_id: e.target.value })}
              className="w-full px-5 py-3.5 bg-[#F9F8F6] border-none rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="Leave blank if standalone"
            />
          </div>

          {!editingId && (
            <div className="md:col-span-2">
              <EyebrowLabel>Upload PDF</EyebrowLabel>
              <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-3xl cursor-pointer bg-[#F9F8F6] hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="mb-2 text-sm text-gray-500 font-semibold">
                    {file ? file.name : <><span className="text-gray-900">Click to upload</span> or drag and drop</>}
                  </p>
                  <p className="text-xs text-gray-400">PDF documents only</p>
                </div>
                <input type="file" className="hidden" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
              </label>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FileText, Plus, RefreshCw, Lock, Unlock } from 'lucide-react';
import ReportEditorPage from './ReportEditorPage';
import { API_BASE_URL } from '../config/apiConfig';

export default function ResearchReportsManager() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reports/admin`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      } else {
        toast.error('Failed to load reports');
      }
    } catch (e) {
      toast.error('Network error loading reports');
    } finally {
      setLoading(false);
    }
  };

  if (showEditor) {
    return (
      <ReportEditorPage
        initialData={editingItem}
        onSaveSuccess={() => {
          setShowEditor(false);
          fetchReports();
        }}
        onBack={() => setShowEditor(false)}
      />
    );
  }

  return (
    <div className="w-full space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center bg-[#F3F0EE] p-6 sm:p-10 rounded-[40px] shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full text-gray-900 shadow-sm">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Research Publishing</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">Manage and publish institutional research reports.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => fetchReports()} className="p-3 bg-white rounded-full shadow-sm text-gray-600 hover:text-gray-900 transition-colors">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              setShowEditor(true);
            }}
            className="bg-gray-900 hover:bg-black text-white px-6 py-3 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" /> Publish New Report
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-sm text-gray-500 font-medium animate-pulse">Loading reports...</div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gray-200 rounded-[40px] text-gray-500 font-medium">
            No research reports found. Click "Publish New Report" to get started.
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} className="bg-white rounded-[32px] p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center border border-gray-100 shadow-xs hover:shadow-sm transition-shadow gap-6 group">
              <div className="flex items-center gap-6">
                <div className="bg-[#F3F0EE] h-16 w-16 rounded-full flex items-center justify-center text-gray-900 shadow-inner shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-900 transition-colors">{report.title}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs font-semibold text-gray-500 uppercase tracking-widest">
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full" />
                    <span className="flex items-center gap-1">
                      {report.plan_tier_required.includes('portfolio') ? <Lock className="w-3 h-3 text-amber-500" /> : <Unlock className="w-3 h-3 text-emerald-500" />}
                      Tier: {report.plan_tier_required}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${report.status === 'published' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                  {report.status}
                </span>
                <button
                  onClick={() => {
                    setEditingItem(report);
                    setShowEditor(true);
                  }}
                  className="bg-gray-50 hover:bg-gray-100 text-gray-900 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

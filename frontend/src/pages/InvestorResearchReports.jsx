import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Lock, FileText, ChevronRight } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';
import toast from 'react-hot-toast';

export default function InvestorResearchReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock tier logic. In full implementation, decode JWT to check tier.
  // We'll assume the user has "reports_yearly" but not "portfolio_yearly" for demonstration,
  // or we can allow anything if they are an admin. We'll default to 'reports_yearly'.
  const userTier = "reports_yearly"; 

  useEffect(() => {
    if (!token) {
      navigate('/portal/login');
      return;
    }
    fetchReports();
  }, [token]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Investor route: /api/v1/reports/
      const res = await fetch(`${API_BASE_URL}/api/v1/reports/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data || []);
      }
    } catch (e) {
      toast.error("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId, title) => {
    const toastId = toast.loading("Preparing secure download...");
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/reports/${reportId}/download`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        throw new Error("Download failed. Check subscription tier.");
      }
      
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success("Download started", { id: toastId });
    } catch (e) {
      toast.error(e.message, { id: toastId });
    }
  };

  const isLocked = (requiredTier) => {
    if (requiredTier === 'portfolio_yearly' && userTier !== 'portfolio_yearly') return true;
    return false;
  };

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto min-h-screen relative overflow-hidden bg-[#F3F0EE]">
      {/* Ghost Watermark */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 text-[15rem] font-black text-gray-200/50 select-none pointer-events-none whitespace-nowrap z-0">
        RESEARCH
      </div>

      <div className="relative z-10">
        <Breadcrumb items={[{ label: 'Investor Dashboard', to: '/investor' }, { label: 'Research Reports' }]} />

        <div className="text-center mt-12 mb-20 max-w-2xl mx-auto">
          <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Investment Research</h1>
          <p className="mt-4 text-gray-600 font-medium">In-depth sector analysis and company valuations, published exclusively for our advisory clients.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-gray-500 font-bold uppercase tracking-widest text-sm">
            Loading Reports...
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-20 bg-white/50 backdrop-blur-md rounded-[40px] border border-gray-200 text-gray-500 font-medium shadow-sm max-w-3xl mx-auto">
            No published reports available yet.
          </div>
        ) : (
          <div className="relative">
            {/* Orbital Arc SVG Background (Decorative) */}
            <svg className="absolute top-1/2 left-0 w-full h-full -translate-y-1/2 -z-10 text-gray-300 pointer-events-none" viewBox="0 0 1000 200" preserveAspectRatio="none">
              <path d="M0,100 Q500,200 1000,100" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
            </svg>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 justify-items-center">
              {reports.map((report) => {
                const locked = isLocked(report.plan_tier_required);

                return (
                  <div key={report.id} className="relative group flex flex-col items-center max-w-xs text-center">
                    {/* Eyebrow Label */}
                    <span className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-white px-3 py-1 rounded-full shadow-sm">
                      {new Date(report.published_at || report.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                    </span>

                    {/* Circular Portrait Card */}
                    <div className="relative w-56 h-56 rounded-full bg-white shadow-xl border-4 border-[#F3F0EE] group-hover:border-blue-100 transition-colors flex items-center justify-center mb-6">
                      <FileText className={`w-16 h-16 ${locked ? 'text-gray-300' : 'text-blue-900'}`} />
                      
                      {/* Satellite CTA Button */}
                      <button 
                        onClick={() => !locked && handleDownload(report.id, report.title)}
                        disabled={locked}
                        className={`absolute bottom-0 right-4 translate-x-1/4 translate-y-1/4 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                          locked 
                            ? 'bg-[#A39E99] text-white cursor-not-allowed' 
                            : 'bg-gray-900 hover:bg-black text-white hover:scale-110 active:scale-95'
                        }`}
                      >
                        {locked ? <Lock className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                      </button>
                    </div>

                    {/* Title & Metadata */}
                    <h3 className="text-xl font-extrabold text-gray-900 leading-tight mb-2">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {report.summary || 'In-depth analysis report.'}
                    </p>
                    
                    {locked && (
                      <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        <Lock className="w-3 h-3" /> Upgrade to {report.plan_tier_required.split('_')[0]} Tier
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

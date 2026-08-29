import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, RefreshCw, Calendar, Download, Search } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorResearchReports() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [search, setSearch] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchReports();
  }, [token, page]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reports?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data.items || []);
        setPages(data.pages || 1);
        setSubscribed(true);
      } else {
        setSubscribed(false);
      }
    } catch (e) {
      setSubscribed(false);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) || 
    r.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Investor Dashboard', to: '/investor' },
          { label: 'Research Reports Service' }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest flex items-center gap-3">
            <FileText className="w-8 h-8 text-lime" /> Equity & Sector Research Reports
          </h1>
          <p className="text-sm text-textmuted mt-1">Exclusive SEBI-registered advisory research publications and insights</p>
        </div>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime text-forest shadow-xs">
          Active Subscription
        </span>
      </div>

      {!subscribed ? (
        <div className="bg-white border border-bordercolor p-12 rounded-3xl text-center shadow-sm">
          <FileText className="w-12 h-12 text-textmuted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-forest mb-2">Subscription Required</h3>
          <p className="text-sm text-textmuted max-w-md mx-auto mb-6">
            You do not currently have an active subscription to Research Reports.
          </p>
          <Link to="/services" className="btn-forest text-white px-6 py-3 rounded-full text-xs font-bold uppercase">
            Subscribe Now
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="relative mb-4">
              <Search className="w-4 h-4 text-textmuted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reports..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-sand border border-bordercolor rounded-2xl text-xs font-semibold focus:outline-none focus:border-forest"
              />
            </div>

            {loading ? (
              <div className="text-center py-8 text-xs text-textmuted">Loading reports...</div>
            ) : filteredReports.length === 0 ? (
              <div className="p-6 bg-white border border-bordercolor rounded-2xl text-center text-xs text-textmuted">
                No reports found matching your search.
              </div>
            ) : (
              filteredReports.map((report) => (
                <div
                  key={report.id}
                  onClick={() => setSelectedReport(report)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedReport?.id === report.id
                      ? 'bg-forest text-white border-forest shadow-md'
                      : 'bg-white border-bordercolor hover:border-forest/50 text-forest'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] opacity-75 mb-2 font-mono">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(report.published_at).toLocaleDateString()}
                    </span>
                    <span className="font-bold uppercase tracking-wider">PDF Available</span>
                  </div>
                  <h3 className="font-bold text-sm leading-snug mb-2">{report.title}</h3>
                  <p className={`text-xs line-clamp-2 ${selectedReport?.id === report.id ? 'text-white/80' : 'text-textmuted'}`}>
                    {report.content}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Report Reader Content */}
          <div className="lg:col-span-2 bg-white border border-bordercolor p-8 rounded-3xl shadow-sm min-h-[500px]">
            {selectedReport ? (
              <div>
                <div className="flex justify-between items-start mb-6 border-b border-bordercolor pb-6">
                  <div>
                    <span className="text-xs font-bold text-textmuted uppercase tracking-widest block mb-1">
                      Published: {new Date(selectedReport.published_at).toLocaleDateString()}
                    </span>
                    <h2 className="text-2xl font-extrabold text-forest">{selectedReport.title}</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedReport.doc_link && (
                      <a 
                        href={selectedReport.doc_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-blue-50 border border-blue-200 hover:bg-blue-100 px-3 py-2 rounded-full text-blue-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-blue-600" /> Open Google Doc
                      </a>
                    )}
                    <button 
                      onClick={() => alert("Downloading full PDF report...")}
                      className="bg-sand border border-bordercolor hover:border-forest p-2.5 rounded-full text-forest text-xs font-bold flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                  </div>
                </div>
                <div className="prose max-w-none text-sm text-forest/90 leading-relaxed whitespace-pre-wrap">
                  {selectedReport.content}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-textmuted">
                <FileText className="w-12 h-12 mb-3 text-textmuted/40" />
                <h4 className="font-bold text-forest text-base mb-1">Select a Research Report</h4>
                <p className="text-xs max-w-xs">Click on any report on the left panel to read the full research publication.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, TrendingUp, ShieldCheck, Info } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorModelPortfolio() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribed, setSubscribed] = useState(true);
  const [page, setPage] = useState(1);
  const [timeframe, setTimeframe] = useState('1Y');

  const performanceData = {
    '1Y': { portfolio: 24.5, fd: 5.5, govtBond: 6.0 },
    '3Y': { portfolio: 68.2, fd: 17.4, govtBond: 19.1 },
    '5Y': { portfolio: 142.0, fd: 30.7, govtBond: 33.8 },
  };

  const currentPerf = performanceData[timeframe];

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPortfolio();
  }, [token, page]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/portfolio?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data.items || []);
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

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Investor Dashboard', to: '/investor' },
          { label: 'Model Portfolio Service' }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-bordercolor pb-6 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-lime" /> Model Portfolio Allocation & Holdings
          </h1>
          <p className="text-sm text-textmuted mt-1">Multi-asset quantitative equity portfolio recommendations with target prices</p>
        </div>
        <span className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-lime text-forest shadow-xs">
          Active Subscription
        </span>
      </div>

      {!subscribed ? (
        <div className="bg-white border border-bordercolor p-12 rounded-3xl text-center shadow-sm">
          <Briefcase className="w-12 h-12 text-textmuted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-forest mb-2">Subscription Required</h3>
          <p className="text-sm text-textmuted max-w-md mx-auto mb-6">
            You do not currently have an active subscription to Model Portfolio Services.
          </p>
          <Link to="/services" className="btn-forest text-white px-6 py-3 rounded-full text-xs font-bold uppercase">
            Subscribe Now
          </Link>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Performance Benchmark Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-forest">
              <span className="text-xs font-bold uppercase tracking-widest text-textmuted">All-Weather Model Portfolio</span>
              <h3 className="text-3xl font-extrabold text-forest mt-2">+{currentPerf.portfolio}%</h3>
              <p className="text-xs text-lime-700 font-semibold mt-1">Alpha Generated: +{(currentPerf.portfolio - currentPerf.govtBond).toFixed(1)}% vs Bonds</p>
            </div>
            <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-blue-500">
              <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Fixed Deposit (FD) Benchmark</span>
              <h3 className="text-3xl font-extrabold text-gray-700 mt-2">+{currentPerf.fd}%</h3>
              <p className="text-xs text-textmuted mt-1">Standard Bank FD ~5.5% p.a.</p>
            </div>
            <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-purple-500">
              <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Govt 10Y Bond Benchmark</span>
              <h3 className="text-3xl font-extrabold text-gray-700 mt-2">+{currentPerf.govtBond}%</h3>
              <p className="text-xs text-textmuted mt-1">Government Yield ~6.0% p.a.</p>
            </div>
          </div>

          {/* Active Holdings Table */}
          <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm">
            <h3 className="text-xl font-bold text-forest mb-6">Active Model Portfolio Holdings</h3>
            {loading ? (
              <div className="text-center py-8 text-xs text-textmuted">Loading holdings...</div>
            ) : portfolio.length === 0 ? (
              <div className="text-center py-8 text-xs text-textmuted">No active stock holdings published yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-bordercolor text-textmuted font-bold uppercase tracking-wider">
                      <th className="py-3">Stock / Symbol</th>
                      <th className="py-3">Action</th>
                      <th className="py-3">Buy Price</th>
                      <th className="py-3">Target Price</th>
                      <th className="py-3">Stop Loss</th>
                      <th className="py-3">Allocation Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-bordercolor/60">
                    {portfolio.map((item) => (
                      <tr key={item.id} className="hover:bg-sand/30">
                        <td className="py-4">
                          <div className="font-extrabold text-forest text-sm">{item.ticker}</div>
                          <div className="text-[10px] text-textmuted">{item.name}</div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                            item.transaction_type === 'BUY' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.transaction_type || 'BUY'}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-forest">₹{item.entry_price}</td>
                        <td className="py-4 font-extrabold text-emerald-600">₹{item.target_price}</td>
                        <td className="py-4 font-semibold text-red-600">₹{item.stop_loss}</td>
                        <td className="py-4 font-extrabold text-forest">{item.weightage}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

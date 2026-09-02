import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, PieChart, Star, TrendingUp, TrendingDown, Target } from 'lucide-react';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';
import toast from 'react-hot-toast';

export default function InvestorModelPortfolio() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock tier logic. 
  // For demo, assume investor does not have 'portfolio_yearly' unless specified.
  const userTier = "reports_yearly"; 

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchPortfolio();
  }, [token]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/portfolio/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
      }
    } catch (e) {
      toast.error("Failed to load portfolio.");
    } finally {
      setLoading(false);
    }
  };

  const isLocked = portfolio && portfolio.plan_tier_required === 'portfolio_yearly' && userTier !== 'portfolio_yearly';

  const getPieData = () => {
    if (!portfolio) return [];
    let data = portfolio.holdings.map(h => ({ name: h.ticker, value: h.weight }));
    if (portfolio.cash_weight > 0) {
      data.push({ name: 'CASH', value: portfolio.cash_weight });
    }
    return data;
  };

  const COLORS = ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

  return (
    <div className="pt-32 pb-32 px-6 max-w-7xl mx-auto min-h-screen bg-black text-[#F3F0EE]">
      <Breadcrumb items={[{ label: 'Investor Dashboard', to: '/investor' }, { label: 'Model Portfolio' }]} dark />

      <div className="text-center mt-12 mb-16 max-w-2xl mx-auto">
        <h1 className="text-5xl font-extrabold text-white tracking-tight">Model Portfolio</h1>
        <p className="mt-4 text-gray-400 font-medium">Live allocations, conviction scores, and rebalance history for the flagship strategy.</p>
      </div>

      {loading ? (
        <div className="text-center py-20 animate-pulse text-gray-500 font-bold uppercase tracking-widest text-sm">
          Loading Allocations...
        </div>
      ) : !portfolio ? (
        <div className="text-center py-20 border border-gray-800 rounded-[40px] text-gray-500 font-medium">
          No portfolio data available.
        </div>
      ) : (
        <div className="relative max-w-5xl mx-auto">
          {isLocked && (
            <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-xl rounded-[40px] flex flex-col items-center justify-center border border-gray-800 shadow-2xl">
              <Lock className="w-16 h-16 text-gray-500 mb-6" />
              <h2 className="text-3xl font-extrabold text-white mb-2">Portfolio Access Locked</h2>
              <p className="text-gray-400 font-medium max-w-md text-center mb-8">
                You need the {portfolio.plan_tier_required.split('_')[0].toUpperCase()} plan to view live allocations, target prices, and rationale.
              </p>
              <Link to="/investor/billing" className="bg-white hover:bg-gray-200 text-black px-8 py-4 rounded-full font-bold text-sm tracking-widest uppercase transition-colors">
                Upgrade Subscription
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Chart Column */}
            <div className="bg-[#111111] p-10 rounded-[40px] border border-gray-800 flex flex-col items-center justify-center">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-8">Allocation Weightings</h3>
              <div className="w-full h-80 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={120}
                      paddingAngle={2}
                      dataKey="value"
                      stroke="none"
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'CASH' ? '#4B5563' : COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toFixed(1)}%`} 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', color: '#fff' }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
                {/* Inner Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-white">100<span className="text-lg">%</span></span>
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total Weight</span>
                </div>
              </div>
            </div>

            {/* Holdings Column */}
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2 px-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ticker</span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Conviction / Weight</span>
              </div>
              
              {portfolio.holdings.map((h, i) => (
                <div key={i} className="bg-[#111111] p-6 rounded-3xl border border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gray-600 transition-colors">
                  <div>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                      {h.ticker} 
                    </h4>
                    {h.rationale && <p className="text-xs text-gray-500 mt-1 max-w-[200px] truncate">{h.rationale}</p>}
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xl font-bold text-blue-400">{Number(h.weight).toFixed(1)}%</span>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star key={idx} className={`w-3 h-3 ${idx < h.conviction_score ? 'text-amber-400 fill-amber-400' : 'text-gray-700'}`} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {portfolio.cash_weight > 0 && (
                <div className="bg-[#1A1A1A] p-6 rounded-3xl border border-gray-800 border-dashed flex items-center justify-between">
                  <h4 className="text-lg font-black text-gray-400 uppercase tracking-tight">CASH</h4>
                  <span className="text-xl font-bold text-gray-300">{Number(portfolio.cash_weight).toFixed(1)}%</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-8 text-center text-xs font-bold text-gray-600 uppercase tracking-widest">
            Last Rebalanced: {new Date(portfolio.last_rebalanced_at).toLocaleDateString()}
          </div>
        </div>
      )}
    </div>
  );
}

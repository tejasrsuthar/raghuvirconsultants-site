import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, ShieldCheck, Award, Info } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';

export default function ModelPortfolioPerformance() {
  const [timeframe, setTimeframe] = useState('1Y');

  // Benchmark performance data points
  const performanceData = {
    '1Y': { portfolio: 24.5, fd: 5.5, govtBond: 6.0 },
    '3Y': { portfolio: 68.2, fd: 17.4, govtBond: 19.1 },
    '5Y': { portfolio: 142.0, fd: 30.7, govtBond: 33.8 },
  };

  const current = performanceData[timeframe];

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh]">
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        items={[
          { label: 'Investor Dashboard', to: '/investor' },
          { label: 'Model Portfolio Performance' }
        ]}
      />

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-bordercolor pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-forest flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-lime" /> Model Portfolio Performance
          </h1>
          <p className="text-sm text-textmuted mt-1">Comparative risk-adjusted returns benchmarked against traditional instruments</p>
        </div>

        {/* Timeframe Filter */}
        <div className="flex bg-[#EDEEE9]/50 p-1.5 rounded-full border border-bordercolor text-xs font-bold uppercase tracking-widest text-textmuted gap-1">
          {['1Y', '3Y', '5Y'].map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-4 py-2 rounded-full transition-all ${timeframe === tf ? 'bg-forest text-[#FAF9F6] shadow-sm' : 'hover:text-forest'}`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-forest">
          <span className="text-xs font-bold uppercase tracking-widest text-textmuted">All-Weather Model Portfolio</span>
          <h3 className="text-3xl font-extrabold text-forest mt-2">+{current.portfolio}%</h3>
          <p className="text-xs text-lime-700 font-semibold mt-1">Alpha Generated: +{(current.portfolio - current.govtBond).toFixed(1)}% vs Bonds</p>
        </div>
        <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-blue-500">
          <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Fixed Deposit (FD) Benchmark</span>
          <h3 className="text-3xl font-extrabold text-gray-700 mt-2">+{current.fd}%</h3>
          <p className="text-xs text-textmuted mt-1">Standard Bank FD ~5.5% p.a.</p>
        </div>
        <div className="bg-white border border-bordercolor p-6 rounded-3xl shadow-sm border-l-4 border-l-purple-500">
          <span className="text-xs font-bold uppercase tracking-widest text-textmuted">Govt 10Y Bond Benchmark</span>
          <h3 className="text-3xl font-extrabold text-gray-700 mt-2">+{current.govtBond}%</h3>
          <p className="text-xs text-textmuted mt-1">Government Yield ~6.0% p.a.</p>
        </div>
      </div>

      {/* Chart Visualization */}
      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm mb-10">
        <h3 className="text-lg font-bold text-forest mb-6 flex items-center gap-2">
          Cumulative Growth Comparison ({timeframe})
        </h3>
        
        {/* Custom SVG Bar Comparison */}
        <div className="space-y-6">
          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-forest">Raghuvir Model Portfolio</span>
              <span className="text-forest">+{current.portfolio}%</span>
            </div>
            <div className="w-full h-4 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-forest rounded-full transition-all duration-700" style={{ width: `${Math.min(current.portfolio, 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-blue-600">Fixed Deposit (5.5% Benchmark)</span>
              <span className="text-blue-600">+{current.fd}%</span>
            </div>
            <div className="w-full h-4 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(current.fd, 100)}%` }} />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-bold mb-2">
              <span className="text-purple-600">Govt Bonds (6.0% Benchmark)</span>
              <span className="text-purple-600">+{current.govtBond}%</span>
            </div>
            <div className="w-full h-4 bg-sand rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full transition-all duration-700" style={{ width: `${Math.min(current.govtBond, 100)}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-bordercolor flex items-center gap-2 text-xs text-textmuted">
          <Info className="w-4 h-4 text-forest shrink-0" />
          <span>Past performance is not indicative of future returns. Benchmarks derived from official RBI 10-Year G-Sec yields and major scheduled commercial bank fixed deposit rates.</span>
        </div>
      </div>
    </div>
  );
}

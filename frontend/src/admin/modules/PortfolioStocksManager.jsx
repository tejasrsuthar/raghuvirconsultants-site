import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Briefcase, Save, Plus, Trash2, PieChart } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function PortfolioStocksManager() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [holdings, setHoldings] = useState([]);
  const [cashWeight, setCashWeight] = useState(100);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/portfolio/admin`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      if (res.ok) {
        const data = await res.json();
        setPortfolio(data);
        setHoldings(data.holdings || []);
        setCashWeight(data.cash_weight || 100);
      } else {
        toast.error('Failed to load portfolio');
      }
    } catch (e) {
      toast.error('Network error loading portfolio');
    } finally {
      setLoading(false);
    }
  };

  const handleAddHolding = () => {
    setHoldings([...holdings, { ticker: '', weight: 0, conviction_score: 3, entry_price: null, target_price: null, rationale: '' }]);
  };

  const handleRemoveHolding = (index) => {
    const newHoldings = [...holdings];
    newHoldings.splice(index, 1);
    setHoldings(newHoldings);
  };

  const handleHoldingChange = (index, field, value) => {
    const newHoldings = [...holdings];
    if (field === 'weight' || field === 'conviction_score') {
        value = Number(value);
    }
    newHoldings[index][field] = value;
    setHoldings(newHoldings);
  };

  const handleSave = async () => {
    const totalWeight = holdings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0) + Number(cashWeight);
    if (Math.abs(totalWeight - 100) > 0.01) {
      toast.error(`Total weight must be exactly 100%. Currently: ${totalWeight}%`);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/portfolio/admin/rebalance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          holdings: holdings.map(h => ({
            ...h,
            entry_price: h.entry_price || null,
            target_price: h.target_price || null
          })),
          cash_weight: Number(cashWeight)
        })
      });
      if (res.ok) {
        toast.success("Portfolio rebalanced successfully!");
        fetchPortfolio();
      } else {
        const err = await res.json();
        toast.error(err.detail || "Rebalance failed");
      }
    } catch (e) {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  const totalCurrentWeight = holdings.reduce((sum, h) => sum + (Number(h.weight) || 0), 0) + Number(cashWeight);
  const isValid = Math.abs(totalCurrentWeight - 100) <= 0.01;

  if (loading) return <div className="p-10 text-center text-gray-500">Loading portfolio...</div>;

  return (
    <div className="w-full space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center bg-[#F3F0EE] p-10 rounded-[40px] shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full text-gray-900 shadow-sm">
            <PieChart className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Model Portfolio</h1>
            <p className="text-sm text-gray-600 mt-1 font-medium">Rebalance portfolio allocations and manage conviction scores.</p>
          </div>
        </div>
        <div>
          <button
            onClick={handleSave}
            disabled={saving || !isValid}
            className="bg-gray-900 hover:bg-black disabled:bg-gray-400 text-white px-8 py-4 rounded-full font-bold text-sm tracking-wide flex items-center gap-2 shadow-md transition-all"
          >
            <Save className="w-4 h-4" /> {saving ? 'Rebalancing...' : 'Execute Rebalance'}
          </button>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Current Allocations</h2>
          <div className={`px-4 py-2 rounded-full font-bold text-xs ${isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
            Total Weight: {totalCurrentWeight.toFixed(2)}%
          </div>
        </div>

        <div className="space-y-4">
          {/* Cash Position */}
          <div className="flex items-center gap-4 p-5 bg-gray-50 rounded-3xl border border-gray-200">
             <div className="w-32 font-bold text-gray-900">CASH</div>
             <div className="flex-1 flex items-center gap-3">
               <input 
                  type="range" 
                  min="0" max="100" step="0.5" 
                  value={cashWeight} 
                  onChange={(e) => setCashWeight(e.target.value)}
                  className="flex-1 accent-gray-900"
               />
               <input
                 type="number"
                 value={cashWeight}
                 onChange={(e) => setCashWeight(e.target.value)}
                 className="w-20 px-3 py-2 border rounded-xl text-sm font-bold text-right"
                 min="0" max="100" step="0.1"
               />
               <span className="text-gray-500 font-bold">%</span>
             </div>
             <div className="w-10"></div>
          </div>

          {/* Holdings */}
          {holdings.map((h, i) => (
            <div key={i} className="flex flex-col gap-4 p-5 bg-white rounded-3xl border border-gray-200 shadow-xs">
              <div className="flex items-center gap-4">
                <input 
                  type="text" 
                  placeholder="TICKER" 
                  value={h.ticker} 
                  onChange={(e) => handleHoldingChange(i, 'ticker', e.target.value)}
                  className="w-32 px-4 py-2 border rounded-xl text-sm font-bold uppercase"
                />
                <div className="flex-1 flex items-center gap-3">
                  <input 
                    type="range" 
                    min="0" max="100" step="0.5" 
                    value={h.weight} 
                    onChange={(e) => handleHoldingChange(i, 'weight', e.target.value)}
                    className="flex-1 accent-blue-600"
                  />
                  <input
                    type="number"
                    value={h.weight}
                    onChange={(e) => handleHoldingChange(i, 'weight', e.target.value)}
                    className="w-20 px-3 py-2 border rounded-xl text-sm font-bold text-right"
                    min="0" max="100" step="0.1"
                  />
                  <span className="text-gray-500 font-bold">%</span>
                </div>
                <button onClick={() => handleRemoveHolding(i)} className="p-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pl-36">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Conviction (1-5)</label>
                  <select 
                    value={h.conviction_score}
                    onChange={(e) => handleHoldingChange(i, 'conviction_score', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm font-bold"
                  >
                    {[1,2,3,4,5].map(v => <option key={v} value={v}>{v} Stars</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Entry Price</label>
                  <input 
                    type="number" 
                    placeholder="Optional" 
                    value={h.entry_price || ''}
                    onChange={(e) => handleHoldingChange(i, 'entry_price', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Target Price</label>
                  <input 
                    type="number" 
                    placeholder="Optional" 
                    value={h.target_price || ''}
                    onChange={(e) => handleHoldingChange(i, 'target_price', parseFloat(e.target.value) || null)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Rationale</label>
                  <input 
                    type="text" 
                    placeholder="Brief rationale" 
                    value={h.rationale || ''}
                    onChange={(e) => handleHoldingChange(i, 'rationale', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl text-sm"
                  />
                </div>
              </div>
            </div>
          ))}

          <button 
            onClick={handleAddHolding}
            className="w-full py-4 border-2 border-dashed border-gray-300 rounded-3xl text-gray-500 hover:text-gray-900 hover:border-gray-500 hover:bg-gray-50 transition-all font-bold text-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add Holding
          </button>
        </div>
      </div>
    </div>
  );
}

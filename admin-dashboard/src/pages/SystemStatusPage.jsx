import React, { useEffect, useState } from 'react';
import { Server, Database, Cpu, HardDrive, RefreshCw, CheckCircle2, AlertCircle, Clock, ShieldCheck, Activity } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function SystemStatusPage() {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/system/status`);
      if (res.ok) {
        const data = await res.json();
        setStatusData(data);
        setLastRefreshed(new Date());
      }
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchStatus, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <div className="space-y-8 font-sans w-full">
      {/* Page Title & Auto-refresh Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">
            <Activity className="w-4 h-4 text-emerald-600 animate-pulse" /> Live Telemetry System
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">System Status & Infrastructure</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time health, version telemetry, database ping speed, and hardware telemetry</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 px-3 py-2 rounded-xl shadow-2xs cursor-pointer">
            <input 
              type="checkbox" 
              checked={autoRefresh} 
              onChange={(e) => setAutoRefresh(e.target.checked)} 
              className="rounded text-gray-900 focus:ring-0"
            />
            Auto-refresh (5s)
          </label>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-4 py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Now
          </button>
        </div>
      </div>

      {lastRefreshed && (
        <div className="text-[11px] text-gray-400 font-mono flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-gray-400" /> Last updated: {lastRefreshed.toLocaleTimeString()}
        </div>
      )}

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: API Services */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl">
              <Server className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Operational
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">API Backend Service</span>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">v{statusData?.api_version || '1.7.0'}</h3>
            <p className="text-xs text-gray-500 mt-0.5">FastAPI Python REST Service</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Uptime:</span>
              <span className="font-mono font-bold text-gray-900">{formatUptime(statusData?.uptime_seconds)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Environment:</span>
              <span className="font-semibold text-gray-800 capitalize">{statusData?.environment || 'Production'}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Frontend Client */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-[10px] font-bold uppercase tracking-wider rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Operational
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Frontend Client Application</span>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">v1.7.0</h3>
            <p className="text-xs text-gray-500 mt-0.5">React + Vite Web App</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Host Domain:</span>
              <span className="font-mono font-semibold text-gray-900">raghuvircons.local</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Port:</span>
              <span className="font-mono font-bold text-gray-900">80 (HTTP Default)</span>
            </div>
          </div>
        </div>

        {/* Card 3: Database Connection Speed */}
        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs space-y-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl">
              <Database className="w-6 h-6" />
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
              statusData?.database?.status === 'connected' ? 'bg-purple-100 text-purple-800' : 'bg-red-100 text-red-800'
            }`}>
              {statusData?.database?.status === 'connected' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
              {statusData?.database?.status === 'connected' ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Database Latency Ping</span>
            <h3 className="text-2xl font-extrabold text-gray-900 mt-1">{statusData?.database?.ping_ms || 0} ms</h3>
            <p className="text-xs text-gray-500 mt-0.5">{statusData?.database?.engine || 'MongoDB Engine'}</p>
          </div>

          <div className="pt-3 border-t border-gray-100 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Ping Latency:</span>
              <span className="font-mono font-bold text-emerald-600">{statusData?.database?.ping_ms} ms</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Capacity Indexing:</span>
              <span className="font-semibold text-gray-800">50,000+ Records</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hardware Telemetry Section */}
      <div className="bg-white border border-gray-200 p-8 rounded-3xl shadow-2xs space-y-6">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-gray-600" /> Server Resource Hardware Telemetry
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* CPU Load Gauge */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-700 uppercase flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-gray-500" /> CPU Usage Load
              </span>
              <span className="text-gray-900 font-mono">{statusData?.system_metrics?.cpu_usage_pct || 0}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gray-900 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(statusData?.system_metrics?.cpu_usage_pct || 0, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">Processor load telemetry metric across active cores</p>
          </div>

          {/* Memory Allocation Gauge */}
          <div className="space-y-3">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-gray-700 uppercase flex items-center gap-1.5">
                <HardDrive className="w-4 h-4 text-gray-500" /> RAM Memory Allocation
              </span>
              <span className="text-gray-900 font-mono">
                {statusData?.system_metrics?.memory_used_mb || 0} MB / {statusData?.system_metrics?.memory_total_mb || 0} MB ({statusData?.system_metrics?.memory_usage_pct || 0}%)
              </span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-emerald-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(statusData?.system_metrics?.memory_usage_pct || 0, 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-gray-400">Allocated memory usage out of total host RAM capacity</p>
          </div>
        </div>

        {/* System Information */}
        <div className="pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono text-gray-600">
          <div>
            <span className="font-bold text-gray-800">Platform OS:</span> {statusData?.system_metrics?.platform || 'macOS / Linux'}
          </div>
          <div>
            <span className="font-bold text-gray-800">Python Runtime:</span> v{statusData?.system_metrics?.python_version || '3.12.8'}
          </div>
        </div>
      </div>
    </div>
  );
}

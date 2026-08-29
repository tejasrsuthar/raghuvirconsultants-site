import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toaster, toast } from 'react-hot-toast';
import { 
  Home, Users, Briefcase, FileText, Settings, Bell, BookOpen, 
  Layers, Search, ChevronRight, ChevronDown, CheckCircle2, Shield, Plus, Sparkles, LogOut, Newspaper, Activity, User, ShieldCheck
} from 'lucide-react';
import SmallCasesManager from './SmallCasesManager';
import ServicesManager from './ServicesManager';
import PortfolioStocksManager from './PortfolioStocksManager';
import ResearchReportsManager from './ResearchReportsManager';
import InvestorUsersManager from './InvestorUsersManager';
import NotificationsManager from './NotificationsManager';
import BlogPostManager from './BlogPostManager';
import PlatformSettingsManager from './PlatformSettingsManager';
import NewsManager from './NewsManager';
import AdminProfilePage from './AdminProfilePage';
import SystemStatusPage from '../pages/SystemStatusPage';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function AdminAppLayout() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const [adminUsername, setAdminUsername] = useState('Admin');

  const getTabBreadcrumbLabel = (tab) => {
    switch (tab) {
      case 'home': return 'Dashboard Overview';
      case 'investors': return 'Investor Directory';
      case 'blogs': return 'Blog Posts';
      case 'services': return 'Services Catalog';
      case 'smallcases': return 'Smallcases Manager';
      case 'reports': return 'Research Reports';
      case 'portfolio': return 'Model Portfolio';
      case 'news': return 'News & Announcements';
      case 'notifications': return 'Alerts & Broadcasts';
      case 'system-status': return 'System Status Telemetry';
      case 'admin-profile': return 'Admin Profile Settings';
      case 'settings': return 'Platform Settings';
      default: return tab;
    }
  };
  const [stats, setStats] = useState({ investors: 0, reports: 0, stocks: 0, blogs: 0 });
  const [profilePopoverOpen, setProfilePopoverOpen] = useState(false);
  const popoverRef = useRef(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    const user = localStorage.getItem('username');
    if (user) setAdminUsername(user);
    fetchOverviewStats();
  }, [token]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        setProfilePopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchOverviewStats = async () => {
    const headers = { 'Authorization': `Bearer ${token}` };
    try {
      const [invRes, repRes, stockRes, blogRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/investors?page=1&limit=1`, { headers }),
        fetch(`${API_BASE_URL}/api/reports?page=1&limit=1`, { headers }),
        fetch(`${API_BASE_URL}/api/portfolio?page=1&limit=1`, { headers }),
        fetch(`${API_BASE_URL}/api/blogs?page=1&limit=1`),
      ]);
      const invData = invRes.ok ? await invRes.json() : {};
      const repData = repRes.ok ? await repRes.json() : {};
      const stockData = stockRes.ok ? await stockRes.json() : {};
      const blogData = blogRes.ok ? await blogRes.json() : {};
      setStats({
        investors: invData.total || 0,
        reports: repData.total || 0,
        stocks: stockData.total || 0,
        blogs: blogData.total || 0
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Signed out of Admin Console');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans text-gray-900 flex justify-center">
      <Toaster 
        position="bottom-center"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#18181B',
            color: '#FFFFFF',
            borderRadius: '14px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '12px 18px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)'
          }
        }}
      />
      {/* Centered Application Shell: Sidebar + Content as a unified unit */}
      <div className="w-full max-w-[1440px] 2xl:max-w-[1560px] min-h-screen bg-white flex flex-col md:flex-row shadow-sm border-x border-[#E5E7EB]">
        {/* Zaga Left Sidebar */}
        <aside className="w-full md:w-64 bg-[#F6F6F6] border-r border-[#EBEBEB] p-5 flex flex-col justify-between shrink-0 min-h-screen">
        <div className="space-y-5">
          {/* Top Brand Logo */}
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#18181B] rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs">
                RC
              </div>
              <span className="font-extrabold text-sm tracking-tight text-[#18181B]">Raghuvir Consultants Admin</span>
            </div>
            <div className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] text-gray-500 font-mono shadow-xs">
              ⌘
            </div>
          </div>

          {/* + New Article Action Pill Button */}
          <button 
            onClick={() => setActiveTab('blogs')}
            className="w-full bg-white border border-[#E5E5E7] hover:bg-gray-50 py-2.5 px-4 rounded-full font-semibold text-xs text-gray-800 flex items-center justify-center gap-1.5 shadow-xs transition-all"
          >
            <Plus className="w-4 h-4 text-gray-500" /> New Article
          </button>

          {/* Search Box Pill */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="w-full pl-9 pr-14 py-2 bg-white border border-[#E5E5E7] rounded-full text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-gray-400 shadow-xs"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] font-mono text-gray-500 shadow-2xs">⌘</span>
              <span className="px-1.5 py-0.5 bg-white border border-[#E5E5E7] rounded text-[10px] font-mono text-gray-500 shadow-2xs">K</span>
            </div>
          </div>

          {/* Categorized Navigation Hierarchy */}
          <div className="space-y-4">
            {/* 1. Dashboard Overview */}
            <button
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                activeTab === 'home' 
                  ? 'bg-white text-gray-900 font-bold shadow-xs' 
                  : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Home className="w-4 h-4 text-gray-700" /> Dashboard
              </div>
            </button>

            {/* 2. Investors */}
            <button
              onClick={() => setActiveTab('investors')}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-full text-xs transition-all ${
                activeTab === 'investors' 
                  ? 'bg-white text-gray-900 font-bold shadow-xs' 
                  : 'text-[#4A4A4A] hover:text-gray-900 hover:bg-white/50 font-medium'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-gray-700" /> Investors
              </div>
              <span className="text-xs font-medium text-gray-400">{stats.investors}</span>
            </button>

            {/* 3. Site Static Content Group */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1 border-b border-[#EBEBEB]">
                Site Static Content
              </div>
              <div className="border-l border-gray-200/80 ml-4 pl-3.5 space-y-1 my-1.5">
                <button
                  onClick={() => setActiveTab('blogs')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'blogs' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-gray-600" /> Blog Posts
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{stats.blogs}</span>
                </button>

                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'services' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-gray-600" /> Services
                </button>

                <button
                  onClick={() => setActiveTab('smallcases')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'smallcases' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-gray-600" /> Smallcases
                </button>
              </div>
            </div>

            {/* 4. Premium Subscription Group */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1 border-b border-[#EBEBEB]">
                Premium Subscription
              </div>
              <div className="border-l border-gray-200/80 ml-4 pl-3.5 space-y-1 my-1.5">
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'reports' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-gray-600" /> Research Reports
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{stats.reports}</span>
                </button>

                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'portfolio' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-gray-600" /> Model Portfolio
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono">{stats.stocks}</span>
                </button>
              </div>
            </div>

            {/* 5. Misc Group */}
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-3 pb-1 border-b border-[#EBEBEB]">
                Misc
              </div>
              <div className="border-l border-gray-200/80 ml-4 pl-3.5 space-y-1 my-1.5">
                <button
                  onClick={() => setActiveTab('news')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'news' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5 text-gray-600" /> News Feed
                </button>

                <button
                  onClick={() => setActiveTab('notifications')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'notifications' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5 text-gray-600" /> Alerts
                </button>

                <button
                  onClick={() => setActiveTab('system-status')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === 'system-status' ? 'bg-white text-gray-900 font-bold shadow-xs' : 'text-[#4A4A4A] hover:text-gray-900 font-medium'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600" /> System Telemetry Status
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Admin Profile Menu & Popover */}
        <div className="pt-4 border-t border-[#EBEBEB] relative" ref={popoverRef}>
          {/* Profile Trigger Button */}
          <button
            onClick={() => setProfilePopoverOpen(!profilePopoverOpen)}
            className="w-full flex items-center justify-between p-2 rounded-2xl bg-white border border-[#E5E5E7] hover:bg-gray-50 transition-all shadow-xs"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                {adminUsername.substring(0, 1).toUpperCase()}
              </div>
              <div className="text-left">
                <span className="block text-xs font-bold text-gray-900 leading-tight">{adminUsername}</span>
                <span className="block text-[10px] text-gray-400">Super Admin</span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {/* Hover / Click Profile Popover Menu */}
          {profilePopoverOpen && (
            <div className="absolute bottom-14 left-0 w-full bg-white border border-gray-200 rounded-2xl shadow-lg p-2 z-50 space-y-1">
              <button
                onClick={() => {
                  setActiveTab('admin-profile');
                  setProfilePopoverOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <User className="w-4 h-4 text-gray-500" /> Edit Admin Profile
              </button>

              <button
                onClick={() => {
                  setActiveTab('settings');
                  setProfilePopoverOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-500" /> Platform Settings
              </button>

              <div className="border-t border-gray-100 my-1" />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Right Content Panel */}
      <main className="flex-1 w-full min-w-0 p-6 md:p-8 lg:p-10 overflow-y-auto bg-[#F9FAFB]">
        <div className="w-full space-y-8">
          {/* Top Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-200/70 pb-4">
              <AdminBreadcrumb
                onNavigateHome={() => setActiveTab('home')}
                items={activeTab === 'home' ? [{ label: 'Dashboard' }] : [{ label: getTabBreadcrumbLabel(activeTab) }]}
              />

            {/* Metric Badges */}
            <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-gray-200/80 shadow-2xs text-xs font-semibold text-gray-600">
              <span className="px-3 py-1 bg-gray-100/80 rounded-xl">{stats.investors} Investors</span>
              <span className="px-3 py-1 bg-gray-100/80 rounded-xl">{stats.reports} Reports</span>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-xl font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 99.9% Uptime
              </span>
            </div>
          </div>

          {/* Tab Components Rendering */}
          {activeTab === 'home' && (
            <div className="space-y-8">
              {/* Metric Overview Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Investors</span>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.investors}</h3>
                  <span className="text-xs font-semibold text-emerald-600 mt-2 inline-block">Active Subscriptions</span>
                </div>
                <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Research Reports</span>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.reports}</h3>
                  <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Published Research</span>
                </div>
                <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Model Portfolio Stocks</span>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.stocks}</h3>
                  <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Active Stock Allocations</span>
                </div>
                <div className="bg-white border border-[#EAEAEA] p-6 rounded-3xl shadow-2xs">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Blog Posts</span>
                  <h3 className="text-3xl font-extrabold text-gray-900 mt-2">{stats.blogs}</h3>
                  <span className="text-xs font-semibold text-gray-500 mt-2 inline-block">Articles with Tags</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'investors' && <InvestorUsersManager />}
          {activeTab === 'blogs' && <BlogPostManager />}
          {activeTab === 'services' && <ServicesManager />}
          {activeTab === 'smallcases' && <SmallCasesManager />}
          {activeTab === 'reports' && <ResearchReportsManager />}
          {activeTab === 'portfolio' && <PortfolioStocksManager />}
          {activeTab === 'news' && <NewsManager />}
          {activeTab === 'notifications' && <NotificationsManager />}
          {activeTab === 'system-status' && <SystemStatusPage />}
          {activeTab === 'admin-profile' && <AdminProfilePage onBack={() => setActiveTab('home')} />}
          {activeTab === 'settings' && <PlatformSettingsManager />}
        </div>
      </main>
      </div>
    </div>
  );
}

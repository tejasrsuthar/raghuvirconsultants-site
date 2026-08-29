import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  User, Mail, Phone, MapPin, Calendar, CreditCard, ShieldCheck, 
  CheckCircle2, AlertCircle, Edit, ArrowLeft, Key, Lock, Briefcase, 
  FileText, Clock, ExternalLink, Shield, Sparkles, MessageSquare, 
  TrendingUp, Award, Check, Copy, UserX, UserCheck, Send, MoreHorizontal,
  Share2, Eye, HelpCircle, Activity, Bookmark
} from 'lucide-react';
import AdminBreadcrumb from '../components/AdminBreadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorFacebookProfilePage({ 
  investor, 
  onBack, 
  onEdit, 
  onToggleStatus, 
  onResetPassword,
  onUpdateInvestor 
}) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, about, contact, subscriptions, security
  const [copiedField, setCopiedField] = useState(null);
  const [adminNote, setAdminNote] = useState(investor?.admin_notes || '');
  const [savingNote, setSavingNote] = useState(false);
  const [showPan, setShowPan] = useState(false);

  // Quick Subscription toggle state
  const [subReports, setSubReports] = useState(!!investor?.subscribed_reports);
  const [subPortfolio, setSubPortfolio] = useState(!!investor?.subscribed_portfolio);
  const [togglingSub, setTogglingSub] = useState(false);

  const token = localStorage.getItem('token');
  const isActive = (investor?.status || 'active') === 'active';

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`Copied ${fieldName} to clipboard!`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSaveAdminNote = async (e) => {
    e.preventDefault();
    setSavingNote(true);
    const toastId = toast.loading('Saving admin note...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${investor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...investor,
          admin_notes: adminNote
        })
      });
      if (res.ok) {
        toast.success('Admin note saved to investor profile!', { id: toastId });
        if (onUpdateInvestor) {
          onUpdateInvestor({ ...investor, admin_notes: adminNote });
        }
      } else {
        toast.error('Failed to save admin note', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error saving note', { id: toastId });
    } finally {
      setSavingNote(false);
    }
  };

  const handleToggleSubscription = async (serviceType) => {
    setTogglingSub(true);
    const nextReports = serviceType === 'reports' ? !subReports : subReports;
    const nextPortfolio = serviceType === 'portfolio' ? !subPortfolio : subPortfolio;

    const toastId = toast.loading(`Updating ${serviceType === 'reports' ? 'Research Reports' : 'Model Portfolio'} access...`);
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${investor.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...investor,
          subscribed_reports: nextReports,
          subscribed_portfolio: nextPortfolio
        })
      });
      if (res.ok) {
        if (serviceType === 'reports') setSubReports(nextReports);
        if (serviceType === 'portfolio') setSubPortfolio(nextPortfolio);
        toast.success(`Subscription access updated!`, { id: toastId });
        if (onUpdateInvestor) {
          onUpdateInvestor({ 
            ...investor, 
            subscribed_reports: nextReports, 
            subscribed_portfolio: nextPortfolio 
          });
        }
      } else {
        toast.error('Failed to update subscription', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error updating subscription', { id: toastId });
    } finally {
      setTogglingSub(false);
    }
  };

  const formattedRegDate = investor?.created_at 
    ? new Date(investor.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
    : 'Unknown';
    
  const formattedRegTime = investor?.created_at 
    ? new Date(investor.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
    : '';

  const avatarLetter = (investor?.full_name || investor?.username || 'I').charAt(0).toUpperCase();

  return (
    <div className="w-full space-y-6 font-sans">
      {/* Top Header Breadcrumbs */}
      <div className="bg-white border border-gray-200 rounded-3xl p-4 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <AdminBreadcrumb
              onNavigateHome={onBack}
              items={[
                { label: 'Investor Directory', onClick: onBack },
                { label: `${investor?.full_name || investor?.username || 'Investor'} Profile` }
              ]}
            />
            <h1 className="text-xl font-bold text-gray-900 mt-2 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Investor Profile Dossier
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onBack}
              className="px-4 py-2 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Directory
            </button>
            <button
              onClick={onEdit}
              className="px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Edit className="w-3.5 h-3.5" /> Edit Profile
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* FACEBOOK STYLE PROFILE HEADER & HERO BANNER CARD                         */}
      {/* ========================================================================= */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Cover Photo / Gradient Area */}
        <div className="relative h-48 sm:h-64 bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 overflow-hidden">
          {/* Subtle Geometric Overlay */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          
          {/* Cover Decorative Financial Waves */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Top Right Cover Badges */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-xs font-bold text-gray-800 shadow-sm flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" /> SEBI-Registered Client
            </span>
          </div>
        </div>

        {/* Profile Avatar & Info Bar */}
        <div className="px-6 sm:px-10 pb-6 relative">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between -mt-20 md:-mt-24 gap-6">
            
            {/* Avatar + Main Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* Circular Avatar */}
              <div className="relative group">
                <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full border-4 border-white bg-gradient-to-br from-blue-600 to-indigo-800 text-white flex items-center justify-center text-5xl font-black shadow-xl ring-2 ring-gray-100">
                  {avatarLetter}
                </div>
                {/* Active/Suspended indicator dot */}
                <div 
                  className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-md ${
                    isActive ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                  }`}
                  title={isActive ? 'Active Account' : 'Suspended Account'}
                >
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>

              {/* Names & Taglines */}
              <div className="mb-2 space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {investor?.full_name || investor?.username || 'Unnamed Investor'}
                  </h2>
                  <span className="p-1 bg-blue-50 text-blue-600 rounded-full" title="Verified Investor Account">
                    <CheckCircle2 className="w-5 h-5 fill-blue-600 text-white" />
                  </span>
                </div>

                <p className="text-xs font-mono font-medium text-gray-500">
                  @{investor?.username} • ID: <span className="text-gray-700">{investor?.id}</span>
                </p>

                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap pt-1">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                    isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {isActive ? 'Active Account' : 'Suspended'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                    {investor?.role || 'INVESTOR'}
                  </span>

                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                    {investor?.risk_profile || 'Moderate'} Risk
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons (Facebook Style) */}
            <div className="flex items-center gap-2.5 flex-wrap justify-center pb-2">
              <button
                onClick={onEdit}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <Edit className="w-4 h-4" /> Edit Profile
              </button>

              <button
                onClick={onToggleStatus}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs ${
                  isActive 
                    ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                {isActive ? 'Suspend' : 'Activate'}
              </button>

              <button
                onClick={onResetPassword}
                className="px-4 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
              >
                <Key className="w-4 h-4 text-gray-600" /> Reset Password
              </button>
            </div>
          </div>

          {/* Facebook-style Horizontal Tab Bar */}
          <div className="mt-8 border-t border-gray-200 pt-1 flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'overview', label: 'Overview & Timeline', icon: Activity },
              { id: 'about', label: 'About & KYC Compliance', icon: User },
              { id: 'contact', label: 'Contact & Residential Address', icon: MapPin },
              { id: 'subscriptions', label: 'Subscriptions & Portfolios', icon: Briefcase },
              { id: 'security', label: 'Security & Account Info', icon: ShieldCheck },
            ].map((tab) => {
              const Icon = tab.icon;
              const isCurrent = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold whitespace-nowrap transition-all ${
                    isCurrent
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN FACEBOOK BODY LAYOUT                                             */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Intro & Fast Details Sidebar (lg:col-span-4) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Card 1: Intro Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>Investor Intro</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed">
              Registered investor client profile on Raghuvir Consultants SEBI-compliant financial research platform.
            </p>

            <div className="space-y-3 pt-2 text-xs border-t border-gray-100">
              {/* Email with copy */}
              <div className="flex items-center justify-between text-gray-700 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <span className="truncate font-medium">{investor?.email || 'No email provided'}</span>
                </div>
                {investor?.email && (
                  <button
                    onClick={() => copyToClipboard(investor.email, 'Email')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                    title="Copy Email"
                  >
                    {copiedField === 'Email' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* Phone with copy */}
              <div className="flex items-center justify-between text-gray-700 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-mono font-medium">{investor?.phone || 'No phone provided'}</span>
                </div>
                {investor?.phone && (
                  <button
                    onClick={() => copyToClipboard(investor.phone, 'Phone')}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                    title="Copy Phone"
                  >
                    {copiedField === 'Phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              {/* PAN Number */}
              <div className="flex items-center justify-between text-gray-700 gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CreditCard className="w-4 h-4 text-amber-600 shrink-0" />
                  <span className="font-mono font-bold tracking-wider">
                    {investor?.pan_number 
                      ? (showPan ? investor.pan_number : `••••••${investor.pan_number.slice(-4)}`) 
                      : 'No PAN on record'}
                  </span>
                </div>
                {investor?.pan_number && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowPan(!showPan)}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                      title={showPan ? "Hide PAN" : "Reveal PAN"}
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => copyToClipboard(investor.pan_number, 'PAN Number')}
                      className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-700"
                      title="Copy PAN"
                    >
                      {copiedField === 'PAN Number' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="flex items-center gap-2.5 text-gray-700">
                <MapPin className="w-4 h-4 text-red-500 shrink-0" />
                <span className="font-medium">
                  {[investor?.city, investor?.state, investor?.country].filter(Boolean).join(', ') || 'Address not specified'}
                </span>
              </div>

              {/* Date of Birth & Gender */}
              <div className="flex items-center gap-2.5 text-gray-700">
                <Calendar className="w-4 h-4 text-purple-600 shrink-0" />
                <span>
                  DOB: <strong>{investor?.date_of_birth || 'Not recorded'}</strong> {investor?.gender ? `(${investor.gender})` : ''}
                </span>
              </div>

              {/* Registration Date & Time */}
              <div className="flex items-start gap-2.5 text-gray-700">
                <Clock className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-medium">Joined {formattedRegDate}</span>
                  {formattedRegTime && (
                    <span className="block text-[11px] text-gray-400 font-mono">at {formattedRegTime}</span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={onEdit}
              className="w-full py-2.5 mt-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-xl text-xs font-bold transition-all text-center"
            >
              Edit Details
            </button>
          </div>

          {/* Card 2: Active Subscriptions Summary */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center justify-between">
              <span>Subscription Status</span>
              <Award className="w-4 h-4 text-emerald-600" />
            </h3>

            <div className="space-y-3">
              {/* Research Reports */}
              <div className="p-3.5 bg-purple-50/60 border border-purple-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Research Reports</h4>
                    <p className="text-[10px] text-purple-700 font-medium">
                      {subReports ? 'Active Subscription' : 'Not Subscribed'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subReports}
                    disabled={togglingSub}
                    onChange={() => handleToggleSubscription('reports')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>

              {/* Model Portfolio */}
              <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">Model Portfolio</h4>
                    <p className="text-[10px] text-emerald-700 font-medium">
                      {subPortfolio ? 'Active Subscription' : 'Not Subscribed'}
                    </p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={subPortfolio}
                    disabled={togglingSub}
                    onChange={() => handleToggleSubscription('portfolio')}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Tabbed Content & Timeline Feed (lg:col-span-8) */}
        <div className="lg:col-span-8 space-y-6">

          {/* Facebook-style Admin Note / Status Box */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center font-bold text-xs">
                A
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-900">Admin Internal Notes</h3>
                <p className="text-[11px] text-gray-400">Private notes for this investor, visible only to admins</p>
              </div>
            </div>

            <form onSubmit={handleSaveAdminNote} className="space-y-3">
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Write private notes on investor interactions, payment references, KYC verification remarks..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingNote}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-full shadow-xs flex items-center gap-1.5 disabled:opacity-50 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  {savingNote ? 'Saving Note...' : 'Post Admin Note'}
                </button>
              </div>
            </form>
          </div>

          {/* TAB 1: OVERVIEW & TIMELINE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Timeline Card 1: Account Created */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Investor Account Registered</h4>
                      <p className="text-[11px] text-gray-400">{formattedRegDate} at {formattedRegTime}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase rounded-full">
                    Registration Event
                  </span>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl text-xs text-gray-700 space-y-2">
                  <p>
                    Account <strong>@{investor?.username}</strong> was created with role <strong>{investor?.role || 'INVESTOR'}</strong>.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-gray-200/60 text-[11px]">
                    <div>
                      <span className="text-gray-400 block">Initial Status</span>
                      <span className="font-bold capitalize text-emerald-700">{investor?.status || 'Active'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">KYC Status</span>
                      <span className="font-bold capitalize text-blue-700">{investor?.kyc_status || 'Verified'}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block">Referral Source</span>
                      <span className="font-bold text-gray-800">{investor?.referral_source || 'Direct Web'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Card 2: Financial KYC & PAN Status */}
              <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Indian Compliance & KYC Dossier</h4>
                      <p className="text-[11px] text-gray-400">SEBI Regulatory Verification Status</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase rounded-full">
                    {investor?.pan_number ? 'PAN Documented' : 'Pending PAN'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">PAN Card Number</span>
                    <span className="text-base font-mono font-extrabold text-gray-900 mt-1 block">
                      {investor?.pan_number || 'NOT PROVIDED'}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                      {investor?.pan_number ? '✓ 10-Digit Alphanumeric Verified' : 'Action: Request PAN card from client'}
                    </span>
                  </div>

                  <div className="p-4 bg-gray-50 border border-gray-100 rounded-2xl">
                    <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider block">Investment Risk Profile</span>
                    <span className="text-base font-bold text-gray-900 mt-1 block">
                      {investor?.risk_profile || 'Moderate Growth'}
                    </span>
                    <span className="text-[10px] text-blue-600 font-semibold mt-1 inline-block">
                      Advisory Strategy: Multi-Cap Equity
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ABOUT & KYC COMPLIANCE */}
          {activeTab === 'about' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">KYC & Identity Details</h3>
                <p className="text-xs text-gray-500 mt-0.5">Official compliance details filed for Indian securities operations</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Full Legal Name</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.full_name || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Username</span>
                  <p className="text-sm font-mono font-bold text-gray-900">@{investor?.username}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">PAN Card Number</span>
                  <p className="text-sm font-mono font-extrabold text-amber-900">{investor?.pan_number || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Date of Birth</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.date_of_birth || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Gender</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.gender || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Referral Source</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.referral_source || '—'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CONTACT & ADDRESS */}
          {activeTab === 'contact' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Residential Address & Communications</h3>
                <p className="text-xs text-gray-500 mt-0.5">Official communication channels and residence</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Email Address</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.email || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Mobile Phone</span>
                  <p className="text-sm font-mono font-bold text-gray-900">{investor?.phone || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1 sm:col-span-2">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Address Line 1</span>
                  <p className="text-sm font-medium text-gray-900">{investor?.address_line1 || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1 sm:col-span-2">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Address Line 2 / Landmark</span>
                  <p className="text-sm font-medium text-gray-900">{investor?.address_line2 || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">City</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.city || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">State</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.state || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Postal Code / Pincode</span>
                  <p className="text-sm font-mono font-bold text-gray-900">{investor?.pincode || '—'}</p>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Country</span>
                  <p className="text-sm font-bold text-gray-900">{investor?.country || 'India'}</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SUBSCRIPTIONS & SERVICES */}
          {activeTab === 'subscriptions' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Subscription Entitlements & Services</h3>
                <p className="text-xs text-gray-500 mt-0.5">Manage advisory services accessible by this investor in their dashboard</p>
              </div>

              <div className="space-y-4">
                {/* Research Reports Service */}
                <div className="p-6 border border-gray-200 rounded-3xl space-y-4 bg-gradient-to-br from-purple-50/30 to-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-purple-100 text-purple-700 rounded-2xl">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Institutional Research Reports Service</h4>
                        <p className="text-xs text-gray-500">Access to PDF analyses, Google Doc research notes, and target pricing</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSubscription('reports')}
                      disabled={togglingSub}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        subReports
                          ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {subReports ? '✓ Subscribed' : '+ Grant Access'}
                    </button>
                  </div>
                </div>

                {/* Model Portfolio Service */}
                <div className="p-6 border border-gray-200 rounded-3xl space-y-4 bg-gradient-to-br from-emerald-50/30 to-white">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-900">Model Portfolio Advisory Service</h4>
                        <p className="text-xs text-gray-500">Access to active stock weightages, entry/exit alerts, stop-loss telemetry</p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleSubscription('portfolio')}
                      disabled={togglingSub}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                        subPortfolio
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {subPortfolio ? '✓ Subscribed' : '+ Grant Access'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SECURITY & ACCOUNT */}
          {activeTab === 'security' && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-gray-900">Security & Authentication Audit</h3>
                <p className="text-xs text-gray-500 mt-0.5">Password management, security tokens, and timestamps</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 block">Password Authentication</span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">Strict bcrypt hashed password stored securely</span>
                  </div>
                  <button
                    onClick={onResetPassword}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-all"
                  >
                    Reset Password
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-gray-900 block">Account Status</span>
                    <span className="text-gray-500 block text-[11px] mt-0.5">
                      Currently {isActive ? 'Active (allowed to login)' : 'Suspended (logins blocked)'}
                    </span>
                  </div>
                  <button
                    onClick={onToggleStatus}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      isActive ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {isActive ? 'Suspend Account' : 'Activate Account'}
                  </button>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-1">
                  <span className="text-gray-400 font-bold uppercase tracking-wider text-[10px]">Database Account Identifier</span>
                  <p className="font-mono text-xs font-bold text-gray-800">{investor?.id}</p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

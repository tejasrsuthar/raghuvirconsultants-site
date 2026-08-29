import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, Save, User, Mail, Phone, Calendar, CreditCard, 
  MapPin, ShieldCheck, CheckCircle2, Lock, FileText, Briefcase, 
  Building, AlertCircle, Shield, Sparkles, UserCheck 
} from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorEditorPage({ investor, onBack, onSaveSuccess }) {
  const [formData, setFormData] = useState({
    id: investor?.id || '',
    username: investor?.username || '',
    full_name: investor?.full_name || '',
    email: investor?.email || '',
    phone: investor?.phone || '',
    pan_number: investor?.pan_number || '',
    date_of_birth: investor?.date_of_birth || '',
    address_line1: investor?.address_line1 || '',
    address_line2: investor?.address_line2 || '',
    pincode: investor?.pincode || '',
    city: investor?.city || '',
    state: investor?.state || '',
    country: investor?.country || 'India',
    role: investor?.role || 'investor',
    status: investor?.status || 'active',
    kyc_status: investor?.kyc_status || 'verified',
    risk_profile: investor?.risk_profile || 'Moderate',
    admin_notes: investor?.admin_notes || '',
    subscribed_reports: investor?.subscribed_reports || false,
    subscribed_portfolio: investor?.subscribed_portfolio || false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const token = localStorage.getItem('token');

  const handlePanChange = (e) => {
    // Format PAN automatically to uppercase alphanumeric, max 10 chars
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setFormData({ ...formData, pan_number: value });
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setError('');
    setSuccess(false);

    if (!formData.email.trim()) {
      setError('Email address is required.');
      toast.error('Email address is required');
      return;
    }

    if (formData.pan_number && formData.pan_number.length !== 10) {
      setError('PAN card number must be exactly 10 characters (e.g. ABCDE1234F).');
      toast.error('Invalid PAN card length');
      return;
    }

    setLoading(true);
    const toastId = toast.loading(`Updating investor profile for ${formData.username}...`);

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/investors/${formData.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          pan_number: formData.pan_number.trim(),
          date_of_birth: formData.date_of_birth,
          address_line1: formData.address_line1.trim(),
          address_line2: formData.address_line2.trim(),
          pincode: formData.pincode.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: formData.country.trim(),
          role: formData.role,
          status: formData.status,
          kyc_status: formData.kyc_status,
          risk_profile: formData.risk_profile,
          admin_notes: formData.admin_notes.trim(),
          subscribed_reports: formData.subscribed_reports,
          subscribed_portfolio: formData.subscribed_portfolio
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || 'Failed to update investor profile');
      }

      setSuccess(true);
      toast.success('Investor profile updated successfully!', { id: toastId });
      setTimeout(() => {
        if (onSaveSuccess) onSaveSuccess();
      }, 700);
    } catch (err) {
      setError(err.message);
      toast.error(err.message || 'Error updating profile', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Header & Breadcrumbs */}
      <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-500 hover:text-gray-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Investor Directory
            </button>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2.5">
              <UserCheck className="w-6 h-6 text-indigo-600" />
              Edit Investor Profile
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Account ID: <span className="font-mono text-gray-700 font-semibold">{formData.id || '—'}</span> &bull; Registered on: {new Date(investor?.created_at || Date.now()).toLocaleDateString()}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Saving Profile...' : 'Save Investor Profile'}
            </button>
          </div>
        </div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Profile saved successfully! Redirecting...
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-2xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-500" /> {error}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Basic Identity & KYC Details */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <User className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Personal Identity & KYC Credentials</h3>
              <p className="text-[11px] text-gray-500">Legal investor credentials, permanent username identifier, and identity verification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Full Name</label>
              <input
                type="text"
                placeholder="e.g. Harshit Suthar"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-gray-400" /> Username (Not Editable)
              </label>
              <input
                type="text"
                disabled
                value={formData.username}
                className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs font-mono font-bold text-gray-500 cursor-not-allowed"
                title="Username is permanently locked for account integrity"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Permanent system identifier</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-gray-400" /> Email Address
              </label>
              <input
                type="email"
                required
                placeholder="e.g. investor@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-gray-400" /> Mobile / Phone Number
              </label>
              <input
                type="tel"
                placeholder="e.g. +91 9876543210"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-gray-400" /> PAN Card Number
              </label>
              <input
                type="text"
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                value={formData.pan_number}
                onChange={handlePanChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-bold uppercase text-gray-900 focus:outline-none focus:border-indigo-500 tracking-wider"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">10-character Indian Tax / KYC ID</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-gray-400" /> Date of Birth
              </label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Account Role, Status, KYC & Risk Classification */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Governance, Security & Investor Risk Profile</h3>
              <p className="text-[11px] text-gray-500">Security permissions, account active status, compliance verification, and risk mandate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Account Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="investor">Investor (Client)</option>
                <option value="admin">Administrator (Full Access)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active (Access Granted)</option>
                <option value="suspended">Suspended (Access Temporarily Paused)</option>
                <option value="disabled">Disabled (Deactivated)</option>
                <option value="blacklisted">Blacklisted</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">KYC Compliance Status</label>
              <select
                value={formData.kyc_status}
                onChange={(e) => setFormData({ ...formData, kyc_status: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="verified">Verified (SEBI Compliant)</option>
                <option value="pending">Pending Review</option>
                <option value="unsubmitted">Not Submitted</option>
                <option value="rejected">Rejected / Needs Update</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Investor Risk Profile</label>
              <select
                value={formData.risk_profile}
                onChange={(e) => setFormData({ ...formData, risk_profile: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              >
                <option value="Conservative">Conservative (Capital Preservation)</option>
                <option value="Moderate">Moderate (Balanced Growth)</option>
                <option value="Aggressive">Aggressive (High Alpha)</option>
                <option value="HNI Portfolio">HNI / Institutional Client</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Residential & Communication Address */}
        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
            <MapPin className="w-5 h-5 text-amber-600" />
            <div>
              <h3 className="text-sm font-bold text-gray-900">Residential Address & Location</h3>
              <p className="text-[11px] text-gray-500">Official billing and correspondence street address</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Address Line 1</label>
              <input
                type="text"
                placeholder="e.g. Flat 402, Royal Palms, SG Highway"
                value={formData.address_line1}
                onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Address Line 2</label>
              <input
                type="text"
                placeholder="e.g. Near High Court, Bodakdev"
                value={formData.address_line2}
                onChange={(e) => setFormData({ ...formData, address_line2: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">City</label>
              <input
                type="text"
                placeholder="e.g. Ahmedabad"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">State</label>
              <input
                type="text"
                placeholder="e.g. Gujarat"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Country</label>
              <input
                type="text"
                placeholder="e.g. India"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">Pincode / Postal Code</label>
              <input
                type="text"
                placeholder="e.g. 380054"
                maxLength={10}
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Advisory Subscription Entitlements & Internal Notes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subscriptions Access */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-5">
            <div className="flex items-center gap-2.5 pb-4 border-b border-gray-100">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Active Advisory Subscriptions</h3>
                <p className="text-[11px] text-gray-500">Toggle premium research reports and model portfolio visibility</p>
              </div>
            </div>

            <div className="space-y-3">
              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                formData.subscribed_reports ? 'bg-purple-50/50 border-purple-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Institutional Research Reports</span>
                    <span className="text-[10px] text-gray-500">Access to PDF valuations & target model docs</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.subscribed_reports}
                  onChange={(e) => setFormData({ ...formData, subscribed_reports: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded-md focus:ring-purple-500 cursor-pointer"
                />
              </label>

              <label className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                formData.subscribed_portfolio ? 'bg-emerald-50/50 border-emerald-200' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Model Portfolio Allocation</span>
                    <span className="text-[10px] text-gray-500">Live multi-cap stock weightages & buy/sell prices</span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.subscribed_portfolio}
                  onChange={(e) => setFormData({ ...formData, subscribed_portfolio: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded-md focus:ring-emerald-500 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Internal CRM Notes */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <h3 className="text-sm font-bold text-gray-900">Internal Advisory Notes (Private CRM)</h3>
                <p className="text-[11px] text-gray-500">Confidential notes visible only to system administrators</p>
              </div>
            </div>

            <textarea
              rows="5"
              placeholder="e.g. Prefers large-cap equities. Investment horizon 5+ years. Spoke on phone regarding Q3 allocation..."
              value={formData.admin_notes}
              onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-sans text-gray-800 focus:outline-none focus:border-indigo-500 leading-relaxed"
            />
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-2.5 rounded-full border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-2.5 rounded-full bg-gray-900 hover:bg-black text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md disabled:opacity-50 transition-all"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving Profile...' : 'Save Investor Profile'}
          </button>
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Settings, Sliders, Shield, ArrowLeft, Database, Trash2, Download } from 'lucide-react';
import { z } from 'zod';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

const profileSchema = z.object({
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }).optional().or(z.literal('')),
});

export default function InvestorSettings() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const [activeTab, setActiveTab] = useState('profile');
  const [username] = useState(localStorage.getItem('username') || '');
  const [email, setEmail] = useState(localStorage.getItem('email') || '');
  const [phone, setPhone] = useState(localStorage.getItem('phone') || '');
  const [address, setAddress] = useState(localStorage.getItem('address') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Preference fields (mock / future settings)
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Security fields
  const [twoFactor, setTwoFactor] = useState(false);

  useEffect(() => {
    if (!token) {
      navigate('/portal/login');
    }
  }, [token]);

  const showToast = (title, message, type = 'success') => {
    setNotification({ title, message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');

    if (password) {
      const validationResult = profileSchema.safeParse({ password });
      if (!validationResult.success) {
        const msg = validationResult.error.issues?.[0]?.message || validationResult.error.errors?.[0]?.message || 'Invalid password';
        setError(msg);
        return;
      }
    }

    setLoading(true);

    try {
      const payload = { email, phone, address };
      if (password) payload.password = password;

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || "Failed to update profile");
      }

      const data = await res.json();
      if (data.email) localStorage.setItem('email', data.email);
      if (phone) localStorage.setItem('phone', phone);
      if (address) localStorage.setItem('address', address);

      showToast("Profile Updated", "Your profile information has been successfully saved.", "success");
      setPassword('');
    } catch (err) {
      setError(err.message);
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
          { label: 'Account Settings' }
        ]}
      />

      {/* Header */}
      <div className="flex justify-between items-center border-b border-bordercolor pb-6 mb-8">
        <div>
          <h1 className="text-4xl font-extrabold text-forest">Account Settings</h1>
        </div>
      </div>

      <div className="bg-white border border-bordercolor rounded-3xl shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[480px]">
        {/* Sidebar tabs */}
        <div className="w-full md:w-64 bg-sand/30 border-r border-bordercolor/80 p-6 flex flex-col gap-2 shrink-0">
          <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-textmuted mb-4 px-3">Investor Settings</h3>
          
          <button
            onClick={() => { setActiveTab('profile'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'profile' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <Shield className="w-4 h-4" /> Password & Profile
          </button>
          
          <button
            onClick={() => { setActiveTab('preferences'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'preferences' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <Sliders className="w-4 h-4" /> Preferences
          </button>
          
          <button
            onClick={() => { setActiveTab('privacy'); setError(''); }}
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
              activeTab === 'privacy' ? 'bg-forest text-white shadow-sm' : 'text-textmuted hover:bg-sand/65 hover:text-forest'
            }`}
          >
            <Database className="w-4 h-4" /> Privacy & Data
          </button>
        </div>

        {/* Tab contents */}
        <div className="flex-grow p-8">
          {error && (
            <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-xs border border-red-100 font-semibold max-w-lg">
              {error}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Credentials & Profile</h2>
              <p className="text-xs text-textmuted mb-6">Your profile details and password settings</p>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Username (Immutable)</label>
                  <input
                    type="text"
                    disabled
                    value={username}
                    className="w-full px-4 py-3 bg-[#f0f0ed]/60 border border-bordercolor/80 rounded-xl text-xs font-semibold text-textmuted cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="e.g. investor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Address</label>
                  <input
                    type="text"
                    placeholder="e.g. 101 Marine Drive, Mumbai"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">New Password (Optional)</label>
                  <input
                    type="password"
                    placeholder="Enter new password (min 7 chars with !@#$%)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-semibold"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-forest text-white px-8 py-3.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-forest-hover transition-all disabled:opacity-50 mt-4 shadow-md"
                >
                  {loading ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Preferences</h2>
              <p className="text-xs text-textmuted mb-6">Configure subscription alerts and portal preferences</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Email Notifications</h4>
                    <p className="text-[10px] text-textmuted font-medium">Receive alerts when new SEBI research reports are published</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => {
                      setEmailNotifications(e.target.checked);
                      showToast("Preference Updated", `Email notifications ${e.target.checked ? 'enabled' : 'disabled'}.`);
                    }}
                    className="w-4 h-4 accent-forest cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Dark Mode (Experimental)</h4>
                    <p className="text-[10px] text-textmuted font-medium">Apply dark themes across investor advisory grids</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={(e) => {
                      setDarkMode(e.target.checked);
                      showToast("Theme Selected", `Portal theme switched to ${e.target.checked ? 'Dark' : 'Light'} Mode.`);
                    }}
                    className="w-4 h-4 accent-forest cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="max-w-lg">
              <h2 className="text-xl font-bold text-forest mb-1">Privacy & Data Control</h2>
              <p className="text-xs text-textmuted mb-6">Manage your GDPR data rights and platform consent</p>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-sand border border-bordercolor/60 rounded-2xl">
                  <div>
                    <h4 className="text-xs font-bold text-forest uppercase tracking-wider mb-0.5">Export My Data</h4>
                    <p className="text-[10px] text-textmuted font-medium">Download a complete JSON archive of your profile, billing, and support history.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const toastId = toast.loading("Preparing data export...");
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/v1/users/export-data`, {
                          headers: { 'Authorization': `Bearer ${token}` }
                        });
                        const data = await res.json();
                        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `raghuvir_data_export_${new Date().getTime()}.json`;
                        a.click();
                        toast.success("Data export ready", { id: toastId });
                      } catch (e) {
                        toast.error("Failed to export data", { id: toastId });
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-bordercolor text-forest px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors shadow-sm whitespace-nowrap ml-4"
                  >
                    <Download className="w-4 h-4" /> Export JSON
                  </button>
                </div>

                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl">
                  <div className="flex items-start gap-4">
                    <Trash2 className="w-5 h-5 text-red-500 mt-1" />
                    <div>
                      <h4 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Delete Account</h4>
                      <p className="text-[10px] text-red-500/80 font-medium leading-relaxed mb-4">
                        Permanently delete your account. This action cannot be undone. All active subscriptions will be cancelled immediately, and your personal data will be anonymized.
                      </p>
                      <button
                        onClick={async () => {
                          if (window.confirm("WARNING: Are you absolutely sure you want to delete your account? This action is irreversible.")) {
                            try {
                              const res = await fetch(`${API_BASE_URL}/api/v1/users/delete-account`, {
                                method: 'DELETE',
                                headers: { 'Authorization': `Bearer ${token}` }
                              });
                              if (res.ok) {
                                localStorage.clear();
                                window.location.href = '/';
                              } else {
                                toast.error("Failed to delete account");
                              }
                            } catch (e) {
                              toast.error("Network error");
                            }
                          }
                        }}
                        className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-colors uppercase tracking-widest"
                      >
                        Delete My Account
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Notifications */}
      {notification && (
        <div className="pointer-events-none fixed inset-0 flex items-end px-4 py-6 sm:items-start sm:p-6 z-50 justify-end">
          <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-2xl bg-white border border-bordercolor shadow-lg ring-1 ring-black ring-opacity-5">
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className="text-xs font-bold text-forest uppercase tracking-wider">{notification.title}</p>
                  <p className="mt-1 text-sm text-textmuted">{notification.message}</p>
                </div>
                <div className="ml-4 flex flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => setNotification(null)}
                    className="inline-flex rounded-md bg-white text-textmuted hover:text-forest focus:outline-none"
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

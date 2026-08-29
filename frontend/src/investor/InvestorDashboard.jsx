import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Briefcase, Newspaper, Bell, ArrowRight, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function InvestorDashboard() {
  const navigate = useNavigate();
  const [reportsCount, setReportsCount] = useState(0);
  const [portfolioCount, setPortfolioCount] = useState(0);
  const [reportsSubscribed, setReportsSubscribed] = useState(false);
  const [portfolioSubscribed, setPortfolioSubscribed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Payment state
  const [upiTxId, setUpiTxId] = useState('');
  const [upiLoading, setUpiLoading] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [repRes, portRes, notifRes, newsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/reports?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/portfolio?page=1&limit=1`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/notifications?page=1&limit=5&status=published`),
        fetch(`${API_BASE_URL}/api/news?page=1&limit=4`),
      ]);

      if (repRes.ok) {
        const data = await repRes.json();
        setReportsCount(data.total || 0);
        setReportsSubscribed(true);
      } else {
        setReportsSubscribed(false);
      }

      if (portRes.ok) {
        const data = await portRes.json();
        setPortfolioCount(data.total || 0);
        setPortfolioSubscribed(true);
      } else {
        setPortfolioSubscribed(false);
      }

      if (notifRes.ok) setNotifications((await notifRes.json()).items || []);
      if (newsRes.ok) setNews((await newsRes.json()).items || []);
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleStripeCheckout = async (serviceType) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ service_type: serviceType })
      });
      const data = await res.json();
      if (data.checkout_url) {
        const mockWebhookRes = await fetch(`${API_BASE_URL}/api/payments/stripe-webhook`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            type: "checkout.session.completed",
            data: {
              object: {
                id: "cs_mock_success_id_" + Math.random().toString(36).substr(2, 9),
                customer_details: { email: localStorage.getItem('email') }
              }
            }
          })
        });
        if (mockWebhookRes.ok) {
          alert("Stripe sandbox transaction completed! Service unlocked.");
          fetchDashboardData();
        }
      }
    } catch (err) {
      alert("Checkout error: " + err.message);
    }
  };

  const handleUPIConfirm = async (e, serviceType) => {
    e.preventDefault();
    setUpiLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/payments/upi-confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ transaction_id: upiTxId, service_type: serviceType })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setUpiTxId('');
        fetchDashboardData();
      } else {
        alert(data.detail || 'Failed to verify UPI');
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUpiLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 max-w-6xl mx-auto min-h-[90vh] space-y-10">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={[{ label: 'Investor Dashboard' }]} />

      {/* Dashboard Top Bar */}
      <div className="flex justify-between items-end flex-wrap gap-4 border-b border-bordercolor pb-6">
        <div>
          <h1 className="text-4xl font-extrabold text-forest mb-2">Investor Dashboard</h1>
          <p className="text-sm text-textmuted">Welcome back, <strong>{localStorage.getItem('username') || 'Investor'}</strong></p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <Link to="/investor/settings" className="btn-forest text-[#FAF9F6] text-xs font-bold uppercase tracking-widest px-6 py-3.5 rounded-full shadow-md flex items-center gap-1 hover:bg-forest-hover transition-all">
            Account Settings
          </Link>
        </div>
      </div>

      {/* SECTION 1: News & Broadcast Announcements */}
      <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm space-y-6">
        <div className="flex justify-between items-center border-b border-bordercolor pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sand rounded-2xl text-forest">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-forest">News & Broadcast Announcements</h2>
              <p className="text-xs text-textmuted">Official advisory communications and live market news</p>
            </div>
          </div>
          <Link to="/news" className="text-xs font-bold text-forest hover:underline flex items-center gap-1">
            View All News <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Global Broadcast Notifications */}
        {notifications.length > 0 && (
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-widest text-textmuted block">Official Advisory Broadcasts</span>
            {notifications.slice(0, 2).map((n) => (
              <div key={n.id} className="bg-forest/5 border border-forest/20 p-4 rounded-2xl flex items-start gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-lime mt-1.5 shrink-0" />
                <div>
                  <h4 className="font-bold text-forest text-sm">{n.title}</h4>
                  <p className="text-xs text-textmuted mt-1 leading-relaxed">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Market News Stream Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {news.slice(0, 2).map((item) => (
            <div key={item.id} className="bg-sand/40 border border-bordercolor p-4 rounded-2xl flex flex-col justify-between">
              <div>
                <span className="text-[10px] text-textmuted font-mono block mb-1">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
                <h4 className="font-bold text-forest text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-textmuted line-clamp-2">{item.summary}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTION 2: Your Subscribed Services Grid */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-bordercolor pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-forest">Your Subscribed Services</h2>
            <p className="text-xs text-textmuted mt-0.5">Access each subscribed advisory service through its dedicated portal page</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Service Card 1: Research Reports */}
          <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-sand rounded-2xl text-forest">
                  <FileText className="w-7 h-7" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  reportsSubscribed ? 'bg-lime text-forest' : 'bg-red-50 text-red-600'
                }`}>
                  {reportsSubscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {reportsSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-forest mb-2">Research Reports Service</h3>
              <p className="text-xs text-textmuted leading-relaxed mb-6">
                Institutional-grade SEBI registered equity research reports, valuation models, and sector coverage notes.
              </p>

              {reportsSubscribed && (
                <div className="p-4 bg-sand/50 rounded-2xl border border-bordercolor/60 mb-6 flex items-center justify-between">
                  <span className="text-xs text-textmuted font-semibold">Available Reports:</span>
                  <span className="text-sm font-extrabold text-forest">{reportsCount} Published Reports</span>
                </div>
              )}
            </div>

            {reportsSubscribed ? (
              <Link
                to="/investor/services/reports"
                className="w-full btn-forest text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-sm"
              >
                Access Research Reports Page <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleStripeCheckout('reports')}
                  className="w-full btn-forest text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center"
                >
                  Subscribe for ₹999/mo (Card)
                </button>
                <form onSubmit={(e) => handleUPIConfirm(e, 'reports')} className="p-3 bg-sand rounded-2xl text-xs space-y-2 border border-bordercolor">
                  <span className="font-bold text-forest block">Pay via UPI (GPay/PhonePe) to: rc@upi</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Transaction Ref No"
                      required
                      value={upiTxId}
                      onChange={(e) => setUpiTxId(e.target.value)}
                      className="flex-grow px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs focus:outline-none"
                    />
                    <button type="submit" disabled={upiLoading} className="bg-forest text-white px-4 rounded-xl text-xs font-bold">
                      Verify
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Service Card 2: Model Portfolio */}
          <div className="bg-white border border-bordercolor p-8 rounded-3xl shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="p-3 bg-sand rounded-2xl text-forest">
                  <Briefcase className="w-7 h-7" />
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  portfolioSubscribed ? 'bg-lime text-forest' : 'bg-red-50 text-red-600'
                }`}>
                  {portfolioSubscribed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                  {portfolioSubscribed ? 'Subscribed' : 'Not Subscribed'}
                </span>
              </div>

              <h3 className="text-2xl font-bold text-forest mb-2">Model Portfolio Service</h3>
              <p className="text-xs text-textmuted leading-relaxed mb-6">
                All-weather quantitative multi-asset stock allocation portfolio with target prices, stop-losses, and performance benchmarks.
              </p>

              {portfolioSubscribed && (
                <div className="p-4 bg-sand/50 rounded-2xl border border-bordercolor/60 mb-6 flex items-center justify-between">
                  <span className="text-xs text-textmuted font-semibold">Active Holdings:</span>
                  <span className="text-sm font-extrabold text-forest">{portfolioCount} Stock Allocations</span>
                </div>
              )}
            </div>

            {portfolioSubscribed ? (
              <Link
                to="/investor/services/portfolio"
                className="w-full btn-forest text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center flex items-center justify-center gap-2 shadow-sm"
              >
                Access Model Portfolio Page <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <div className="space-y-3 pt-2">
                <button
                  onClick={() => handleStripeCheckout('portfolio')}
                  className="w-full btn-forest text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest text-center"
                >
                  Subscribe for ₹1,999/mo (Card)
                </button>
                <form onSubmit={(e) => handleUPIConfirm(e, 'portfolio')} className="p-3 bg-sand rounded-2xl text-xs space-y-2 border border-bordercolor">
                  <span className="font-bold text-forest block">Pay via UPI (GPay/PhonePe) to: rc@upi</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Transaction Ref No"
                      required
                      value={upiTxId}
                      onChange={(e) => setUpiTxId(e.target.value)}
                      className="flex-grow px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs focus:outline-none"
                    />
                    <button type="submit" disabled={upiLoading} className="bg-forest text-white px-4 rounded-xl text-xs font-bold">
                      Verify
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

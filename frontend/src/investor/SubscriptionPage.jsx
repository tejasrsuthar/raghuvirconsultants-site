import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { CreditCard, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';

export default function SubscriptionPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(null);

  const token = localStorage.getItem('token');

  const fetchSubscriptions = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/billing/subscriptions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscriptions(data);
      }
    } catch (e) {
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const handleSubscribe = async (planId) => {
    setSubscribing(planId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/billing/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan_id: planId })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        // Open Razorpay Checkout overlay
        const options = {
            key: "rzp_test_placeholder", // Hardcoded for frontend dev; ideally fetch from backend config
            subscription_id: data.gateway_subscription_id,
            name: "Raghuvir Consultants",
            description: "Subscription Payment",
            handler: function (response) {
                toast.success("Payment successful! Your subscription is now active.");
                fetchSubscriptions();
            },
            theme: {
                color: "#111827" // Mastercard grey/black
            }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        toast.error(data.detail || 'Subscription initialization failed');
      }
    } catch (e) {
      toast.error('Network error during checkout');
    } finally {
      setSubscribing(null);
    }
  };

  const handleCancel = async (subId) => {
    const toastId = toast.loading('Canceling subscription...');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/billing/subscriptions/${subId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        toast.success('Subscription canceled successfully. It will remain active until the period ends.', { id: toastId });
        fetchSubscriptions();
      } else {
        toast.error('Failed to cancel subscription', { id: toastId });
      }
    } catch (e) {
      toast.error('Network error', { id: toastId });
    }
  };

  const isSubscribedTo = (planId) => {
    return subscriptions.some(s => s.plan_id === planId && s.status === 'active');
  };

  const getActiveSubscription = (planId) => {
    return subscriptions.find(s => s.plan_id === planId && s.status === 'active');
  };

  const plans = [
    {
      id: "reports_yearly",
      name: "Research Reports",
      description: "Get full access to all our in-depth equity research reports for 1 year.",
      price: "₹15,000 / year"
    },
    {
      id: "portfolio_yearly",
      name: "Model Portfolio",
      description: "Access our exclusive model portfolio with real-time rebalancing updates.",
      price: "₹25,000 / year"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Billing & Subscriptions</h1>
        <p className="text-gray-600">Manage your subscription plans and payment methods.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {plans.map((plan) => {
            const activeSub = getActiveSubscription(plan.id);
            const isSubscribed = !!activeSub;
            
            return (
              <div key={plan.id} className={`bg-white border rounded-3xl p-6 shadow-sm flex flex-col ${isSubscribed ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-gray-200'}`}>
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-gray-50 rounded-2xl text-gray-900">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    {isSubscribed && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-2xl font-black text-gray-900">{plan.price}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-100">
                  {isSubscribed ? (
                    <div>
                      <p className="text-xs text-gray-500 mb-4 font-medium">
                        Subscription active until {new Date(activeSub.current_period_end).toLocaleDateString()}.
                      </p>
                      <button 
                        onClick={() => handleCancel(activeSub.id)}
                        className="w-full py-3 px-4 border-2 border-gray-200 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
                      >
                        Cancel Auto-Renew
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribing === plan.id}
                      className="w-full py-3 px-4 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
                    >
                      {subscribing === plan.id ? (
                        <><RefreshCw className="w-4 h-4 animate-spin" /> Initializing...</>
                      ) : (
                        'Subscribe Now'
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Disclaimer */}
      <div className="mt-8 flex items-start gap-3 p-4 bg-gray-50 rounded-2xl text-xs text-gray-500">
        <AlertCircle className="w-4 h-4 shrink-0 text-gray-400 mt-0.5" />
        <p>Payments are securely processed by Razorpay. Raghuvir Consultants does not store your credit card information. Subscriptions are billed annually and can be canceled at any time to prevent auto-renewal.</p>
      </div>
    </div>
  );
}

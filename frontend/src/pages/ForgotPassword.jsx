import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [debugToken, setDebugToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error('Failed to submit recovery request');
      }

      const data = await res.json();
      setSubmitted(true);
      if (data.debug_token) {
        setDebugToken(data.debug_token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex flex-col justify-center items-center min-h-[90vh]">
      <div className="w-full max-w-md mb-4">
        <Breadcrumb
          items={[
            { label: 'Portal Login', to: '/login' },
            { label: 'Forgot Password' }
          ]}
        />
      </div>
      <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-forest text-center">Recover Password</h2>
        <p className="text-sm text-textmuted text-center mb-8">We'll send you recovery instructions</p>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="space-y-4">
            <div className="p-6 bg-sage border border-bordercolor rounded-2xl text-center">
              <span className="text-2xl">📧</span>
              <h4 className="font-bold mt-2 text-forest">Check Your Email</h4>
              <p className="text-sm text-textmuted mt-1">If the email exists, reset instructions have been dispatched.</p>
            </div>
            {debugToken && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-xs text-yellow-800 break-all">
                <strong>Local Development Bypass:</strong><br />
                <Link to={`/reset-password?token=${debugToken}`} className="underline font-bold text-yellow-900 block mt-2">
                  Click here to Reset Password directly →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-2 disabled:opacity-55"
            >
              {loading ? 'Submitting...' : 'Send Recovery Link'}
            </button>
          </form>
        )}

        <p className="text-xs text-textmuted text-center mt-8">
          Back to <Link to="/portal/login" className="text-forest font-bold underline">Login</Link>
        </p>
      </div>
    </div>
  );
}

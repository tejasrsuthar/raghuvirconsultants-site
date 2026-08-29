import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = searchParams.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Reset failed');
      }

      setSuccess(true);
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
            { label: 'Reset Password' }
          ]}
        />
      </div>
      <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-forest text-center">Reset Password</h2>
        <p className="text-sm text-textmuted text-center mb-8">Enter your new secure password</p>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4 text-center">
            <div className="p-6 bg-sage border border-bordercolor rounded-2xl">
              <span className="text-2xl">🎉</span>
              <h4 className="font-bold mt-2 text-forest">Password Reset Successful</h4>
              <p className="text-sm text-textmuted mt-1">You can now sign in with your new password.</p>
            </div>
            <Link to="/login" className="block w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest text-center">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">New Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-2 disabled:opacity-55"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

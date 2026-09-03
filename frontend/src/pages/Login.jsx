import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import Breadcrumb from '../components/Breadcrumb';
import { API_BASE_URL } from '../config/apiConfig';

const loginSchema = z.object({
  email: z.string().min(3, { message: "Please enter a valid email or username." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long." }),
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectUrl = searchParams.get('redirect');

  const isErrored = (fieldName) => {
    if (!error) return false;
    const lowerErr = error.toLowerCase();
    if (fieldName === 'email' && (lowerErr.includes('email') || lowerErr.includes('username') || lowerErr.includes('incorrect'))) return true;
    if (fieldName === 'password' && (lowerErr.includes('password') || lowerErr.includes('incorrect'))) return true;
    return false;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Zod validation
    const validationResult = loginSchema.safeParse({ email, password });
    if (!validationResult.success) {
      const msg = validationResult.error.issues?.[0]?.message || validationResult.error.errors?.[0]?.message || 'Invalid email or password';
      setError(msg);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        const detailMsg = typeof data.detail === 'string'
          ? data.detail
          : (Array.isArray(data.detail) ? (data.detail[0]?.msg || 'Failed to authenticate') : 'Failed to authenticate');
        throw new Error(detailMsg);
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      if (redirectUrl === 'checkout') {
        navigate('/portal');
      } else {
        const userRole = (data.role || '').toLowerCase();
        navigate(userRole === 'admin' || userRole === 'super_admin' ? '/portal/admin' : '/portal');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credential }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || 'Google authentication failed');
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      const userRole = (data.role || '').toLowerCase();
      navigate(userRole === 'admin' || userRole === 'super_admin' ? '/portal/admin' : '/portal');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-32 pb-24 px-6 flex flex-col justify-center items-center min-h-[90vh]">
      <div className="w-full max-w-md mb-4">
        <Breadcrumb items={[{ label: 'Portal Login' }]} />
      </div>
      <div className="bg-white border border-bordercolor p-8 rounded-3xl w-full max-w-md shadow-sm">
        <h2 className="text-3xl font-extrabold mb-2 text-forest text-center">Welcome Back</h2>
        <p className="text-sm text-textmuted text-center mb-8">Access your premium advisory portal</p>

        {error && (
          <div className="p-4 mb-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-200 flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-textmuted mb-1">Email or Username</label>
            <input
              type="text"
              required
              placeholder="e.g. admin or investor@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-3 rounded-xl focus:outline-none text-xs font-semibold transition-colors ${
                isErrored('email')
                  ? 'bg-red-50/20 border-2 border-red-500 focus:border-red-600'
                  : 'bg-sand border border-bordercolor focus:border-forest'
              }`}
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-widest text-textmuted">Password</label>
              <Link to="/portal/forgot-password" className="text-xs text-textmuted hover:text-forest underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-3 pr-10 rounded-xl focus:outline-none transition-colors ${
                  isErrored('password')
                    ? 'bg-red-50/20 border-2 border-red-500 focus:border-red-600'
                    : 'bg-sand border border-bordercolor focus:border-forest'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-textmuted hover:text-forest p-1 focus:outline-none"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.122-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-forest text-white py-4 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-2 disabled:opacity-55"
          >
            {loading ? 'Logging in...' : 'Sign In'}
          </button>
        </form>

        <div className="relative my-6 text-center">
          <span className="bg-white px-3 text-xs text-textmuted relative z-10">OR</span>
          <div className="absolute w-full h-px bg-bordercolor top-1/2 left-0"></div>
        </div>

        <div className="flex justify-center w-full">
          <GoogleLogin
            onSuccess={credentialResponse => {
              handleGoogleSuccess(credentialResponse.credential);
            }}
            onError={() => {
              setError('Google Authentication Failed');
            }}
            theme="outline"
            size="large"
            shape="pill"
            width="320"
          />
        </div>

        <p className="text-xs text-textmuted text-center mt-8">
          Don't have an account? <Link to="/portal/signup" className="text-forest font-bold underline">Create one</Link>
        </p>
      </div>
    </div>
  );
}

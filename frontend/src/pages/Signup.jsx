import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { z } from 'zod';
import { GoogleLogin } from '@react-oauth/google';
import { 
  User, Mail, Phone, Lock, CreditCard, Calendar, 
  MapPin, ChevronDown, ChevronUp, ShieldCheck, Sparkles, CheckCircle2 
} from 'lucide-react';
import { API_BASE_URL } from '../config/apiConfig';
import Breadcrumb from '../components/Breadcrumb';

const signupSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long." }),
  fullName: z.string().optional(),
  email: z.string().email({ message: "Please enter a valid email address." }).min(1, { message: "Email is required." }),
  phone: z.string().optional(),
  panNumber: z.string().optional().refine(val => !val || val.length === 10, {
    message: "PAN card number must be exactly 10 characters (e.g. ABCDE1234F)."
  }),
  dateOfBirth: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  pincode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  gender: z.string().optional(),
  referralSource: z.string().optional(),
  password: z
    .string()
    .min(7, { message: "Password must be at least 7 characters long." })
    .refine((val) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(val), {
      message: "Password must contain at least one special character (!@#$%).",
    }),
});

function getPasswordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', width: 'w-0', color: '' };
  let score = 0;
  if (pwd.length >= 7) score += 1;
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 1;
  if (/\d/.test(pwd)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) score += 1;

  switch (score) {
    case 1:
      return { score: 1, label: 'Weak', width: 'w-1/4', color: 'bg-red-500', text: 'text-red-500' };
    case 2:
      return { score: 2, label: 'Fair', width: 'w-2/4', color: 'bg-orange-500', text: 'text-orange-500' };
    case 3:
      return { score: 3, label: 'Good', width: 'w-3/4', color: 'bg-yellow-500', text: 'text-yellow-600' };
    case 4:
      return { score: 4, label: 'Strong', width: 'w-full', color: 'bg-emerald-500', text: 'text-emerald-600' };
    default:
      return { score: 0, label: 'Very Weak', width: 'w-1/12', color: 'bg-red-400', text: 'text-red-400' };
  }
}

export default function Signup() {
  const navigate = useNavigate();

  // Basic Account Credentials
  const [username, setUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  // Residential Address Fields
  const [showAddressSection, setShowAddressSection] = useState(false);
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [pincode, setPincode] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [country, setCountry] = useState('India');

  // Metadata & Security
  const [gender, setGender] = useState('');
  const [referralSource, setReferralSource] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Silent IP location detection for auto-populating city & state
  useEffect(() => {
    let isMounted = true;
    const fetchGeo = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('https://ipapi.co/json/', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.city && !city) setCity(data.city);
            if (data.region && !state) setState(data.region);
            if (data.country_name && !country) setCountry(data.country_name);
          }
        }
      } catch (e) {
        // Non-blocking silent fallback
      }
    };
    fetchGeo();
    return () => { isMounted = false; };
  }, []);

  const strength = getPasswordStrength(password);

  const handlePanChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
    setPanNumber(val);
  };

  const isErrored = (fieldName) => {
    if (!error) return false;
    const lowerErr = error.toLowerCase();
    return lowerErr.includes(fieldName.toLowerCase());
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().replace(/\s+/g, '');

    // Zod validation
    const validationResult = signupSchema.safeParse({
      username: cleanUsername,
      fullName,
      email,
      phone,
      panNumber,
      dateOfBirth,
      addressLine1,
      addressLine2,
      pincode,
      city,
      state,
      country,
      gender,
      referralSource,
      password
    });

    if (!validationResult.success) {
      const msg = validationResult.error.issues?.[0]?.message || validationResult.error.errors?.[0]?.message || 'Invalid form input';
      setError(msg);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: cleanUsername,
        password,
        full_name: fullName.trim() || undefined,
        email: email.trim(),
        phone: phone.trim() || undefined,
        pan_number: panNumber.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        address_line1: addressLine1.trim() || undefined,
        address_line2: addressLine2.trim() || undefined,
        pincode: pincode.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || 'India',
        gender: gender || undefined,
        referral_source: referralSource || undefined,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        const detailMsg = typeof data.detail === 'string'
          ? data.detail
          : (Array.isArray(data.detail) ? (data.detail[0]?.msg || 'Registration failed') : 'Registration failed');
        throw new Error(detailMsg);
      }

      const data = await res.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);

      navigate('/portal');
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

      navigate('/portal');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="pt-28 pb-24 px-4 flex flex-col justify-center items-center min-h-[90vh]">
      <div className="w-full max-w-xl mb-4">
        <Breadcrumb items={[{ label: 'Investor Registration' }]} />
      </div>
      <div className="bg-white border border-bordercolor p-8 sm:p-10 rounded-3xl w-full max-w-xl shadow-sm">
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> SEBI-Registered Advisory Platform
          </span>
          <h2 className="text-3xl font-extrabold text-forest tracking-tight">Create Investor Profile</h2>
          <p className="text-xs text-textmuted mt-1">Join Raghuvir Consultants to access premium research and model portfolio allocations</p>
        </div>

        {error && (
          <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-2xl text-xs font-semibold border border-red-200 shadow-xs flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Legal Full Name & Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5" /> Full Name
              </label>
              <input
                type="text"
                placeholder="e.g. Harshit Suthar"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. harshitsuthar"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-medium font-mono focus:outline-none transition-colors ${
                  isErrored('username')
                    ? 'bg-red-50/20 border-2 border-red-500 focus:border-red-600'
                    : 'bg-sand border border-bordercolor focus:border-forest'
                }`}
              />
            </div>
          </div>

          {/* Email Address & Mobile Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-3 rounded-xl text-xs font-medium focus:outline-none transition-colors ${
                  isErrored('email')
                    ? 'bg-red-50/20 border-2 border-red-500 focus:border-red-600'
                    : 'bg-sand border border-bordercolor focus:border-forest'
                }`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Mobile Phone
              </label>
              <input
                type="tel"
                placeholder="+91 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* PAN Card & Date of Birth */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> PAN Card Number
              </label>
              <input
                type="text"
                maxLength={10}
                placeholder="e.g. ABCDE1234F"
                value={panNumber}
                onChange={handlePanChange}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl text-xs font-mono font-bold uppercase tracking-wider focus:outline-none focus:border-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Date of Birth
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Collapsible Residential Address Section */}
          <div className="border border-bordercolor rounded-2xl p-4 bg-sand/40">
            <button
              type="button"
              onClick={() => setShowAddressSection(!showAddressSection)}
              className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-forest"
            >
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-forest" />
                Residential Address & Location (Optional)
              </span>
              {showAddressSection ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAddressSection && (
              <div className="mt-4 space-y-3 pt-3 border-t border-bordercolor/60 animate-in fade-in duration-200">
                <input
                  type="text"
                  placeholder="Address Line 1 (Flat, House No, Building)"
                  value={addressLine1}
                  onChange={(e) => setAddressLine1(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
                />
                <input
                  type="text"
                  placeholder="Address Line 2 (Street, Landmark, Area)"
                  value={addressLine2}
                  onChange={(e) => setAddressLine2(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
                  />
                  <input
                    type="text"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
                  />
                  <input
                    type="text"
                    placeholder="Pincode"
                    maxLength={10}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-forest"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="px-3 py-2 bg-white border border-bordercolor rounded-xl text-xs font-medium focus:outline-none focus:border-forest"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Gender & Referral Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-medium"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1">
                How did you find us?
              </label>
              <select
                value={referralSource}
                onChange={(e) => setReferralSource(e.target.value)}
                className="w-full px-4 py-3 bg-sand border border-bordercolor rounded-xl focus:outline-none focus:border-forest text-xs font-medium"
              >
                <option value="">Select Source</option>
                <option value="Google Search">Google Search</option>
                <option value="Friend Recommendation">Friend / Word of mouth</option>
                <option value="Social Media Promotion">Facebook / Instagram / WhatsApp</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-textmuted mb-1">
              Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 7 characters with a special character (!@#$%)"
                className={`w-full px-4 py-3 pr-10 rounded-xl text-xs font-mono font-semibold focus:outline-none transition-colors ${
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
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 013.122-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password strength bar */}
            {password ? (
              <div className="mt-2 space-y-1">
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full transition-all duration-300 ${strength.color} ${strength.width}`}></div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-semibold text-textmuted">
                  <span>Password Strength:</span>
                  <span className={strength.text}>{strength.label}</span>
                </div>
              </div>
            ) : (
              <p className="text-[10px] text-textmuted mt-1">Min 7 characters with at least one special character (!@#$%)</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-forest text-white py-3.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-md mt-4 disabled:opacity-55 transition-all"
          >
            {loading ? 'Creating Investor Profile...' : 'Complete Registration'}
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

        <p className="text-xs text-textmuted text-center mt-6">
          Already registered? <Link to="/portal/login" className="text-forest font-bold underline">Log In</Link>
        </p>
      </div>
    </div>
  );
}

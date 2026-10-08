import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import logoSvg from '../../assets/logo.svg';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Verification workflow check (e.g. pending approval accounts)
    if (email.includes('pending') || email.includes('verify')) {
      setShowVerificationModal(true);
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid email or password');
      }

      // Store real JWT token and User session
      if (typeof login === 'function') {
        login(data.token, data.user);
      } else {
        localStorage.setItem('crm_token', data.token);
        localStorage.setItem('crm_user', JSON.stringify(data.user));
      }

      // Role-based destination based on verified DB user role
      const userRole = (data.user?.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin', { replace: true });
      } else if (userRole === 'faculty') {
        navigate('/faculty/dashboard', { replace: true });
      } else {
        navigate('/sales', { replace: true });
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] flex items-center justify-center p-4 font-['Onest'] relative">
      {/* Centered Login Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-[420px] w-full shadow-sm border border-[#050720]/10 text-center space-y-6">
        
         

{/* Institute Brand Logo */}
<div className="flex flex-col items-center justify-center select-none">
  <img 
    src={logoSvg} 
    alt="Radiquolab Design Institute" 
    className="h-10 w-auto object-contain" 
    draggable={false}
  />
</div>

        {/* Heading */}
        <h2 className="text-xl font-bold font-['Sora'] text-[#050720]">Login</h2>

        {/* Error Alert */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-lg text-left">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email input */}
          <div className="relative">
            <label className="text-[10px] text-[#050720]/50 absolute top-2 left-3.5 block font-medium pointer-events-none">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white pt-5 pb-2 px-3.5 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium focus:outline-none focus:border-[#FFB908]"
              placeholder="name@radiquolab.com"
              autoComplete="username"
              required
            />
          </div>

          {/* Password input */}
          <div className="relative">
            <label className="text-[10px] text-[#050720]/50 absolute top-2 left-3.5 block font-medium pointer-events-none">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white pt-5 pb-2 px-3.5 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium tracking-widest focus:outline-none focus:border-[#FFB908]"
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] disabled:opacity-50 text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors shadow-xs cursor-pointer"
          >
            {isLoading ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </div>

      {/* Login Verification Modal */}
      {showVerificationModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-[460px] w-full shadow-2xl text-center space-y-3">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">
              Your request has been forwarded to the admin
            </h3>
            <p className="text-xs text-[#050720]/60">
              You will receive the confirmation on your email
            </p>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors cursor-pointer"
              >
                Back to login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
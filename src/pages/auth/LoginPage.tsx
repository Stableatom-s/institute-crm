import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any; // Prevents the type collision on 'login' vs 'signIn'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verification workflow check (e.g. pending approval accounts)
    if (email.includes('pending') || email.includes('verify')) {
      setShowVerificationModal(true);
      return;
    }

    // Call context login/signIn if implemented
    if (typeof auth.login === 'function') {
      await auth.login(email, password);
    } else if (typeof auth.signIn === 'function') {
      await auth.signIn(email, password);
    }

    // Role-based redirect routing
    if (email.startsWith('admin') || email.includes('admin')) {
      navigate('/admin');
    } else if (email.startsWith('sales') || email.startsWith('sejal') || email.includes('sales')) {
      navigate('/sales');
    } else {
      navigate('/faculty');
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F5F7] flex items-center justify-center p-4 font-['Onest'] relative">
      {/* Centered Login Card */}
      <div className="bg-white rounded-2xl p-8 sm:p-10 max-w-[420px] w-full shadow-sm border border-[#050720]/10 text-center space-y-6">
        
        {/* Institute Brand Logo */}
        <div className="flex flex-col items-center justify-center select-none">
          <div className="text-xl font-extrabold tracking-tight font-['Sora'] text-[#050720] flex items-center">
            RADIQUO<span className="text-[#FFB908]">LAB</span>
          </div>
          <span className="text-[9px] tracking-[0.25em] text-[#050720]/60 font-semibold uppercase mt-0.5">
            Design Institute
          </span>
        </div>

        {/* Heading */}
        <h2 className="text-xl font-bold font-['Sora'] text-[#050720]">Login</h2>

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          {/* Email input */}
          <div className="relative">
            <label className="text-[10px] text-[#050720]/50 absolute top-2 left-3.5 block font-medium pointer-events-none">
              Email
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white pt-5 pb-2 px-3.5 rounded-lg border border-[#050720]/15 text-xs text-[#050720] font-medium focus:outline-none focus:border-[#FFB908]"
              placeholder="name@radiquolab.com"
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
              required
            />
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors shadow-xs"
          >
            Login
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
                className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] text-[#050720] rounded-lg text-xs font-bold font-['Sora'] transition-colors"
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
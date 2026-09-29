import React, { useState, useEffect } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const TopNav: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [inTime, setInTime] = useState<string>('09:30 AM');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Initialize or fetch persistent In-Time
  useEffect(() => {
    const savedTime = localStorage.getItem('radiquolab_punch_in');
    if (savedTime) {
      setInTime(savedTime);
    } else {
      const now = new Date();
      const formatted = now.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      localStorage.setItem('radiquolab_punch_in', formatted);
      setInTime(formatted);
    }
  }, []);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    localStorage.removeItem('radiquolab_punch_in');
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#050720]/10 px-8 flex items-center justify-between sticky top-0 z-20 font-['Onest']">
        {/* Left: Punch-in Timestamp */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-[#050720]/50 leading-none">
            In time
          </span>
          <span className="text-xs font-bold text-[#050720] font-['Sora'] mt-0.5">
            {inTime}
          </span>
        </div>

        {/* Right: Search, Notifications & Logout */}
        <div className="flex items-center gap-5">
          <div className="relative w-80 lg:w-96">
            <input
              type="text"
              placeholder="Search students, leads, demos, payments..."
              className="w-full bg-[#F8FAFC] text-xs text-[#050720] placeholder-[#050720]/40 pl-4 pr-9 py-2 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]/40 transition-colors"
            />
            <Search className="w-4 h-4 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="text-[#050720]/70 hover:text-[#050720] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Logout Trigger */}
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-[#050720]/80 hover:text-[#050720] transition-colors cursor-pointer"
          >
            <span>Logout</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-[420px] w-full shadow-2xl text-center space-y-3 font-['Onest']">
            <h3 className="text-base font-bold font-['Sora'] text-[#050720]">
              Log out of your account?
            </h3>
            <p className="text-xs text-[#050720]/60">
              You'll need to sign in again to access your dashboard.
            </p>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 bg-white border border-[#050720]/20 rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLogout}
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
import React, { useState } from 'react';
import { Search, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const TopNav: React.FC = () => {
  const { logout } = useAuth();
  const [inTime] = useState('09:30 AM');

  return (
    <header className="h-16 bg-white border-b border-[#050720]/10 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Punch-in Timestamp */}
      <div className="flex flex-col">
        <span className="text-[11px] font-medium text-[#050720]/50 font-['Onest'] leading-none">In time</span>
        <span className="text-xs font-bold text-[#050720] font-['Sora'] mt-0.5">{inTime}</span>
      </div>

      {/* Right: Search, Notifications & Logout */}
      <div className="flex items-center gap-5">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search students, leads, demos, payments..."
            className="w-full bg-[#F8FAFC] text-xs text-[#050720] placeholder-[#050720]/40 pl-4 pr-9 py-2 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]/40 transition-colors font-['Onest']"
          />
          <Search className="w-4 h-4 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2" />
        </div>

        <button className="text-[#050720]/70 hover:text-[#050720] p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-4 h-4" />
        </button>

        <button 
          onClick={logout}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#050720]/80 hover:text-[#050720] font-['Onest'] transition-colors"
        >
          <span>Logout</span>
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
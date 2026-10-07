import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  CalendarCheck2,
  Clock,
  PhoneCall,
  UserSquare2,
  Layers,
  CreditCard,
  Receipt,
  UserCheck,
  CalendarX,
  Users,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  // Normalize role check (case-insensitive)
  const normalizedRole = (user.role || '').toLowerCase();

  // 1. Sales Navigation
  const salesLinks = [
    { name: 'Dashboard', path: '/sales', icon: LayoutGrid },
    { name: 'My attendance', path: '/sales/attendance', icon: CalendarCheck2 },
    { name: 'Follow up', path: '/sales/follow-up', icon: Clock },
    { name: 'Leads', path: '/sales/leads', icon: PhoneCall },
    { name: 'Demo Management', path: '/sales/demos', icon: UserSquare2 },
    { name: 'Batch', path: '/sales/batches', icon: Layers },
    { name: 'Fees Management', path: '/sales/fees', icon: CreditCard },
    { name: 'Invoices', path: '/sales/invoices', icon: Receipt },
  ];

  // 2. Faculty Navigation
  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutGrid },
    { name: 'My attendance', path: '/faculty/attendance', icon: CalendarCheck2 },
    { name: 'Demo Management', path: '/faculty/demos', icon: UserSquare2 },
    { name: 'Batch', path: '/faculty/batches', icon: Layers },
    { name: 'Students', path: '/faculty/students', icon: UserCheck },
  ];

  // 3. Admin Navigation
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
    { name: 'Leads', path: '/admin/leads', icon: PhoneCall },
    { name: 'Demo Management', path: '/admin/demos', icon: UserSquare2 },
    { name: 'Batch', path: '/admin/batches', icon: Layers },
    { name: 'Students', path: '/admin/students', icon: UserCheck },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { name: 'Leave Management', path: '/admin/leave', icon: CalendarX },
    { name: 'Team', path: '/admin/team', icon: Users },
    { name: 'Invoices', path: '/admin/invoices', icon: Receipt },
  ];

  // Select list based on active role
  const menuItems = normalizedRole === 'admin'
    ? adminLinks
    : normalizedRole === 'faculty'
      ? facultyLinks
      : salesLinks;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Safe initial character extraction
  const avatarInitial = (user.name && user.name.trim().length > 0)
    ? user.name.trim().charAt(0).toUpperCase()
    : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <aside className="w-60 bg-white border-r border-[#050720]/10 flex flex-col justify-between shrink-0 h-screen select-none">
      <div>
        {/* Radiquolab Logo Header */}
        <div className="h-20 flex flex-col justify-center px-6">
          <div className="flex items-center gap-1">
            <span className="text-lg font-extrabold tracking-tight text-[#050720] font-['Sora']">
              RADIQUO<span className="text-[#FFB908]">LAB</span>
            </span>
          </div>
          <span className="text-[9px] font-bold tracking-[0.2em] text-[#050720]/60 uppercase -mt-1 font-['Sora']">
            DESIGN INSTITUTE
          </span>
        </div>

        {/* Dynamic Role Navigation List */}
        <nav className="px-3 space-y-1 mt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/sales' || item.path === '/faculty' || item.path === '/faculty/dashboard' || item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${isActive
                    ? 'bg-[#050720] text-white font-semibold shadow-xs'
                    : 'text-[#050720]/80 hover:bg-[#050720]/5 hover:text-[#050720]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile & Logout (Secured - Bypass Removed) */}
      <div
        onClick={() => navigate('/profile')}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#050720]/5 cursor-pointer transition-colors"
      >
        <div className="w-9 h-9 rounded-md bg-[#FFB908]/20 text-[#050720] overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 font-['Sora']">
          {avatarInitial}
        </div>
        <div className="overflow-hidden min-w-0 flex-1">
          <h4 className="text-xs font-bold text-[#050720] truncate font-['Sora']">
            {user.name || 'User'}
          </h4>
          <p className="text-[10px] text-[#050720]/50 truncate font-['Onest']">
            {user.email}
          </p>
        </div>
      </div>
    </aside>
  );
};
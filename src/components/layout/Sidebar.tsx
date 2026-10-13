import React from 'react';
import logoSvg from '../../assets/logo.svg';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  Video,
  PhoneCall,
  Users,
  GraduationCap,
  CalendarCheck2,
  CalendarX,
  UsersRound,
  Receipt,
  Clock,
  CreditCard,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const normalizedRole = (user.role || '').toLowerCase();

  // 1. Sales Navigation
  const salesLinks = [
    { name: 'Dashboard', path: '/sales', icon: LayoutGrid },
    { name: 'My attendance', path: '/sales/attendance', icon: CalendarCheck2 },
    { name: 'Follow up', path: '/sales/follow-up', icon: Clock },
    { name: 'Leads', path: '/sales/leads', icon: PhoneCall },
    { name: 'Demo Management', path: '/sales/demos', icon: Video },
    { name: 'Batch', path: '/sales/batches', icon: Users },
    { name: 'Fees Management', path: '/sales/fees', icon: CreditCard },
    { name: 'Invoices', path: '/sales/invoices', icon: Receipt },
  ];

  // 2. Faculty Navigation
  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty/dashboard', icon: LayoutGrid },
    { name: 'My attendance', path: '/faculty/attendance', icon: CalendarCheck2 },
    { name: 'Demo Management', path: '/faculty/demos', icon: Video },
    { name: 'Batch', path: '/faculty/batches', icon: Users },
    { name: 'Student', path: '/faculty/students', icon: GraduationCap },
  ];

  // 3. Admin Navigation (Matching Figma exactly)
  const adminLinks = [
    { name: 'Dashboard', path: '/admin', icon: LayoutGrid },
    { name: 'Demo Management', path: '/admin/demos', icon: Video },
    { name: 'Leads', path: '/admin/leads', icon: PhoneCall },
    { name: 'Batch', path: '/admin/batches', icon: Users },
    { name: 'Student', path: '/admin/students', icon: GraduationCap },
    { name: 'Attendance', path: '/admin/attendance', icon: CalendarCheck2 },
    { name: 'Leave', path: '/admin/leave', icon: CalendarX },
    { name: 'Team', path: '/admin/team', icon: UsersRound },
    { name: 'Invoices', path: '/admin/invoices', icon: Receipt },
  ];

  const menuItems = normalizedRole === 'admin'
    ? adminLinks
    : normalizedRole === 'faculty'
      ? facultyLinks
      : salesLinks;

  const avatarInitial = (user.name && user.name.trim().length > 0)
    ? user.name.trim().charAt(0).toUpperCase()
    : (user.email ? user.email.charAt(0).toUpperCase() : 'U');

  return (
    <aside className="w-56 bg-white border-r border-[#050720]/10 flex flex-col justify-between shrink-0 h-screen select-none font-['Onest']">
      <div>
        {/* Radiquolab Logo Header */}
        <div className="pt-6 pb-4 px-6 flex items-center justify-start select-none">
          <img 
            src={logoSvg} 
            alt="Radiquolab Design Institute" 
            className="h-9 w-auto object-contain" 
            draggable={false}
          />
        </div>

        {/* Navigation List */}
        <nav className="px-3 space-y-1 mt-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/sales' || item.path === '/faculty' || item.path === '/faculty/dashboard' || item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[13px] transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#050720] text-white font-semibold'
                      : 'text-[#050720]/80 font-medium hover:bg-[#050720]/5 hover:text-[#050720]'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Profile */}
      <div className="p-3 border-t border-[#050720]/5">
        <div
          onClick={() => navigate('/profile')}
          className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#050720]/5 cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-[#FFB908]/20 text-[#050720] overflow-hidden flex items-center justify-center font-bold text-xs shrink-0 font-['Sora']">
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
      </div>
    </aside>
  );
};
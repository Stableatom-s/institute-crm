import React from 'react';
import { NavLink } from 'react-router-dom';
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
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const Sidebar: React.FC = () => {
  const { user, setRole } = useAuth();
  if (!user) return null;

  // 1. Sales Navigation (Your Section)
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

  // 2. Faculty Navigation (Your Friend's Section)
  const facultyLinks = [
    { name: 'Dashboard', path: '/faculty', icon: LayoutGrid },
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
  const menuItems = user.role === 'ADMIN' 
    ? adminLinks 
    : user.role === 'FACULTY' 
    ? facultyLinks 
    : salesLinks;

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
                end={item.path === '/sales' || item.path === '/faculty' || item.path === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                    isActive
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

      {/* Footer Profile & Role Switcher */}
      <div className="p-4 border-t border-[#050720]/10 bg-white">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-md bg-[#E2E8F0] overflow-hidden flex items-center justify-center font-bold text-xs text-[#050720]">
            {user.name.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#050720] truncate font-['Sora']">{user.name}</h4>
            <p className="text-[11px] text-[#050720]/50 truncate font-['Onest']">{user.email}</p>
          </div>
        </div>

        {/* Role Toggle Bar */}
        <div className="grid grid-cols-3 gap-1 bg-[#F8FAFC] p-1 rounded-md border border-[#050720]/10">
          {(['SALES', 'FACULTY', 'ADMIN'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`py-1 text-[9px] font-bold rounded uppercase transition-colors ${
                user.role === r ? 'bg-[#FFB908] text-[#050720]' : 'text-[#050720]/50 hover:text-[#050720]'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
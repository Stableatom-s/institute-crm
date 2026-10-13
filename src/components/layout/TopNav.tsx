import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, LogOut, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { LogoutModal } from '../modals/LogoutModal';
import { batchService, BatchItem } from '../../services/batchService';
import { demoService, DemoItem } from '../../services/demoService';
import { leadService } from '../../services/leadService';
import { useAuth } from '../../context/AuthContext';

interface SearchResult {
  id: string;
  category: 'Student' | 'Batch' | 'Demo' | 'Lead';
  title: string;
  subtitle: string;
  route: string;
  state?: any;
}

export const TopNav: React.FC = () => {
  const navigate = useNavigate();
  const auth = useAuth() as any;
  const userRole = auth?.user?.role?.toLowerCase() || 'faculty';

  const [inTime, setInTime] = useState<string>('09:30 AM');
  const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);

  // Search State
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const q = query.toLowerCase().trim();
      const collected: SearchResult[] = [];

      try {
        const [batches, demos, leads] = await Promise.all([
          batchService.getAllBatches().catch(() => [] as BatchItem[]),
          demoService.getAllDemos().catch(() => [] as DemoItem[]),
          leadService.getAllLeads().catch(() => [] as any[]),
        ]);

        batches.forEach((batch) => {
          if (
            batch.batchCode?.toLowerCase().includes(q) ||
            batch.course?.toLowerCase().includes(q)
          ) {
            collected.push({
              id: `b-${batch.id}`,
              category: 'Batch',
              title: batch.batchCode,
              subtitle: `${batch.course} • ${batch.students?.length || 0} Students`,
              route: userRole === 'sales' ? '/sales/batches' : '/admin/batches',
              state: { batchCode: batch.batchCode },
            });
          }
        });

        demos.forEach((d) => {
          const dName = `${d.name} ${d.lastName || ''}`.trim();
          if (
            dName.toLowerCase().includes(q) ||
            d.course?.toLowerCase().includes(q) ||
            d.contactNo?.toLowerCase().includes(q)
          ) {
            collected.push({
              id: `demo-${d.id}`,
              category: 'Demo',
              title: `${dName} (${d.status})`,
              subtitle: `${d.course} • ${d.demoDate} (${d.timeSlot})`,
              route: userRole === 'sales' ? '/sales/demos' : '/admin/demos',
            });
          }
        });

        leads.forEach((l) => {
          const lName = `${l.firstName || ''} ${l.lastName || ''}`.trim();
          if (
            lName.toLowerCase().includes(q) ||
            l.contactNo?.toLowerCase().includes(q) ||
            l.course?.toLowerCase().includes(q)
          ) {
            collected.push({
              id: `lead-${l.id}`,
              category: 'Lead',
              title: lName,
              subtitle: `Lead: ${l.course || 'General'} • ${l.status || 'Active'}`,
              route: userRole === 'sales' ? '/sales/leads' : '/admin/leads',
            });
          }
        });

        setResults(collected.slice(0, 8));
        setIsOpen(true);
      } catch (err) {
        console.error('Global search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, userRole]);

  const handleSelectResult = (item: SearchResult) => {
    setIsOpen(false);
    setQuery('');
    navigate(item.route, { state: item.state });
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#050720]/10 px-8 flex items-center justify-between sticky top-0 z-30 font-['Onest']">
        {/* Left: Punch-in Timestamp matching Figma */}
        <div className="flex flex-col">
          <span className="text-[11px] font-medium text-[#050720]/45 leading-none">
            In time
          </span>
          <span className="text-xs font-bold text-[#050720] font-['Sora'] mt-1">
            {inTime}
          </span>
        </div>

        {/* Right: Search, Notifications & Logout */}
        <div className="flex items-center gap-6">
          {/* Global Search Bar */}
          <div className="relative w-80 lg:w-96" ref={dropdownRef}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              placeholder="Search students, leads, demos, payments..."
              className="w-full bg-white text-xs text-[#050720] placeholder-[#050720]/40 pl-4 pr-10 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]/40 transition-colors"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}

            {isOpen && (
              <div className="absolute left-0 right-0 top-11 bg-white border border-[#050720]/15 rounded-xl shadow-xl py-2 z-40 max-h-96 overflow-y-auto">
                {results.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-[#050720]/50 text-center">
                    {isSearching ? 'Searching database...' : `No matching records for "${query}"`}
                  </div>
                ) : (
                  results.map((res) => (
                    <button
                      key={res.id}
                      onClick={() => handleSelectResult(res)}
                      className="w-full text-left px-4 py-2.5 hover:bg-[#FFB908]/15 flex items-center justify-between transition-colors border-b border-[#050720]/5 last:border-b-0 cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-semibold text-[#050720] leading-tight">
                          {res.title}
                        </p>
                        <span className="text-[11px] text-[#050720]/50 block">
                          {res.subtitle}
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#050720]/30" />
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Notification Icon */}
          <button
            type="button"
            onClick={() => navigate('/notifications')}
            className="text-[#050720]/70 hover:text-[#050720] p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Logout Button matching Figma */}
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

      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};
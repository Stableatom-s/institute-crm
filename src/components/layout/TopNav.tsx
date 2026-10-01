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

  // Initialize punch-in time
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

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Multi-entity search handler
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

        // 1. Search Batches & Batch Students
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
              route: userRole === 'sales' ? '/sales/batches' : '/faculty/batches',
              state: { batchCode: batch.batchCode },
            });
          }

          (batch.students || []).forEach((st: any) => {
            const stName = (st.name || `${st.firstName || ''} ${st.lastName || ''}`).trim();
            if (
              stName.toLowerCase().includes(q) ||
              st.contact?.toLowerCase().includes(q)
            ) {
              collected.push({
                id: `st-${st.id || st._id || Math.random()}`,
                category: 'Student',
                title: stName,
                subtitle: `${batch.batchCode} • ${batch.course}`,
                route: userRole === 'sales' ? '/sales/students' : '/faculty/student-management',
                state: {
                  student: {
                    id: st.id || st._id,
                    name: stName,
                    startDate: st.startDate || batch.startDate,
                    contact: st.contact,
                    attendanceRatio: st.attendance || st.attendanceRatio,
                    remark: st.remark,
                    course: batch.course,
                    batchCode: batch.batchCode,
                  },
                },
              });
            }
          });
        });

        // 2. Search Demos
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
              route: userRole === 'sales' ? '/sales/demo-management' : '/faculty/demo-management',
            });
          }
        });

        // 3. Search Leads (if sales or common)
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
              route: '/sales/leads',
            });
          }
        });

        setResults(collected.slice(0, 8)); // Top 8 relevant records
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

  const getCategoryColor = (cat: SearchResult['category']) => {
    switch (cat) {
      case 'Student':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Batch':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Demo':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Lead':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-[#050720]/10 px-8 flex items-center justify-between sticky top-0 z-30 font-['Onest']">
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
          {/* Global Search Bar */}
          <div className="relative w-80 lg:w-96" ref={dropdownRef}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.trim() && setIsOpen(true)}
              placeholder="Search students, batches, demos, leads..."
              className="w-full bg-[#F8FAFC] text-xs text-[#050720] placeholder-[#050720]/40 pl-4 pr-9 py-2 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]/40 transition-colors"
            />
            {isSearching ? (
              <Loader2 className="w-4 h-4 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 animate-spin pointer-events-none" />
            ) : (
              <Search className="w-4 h-4 text-[#050720]/40 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            )}

            {/* Live Search Results Dropdown */}
            {isOpen && (
              <div className="absolute left-0 right-0 top-11 bg-white border border-[#050720]/15 rounded-xl shadow-xl py-2 z-40 max-h-96 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
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
                      <div className="flex items-center gap-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCategoryColor(
                            res.category
                          )}`}
                        >
                          {res.category}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-[#050720] leading-tight">
                            {res.title}
                          </p>
                          <span className="text-[11px] text-[#050720]/50 block">
                            {res.subtitle}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#050720]/30" />
                    </button>
                  ))
                )}
              </div>
            )}
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

      {/* Reusable Logout Modal */}
      <LogoutModal 
        isOpen={showLogoutModal} 
        onClose={() => setShowLogoutModal(false)} 
      />
    </>
  );
};
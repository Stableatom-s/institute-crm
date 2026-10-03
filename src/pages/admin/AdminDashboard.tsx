import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDemos } from '../../hooks/useDemos';
import { useBatches } from '../../hooks/useBatches';
import { useLeads } from '../../hooks/useLeads';
import { useInvoices } from '../../hooks/useInvoices';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Real backend data hooks
  const { demos, loading: demosLoading } = useDemos();
  const { batches, loading: batchesLoading } = useBatches();
  const { leads, loading: leadsLoading } = useLeads();
  const { invoices, loading: invoicesLoading } = useInvoices();

  const isLoading = demosLoading || batchesLoading || leadsLoading || invoicesLoading;

  // Overview Counts
  const todayStr = new Date().toISOString().split('T')[0];
  
  const leadsCreatedToday = leads.filter((l: any) => l.createdAt?.startsWith(todayStr) || l.date === todayStr).length;
  const todayDemosCount = demos.filter((d: any) => d.demoDate === todayStr || d.date === todayStr).length || demos.length;
  const activeBatchesCount = batches.filter((b: any) => b.status === 'Active' || b.status === 'Ongoing').length || batches.length;
  const pendingPaymentsCount = invoices.filter((i: any) => i.status === 'Requests' || i.status === 'pending').length;

  // Pipeline Metrics
  const newLeads = leads.filter((l: any) => l.status === 'New' || l.stage === 'New').length;
  const contactedLeads = leads.filter((l: any) => l.status === 'Contacted' || l.stage === 'Contacted').length;
  const scheduledLeads = leads.filter((l: any) => l.status === 'Demo Scheduled' || l.stage === 'Demo Scheduled').length;
  const interestedLeads = leads.filter((l: any) => l.status === 'Interested' || l.stage === 'Interested').length;
  const convertedLeads = leads.filter((l: any) => l.status === 'Converted' || l.stage === 'Converted').length;

  if (isLoading) {
    return <div className="p-8 text-center text-xs font-semibold">Loading dashboard overview...</div>;
  }

  return (
    <div className="font-['Onest'] text-[#050720] space-y-6 pb-16">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-['Sora']">Dashboard</h1>
        <button
          onClick={() => navigate('/admin/leads')}
          className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Add new lead</span>
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Overview Card */}
        <div className="bg-white rounded-xl border border-[#050720]/10 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FFB908] rounded-r" />
          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Overview</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>

            <div className="grid grid-cols-4 gap-2 text-center mt-5">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Leads created today</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(leadsCreatedToday).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Today's Demos</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(todayDemosCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Active Batches</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(activeBatchesCount).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Payment Due</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(pendingPaymentsCount).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Pipeline Snapshot Card */}
        <div className="bg-white rounded-xl border border-[#050720]/10 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FFB908] rounded-r" />
          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Lead Pipeline Snapshot</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>

            <div className="grid grid-cols-5 gap-1 text-center mt-5">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">New</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(newLeads).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Contacted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(contactedLeads).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Demo Scheduled</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(scheduledLeads).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Interested</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(interestedLeads).padStart(2, '0')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Converted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                  {String(convertedLeads).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Scheduled Demos Table Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Scheduled Demos</h3>
          <button
            onClick={() => navigate('/admin/demos')}
            className="text-xs font-bold text-[#0066FF] hover:underline"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
              <th className="pb-3.5 font-semibold">Sr. No.</th>
              <th className="pb-3.5 font-semibold">Name</th>
              <th className="pb-3.5 font-semibold">Time Slot</th>
              <th className="pb-3.5 font-semibold">Demo Date</th>
              <th className="pb-3.5 font-semibold">Course</th>
              <th className="pb-3.5 font-semibold">Mode</th>
              <th className="pb-3.5 font-semibold">Faculty</th>
              <th className="pb-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
            {demos.slice(0, 5).map((demo: any, idx: number) => (
              <tr key={demo.id || demo._id || idx} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{demo.srNo || String(idx + 1).padStart(2, '0')}</td>
                <td className="py-3.5 font-medium">{demo.studentName || demo.name || 'N/A'}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.timeSlot || demo.time || '11:00 - 12:00'}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.demoDate || demo.date || '21-12-2025'}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.course || 'UI/UX Design'}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.mode || 'Online'}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.faculty || 'Tanmay Kalbhor'}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/admin/demos')}
                    className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ongoing Batches Table Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Ongoing Batches</h3>
          <button
            onClick={() => navigate('/admin/batch')}
            className="text-xs font-bold text-[#0066FF] hover:underline"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
              <th className="pb-3.5 font-semibold">Sr. No.</th>
              <th className="pb-3.5 font-semibold">Batch</th>
              <th className="pb-3.5 font-semibold">Start Date</th>
              <th className="pb-3.5 font-semibold">Course</th>
              <th className="pb-3.5 font-semibold">Faculty</th>
              <th className="pb-3.5 font-semibold">Student count</th>
              <th className="pb-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
            {batches.slice(0, 5).map((batch: any, idx: number) => (
              <tr key={batch.id || batch._id || idx} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{batch.srNo || String(idx + 1).padStart(2, '0')}</td>
                <td className="py-3.5 font-medium">{batch.batchName || batch.batch || 'MWF-JAN-2026'}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.startDate || '01-01-2026'}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.course || 'UI/UX Design'}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.faculty || 'Poorva Pande'}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.studentCount || '05'}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/admin/batch')}
                    className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination Controls */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#050720]/5 text-xs text-[#050720]/70">
          <span className="text-[11px]">Jump to</span>
          <input
            type="text"
            defaultValue="01"
            className="w-8 h-7 text-center border border-[#050720]/20 rounded text-xs text-[#050720] font-semibold"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
            <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

    </div>
  );
};
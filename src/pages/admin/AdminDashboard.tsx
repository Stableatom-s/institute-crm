import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

interface ScheduledDemoItem {
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
}

interface OngoingBatchItem {
  srNo: string;
  batch: string;
  startDate: string;
  course: string;
  faculty: string;
  studentCount: string;
}

const SCHEDULED_DEMOS: ScheduledDemoItem[] = [
  { srNo: '01', name: 'Aanya Shah', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor' },
  { srNo: '02', name: 'Rohan Mehta', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online', faculty: 'Poorva Pande' },
  { srNo: '03', name: 'Neha Patel', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline', faculty: 'Tanmay Kalbhor' },
  { srNo: '04', name: 'Anish Verma', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline', faculty: 'Poorva Pande' },
  { srNo: '05', name: 'Siddhi Shah', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online', faculty: 'Neeraj Joshi' },
];

const ONGOING_BATCHES: OngoingBatchItem[] = [
  { srNo: '01', batch: 'MWF-JAN-2026', startDate: '01-01-2026', course: 'UI/UX Design', faculty: 'Poorva Pande', studentCount: '05' },
  { srNo: '02', batch: 'TTS-JAN-2026', startDate: '03-01-2026', course: 'No Code', faculty: 'Tanmay Kalbhor', studentCount: '06' },
  { srNo: '03', batch: 'WEEKEND-JAN-2026', startDate: '07-01-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
  { srNo: '04', batch: 'MWF-FEB-2026', startDate: '07-02-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
  { srNo: '05', batch: 'TTS-FEB-2026', startDate: '08-01-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

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
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Today's Demos</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Active Batches</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Payment Due</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">02</span>
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
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Contacted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Demo Scheduled</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Interested</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">03</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Converted</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">03</span>
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
            {SCHEDULED_DEMOS.map((demo) => (
              <tr key={demo.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{demo.srNo}</td>
                <td className="py-3.5 font-medium">{demo.name}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.timeSlot}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.demoDate}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.course}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.mode}</td>
                <td className="py-3.5 text-[#050720]/70">{demo.faculty}</td>
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
            {ONGOING_BATCHES.map((batch) => (
              <tr key={batch.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{batch.srNo}</td>
                <td className="py-3.5 font-medium">{batch.batch}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.studentCount}</td>
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
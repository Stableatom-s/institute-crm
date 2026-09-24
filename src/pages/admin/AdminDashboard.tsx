import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AddLeadModal } from '../../components/forms/AddLeadModal';

interface DemoItem {
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
}

interface BatchItem {
  srNo: string;
  batchCode: string;
  startDate: string;
  course: string;
  faculty: string;
  studentCount: string;
}

const SCHEDULED_DEMOS: DemoItem[] = [
  { srNo: '01', name: 'Aanya Shah', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor' },
  { srNo: '02', name: 'Rohan Mehta', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online', faculty: 'Poorva Pande' },
  { srNo: '03', name: 'Neha Patel', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline', faculty: 'Tanmay Kalbhor' },
  { srNo: '04', name: 'Anish Verma', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline', faculty: 'Poorva Pande' },
  { srNo: '05', name: 'Siddhi Shah', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online', faculty: 'Neeraj Joshi' },
];

const ONGOING_BATCHES: BatchItem[] = [
  { srNo: '01', batchCode: 'MWF-JAN-2026', startDate: '01-01-2026', course: 'UI/UX Design', faculty: 'Poorva Pande', studentCount: '05' },
  { srNo: '02', batchCode: 'TTS-JAN-2026', startDate: '03-01-2026', course: 'No Code', faculty: 'Tanmay Kalbhor', studentCount: '06' },
  { srNo: '03', batchCode: 'WEEKEND-JAN-2026', startDate: '07-01-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
  { srNo: '04', batchCode: 'MWF-FEB-2026', startDate: '07-02-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
  { srNo: '05', batchCode: 'TTS-FEB-2026', startDate: '08-01-2026', course: 'UI/UX Design', faculty: 'Tanmay Kalbhor', studentCount: '04' },
];

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [isAddLeadModalOpen, setIsAddLeadModalOpen] = useState(false);

  const handleAddLeadSubmit = (data: any) => {
    alert(`Lead "${data.name}" added successfully!`);
    setIsAddLeadModalOpen(false);
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16 space-y-6">
      
      {/* Top Heading & Action Button */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold font-['Sora']">Dashboard</h1>
        <button
          onClick={() => setIsAddLeadModalOpen(true)}
          className="px-5 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
        >
          Add new lead
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Overview */}
        <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFB908]" />
          <div>
            <h2 className="text-sm font-bold font-['Sora'] text-[#050720]">Overview</h2>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>
          </div>

          <div className="grid grid-cols-4 gap-2 text-center mt-6">
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Leads created today</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Today's Demos</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Active Batches</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Payment Due</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">02</span>
            </div>
          </div>
        </div>

        {/* Card 2: Lead Pipeline Snapshot */}
        <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs relative overflow-hidden flex flex-col justify-between">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#FFB908]" />
          <div>
            <h2 className="text-sm font-bold font-['Sora'] text-[#050720]">Lead Pipeline Snapshot</h2>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>
          </div>

          <div className="grid grid-cols-5 gap-2 text-center mt-6">
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">New</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Contacted</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Demo Scheduled</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">05</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Interested</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">03</span>
            </div>
            <div>
              <span className="text-[10px] text-[#050720]/70 font-semibold block leading-tight">Converted</span>
              <span className="text-2xl font-extrabold font-['Sora'] block mt-2">03</span>
            </div>
          </div>
        </div>

      </div>

      {/* Scheduled Demos Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold font-['Sora']">Scheduled Demos</h2>
          <button 
            onClick={() => navigate('/admin/demos')}
            className="text-xs font-semibold text-[#0066FF] hover:underline"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 font-bold">
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
          <tbody className="divide-y divide-[#050720]/5">
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
                    className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Ongoing Batches Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-bold font-['Sora']">Ongoing Batches</h2>
          <button 
            onClick={() => navigate('/admin/batches')}
            className="text-xs font-semibold text-[#0066FF] hover:underline"
          >
            View all
          </button>
        </div>

        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#050720]/10 font-bold">
              <th className="pb-3.5 font-semibold">Sr. No.</th>
              <th className="pb-3.5 font-semibold">Batch</th>
              <th className="pb-3.5 font-semibold">Start Date</th>
              <th className="pb-3.5 font-semibold">Course</th>
              <th className="pb-3.5 font-semibold">Faculty</th>
              <th className="pb-3.5 font-semibold">Student count</th>
              <th className="pb-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5">
            {ONGOING_BATCHES.map((batch) => (
              <tr key={batch.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{batch.srNo}</td>
                <td className="py-3.5 font-medium">{batch.batchCode}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.startDate}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.course}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.faculty}</td>
                <td className="py-3.5 text-[#050720]/70">{batch.studentCount}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate('/admin/batches')}
                    className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5 transition-colors"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
          <span className="text-[11px]">Jump to</span>
          <input
            type="text"
            defaultValue="01"
            className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs"
          />
          <div className="flex items-center gap-1.5 ml-2">
            <button className="p-1 hover:text-[#050720]"><ChevronLeft className="w-3.5 h-3.5" /></button>
            <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
            <button className="p-1 hover:text-[#050720]"><ChevronRight className="w-3.5 h-3.5" /></button>
          </div>
        </div>
      </div>

      {/* Add New Lead Modal */}
      <AddLeadModal
        isOpen={isAddLeadModalOpen}
        onClose={() => setIsAddLeadModalOpen(false)}
        onSubmit={handleAddLeadSubmit}
      />

    </div>
  );
};
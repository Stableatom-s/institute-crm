import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Plus } from 'lucide-react';

interface FollowUpItem {
  srNo: string;
  name: string;
  contactNo: string;
  enquiryDate: string;
  course: string;
  status: 'Interested' | 'Not Interested';
  followUp: string;
  remark: string;
  leadId: string;
}

interface ScheduledDemoItem {
  srNo: string;
  name: string;
  timeSlot: string;
  demoDate: string;
  course: string;
  mode: 'Online' | 'Offline';
  faculty: string;
}

const DASHBOARD_FOLLOWUPS: FollowUpItem[] = [
  { srNo: '01', name: 'Aanya Shah', contactNo: '9078675645', enquiryDate: '21-12-2025', course: 'UI/UX Design', status: 'Interested', followUp: '01-01-2026', remark: 'Needs Time', leadId: 'lead-1' },
  { srNo: '02', name: 'Rohan Mehta', contactNo: '9123456565', enquiryDate: '21-12-2025', course: 'No Code', status: 'Not Interested', followUp: '01-01-2026', remark: 'Needs Time', leadId: 'lead-2' },
  { srNo: '03', name: 'Neha Patel', contactNo: '9767564995', enquiryDate: '21-12-2025', course: 'UI/UX Design', status: 'Interested', followUp: '01-01-2026', remark: 'Joining Soon', leadId: 'lead-3' },
];

const DASHBOARD_DEMOS: ScheduledDemoItem[] = [
  { srNo: '01', name: 'Aanya Shah', timeSlot: '11:00 - 12:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Online', faculty: 'Tanmay Kalbhor' },
  { srNo: '02', name: 'Rohan Mehta', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'No Code', mode: 'Online', faculty: 'Poorva Pande' },
  { srNo: '03', name: 'Neha Patel', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'UI/UX Design', mode: 'Offline', faculty: 'Tanmay Kalbhor' },
  { srNo: '04', name: 'Anish Verma', timeSlot: '03:00 - 04:00', demoDate: '21-12-2025', course: 'Portfolio', mode: 'Offline', faculty: 'Poorva Pande' },
  { srNo: '05', name: 'Siddhi Shah', timeSlot: '01:00 - 02:00', demoDate: '21-12-2025', course: 'Full-Stack', mode: 'Online', faculty: 'Neeraj Joshi' },
];

export const SalesDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-['Onest'] text-[#050720] space-y-6 pb-16">
      
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-['Sora']">Dashboard</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/sales/demos')}
            className="flex items-center gap-2 px-4 py-2 border border-[#050720]/25 rounded-lg text-xs font-bold text-[#050720] bg-white hover:bg-[#050720]/5 transition-colors shadow-xs"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Schedule Demo</span>
          </button>
          <button
            onClick={() => navigate('/sales/leads')}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add new lead</span>
          </button>
        </div>
      </div>

      {/* Snapshot Cards Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Card 1: Sales Action Overview */}
        <div className="bg-white rounded-xl border border-[#050720]/10 p-5 shadow-xs relative overflow-hidden">
          <div className="absolute left-0 top-6 bottom-6 w-1 bg-[#FFB908] rounded-r" />
          <div className="pl-3">
            <h3 className="text-sm font-bold font-['Sora']">Sales Action Overview</h3>
            <span className="text-[10px] text-[#050720]/50 block mt-0.5">This month</span>

            <div className="grid grid-cols-4 gap-2 text-center mt-5">
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Follow-ups Due</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">03</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Leads created today</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Today's Demos</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block font-medium">Payment Follow-ups</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">03</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Lead Pipeline Snapshot */}
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

      {/* Follow-ups Table Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Follow-ups</h3>
          <button
            onClick={() => navigate('/sales/follow-up')}
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
              <th className="pb-3.5 font-semibold">Contact No.</th>
              <th className="pb-3.5 font-semibold">Enquiry Date</th>
              <th className="pb-3.5 font-semibold">Course</th>
              <th className="pb-3.5 font-semibold">Status</th>
              <th className="pb-3.5 font-semibold">Follow-up</th>
              <th className="pb-3.5 font-semibold">Remark</th>
              <th className="pb-3.5 text-right font-semibold">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
            {DASHBOARD_FOLLOWUPS.map((item) => (
              <tr key={item.srNo} className="hover:bg-[#FFB908]/5 transition-colors">
                <td className="py-3.5 text-[#050720]/70">{item.srNo}</td>
                <td className="py-3.5 font-medium">{item.name}</td>
                <td className="py-3.5 text-[#050720]/70">{item.contactNo}</td>
                <td className="py-3.5 text-[#050720]/70">{item.enquiryDate}</td>
                <td className="py-3.5 text-[#050720]/70">{item.course}</td>
                <td className="py-3.5">
                  <span className={`font-semibold ${
                    item.status === 'Interested' ? 'text-[#10B981]' : 'text-[#EF4444]'
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="py-3.5 text-[#050720]/70">{item.followUp}</td>
                <td className="py-3.5 text-[#050720]/70">{item.remark}</td>
                <td className="py-3.5 text-right">
                  <button
                    onClick={() => navigate(`/sales/leads?leadId=${item.leadId}`)}
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

      {/* Scheduled Demos Table Card */}
      <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold font-['Sora']">Scheduled Demos</h3>
          <button
            onClick={() => navigate('/sales/demos')}
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
            {DASHBOARD_DEMOS.map((demo) => (
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
                    onClick={() => navigate('/sales/demos')}
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

    </div>
  );
};
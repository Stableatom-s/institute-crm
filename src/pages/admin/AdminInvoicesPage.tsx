import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  XCircle,
  FileText
} from 'lucide-react';

interface InvoiceItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  paidFees: string;
  mobile: string;
  approvedOn: string;
  email: string;
  invoiceId: string;
  status: 'Approved' | 'Requests' | 'Cancelled';
}

interface FeeItem {
  id: string;
  srNo: string;
  name: string;
  course: string;
  totalFees: string;
  paid: string;
  lastFollowUp: string;
  remarks: string;
  mobile: string;
  email: string;
  paymentDate: string;
  approvedDate: string;
}

const INITIAL_INVOICES: InvoiceItem[] = [
  { id: 'inv-1', srNo: '01', name: 'Rahul Sharma', course: 'No Code', paidFees: '₹7,000', mobile: '9856985698', approvedOn: '01-12-2025', email: 'rahul@gmail.com', invoiceId: 'GST/001', status: 'Approved' },
  { id: 'inv-2', srNo: '02', name: 'Vikram Singh', course: 'UI/UX Design', paidFees: '₹28,000', mobile: '9462785462', approvedOn: '01-12-2025', email: 'vikram@gmail.com', invoiceId: 'GST/001', status: 'Approved' },
  { id: 'inv-3', srNo: '03', name: 'Ashish Mehta', course: 'UI/UX Design', paidFees: '₹35,000', mobile: '9784569874', approvedOn: '-', email: 'ashish@gmail.com', invoiceId: 'GST/001', status: 'Requests' }
];

const INITIAL_FEES: FeeItem[] = [
  { id: 'fee-1', srNo: '01', name: 'Aanya Shah', course: 'UI/UX Design', totalFees: '₹35,000', paid: '₹35,000', lastFollowUp: '01-12-2025', remarks: 'Paid', mobile: '9078675645', email: 'aanya@gmail.com', paymentDate: '01-12-2025', approvedDate: '01-12-2025' },
  { id: 'fee-2', srNo: '02', name: 'Rohan Mehta', course: 'No Code', totalFees: '₹35,000', paid: '₹14,000', lastFollowUp: '01-12-2025', remarks: 'Partially Paid', mobile: '9123456565', email: 'rohan.m@gmail.com', paymentDate: '01-12-2025', approvedDate: '01-12-2025' },
  { id: 'fee-3', srNo: '03', name: 'Neha Patel', course: 'UI/UX Design', totalFees: '₹35,000', paid: '₹28,000', lastFollowUp: '01-12-2025', remarks: 'Partially Paid', mobile: '9767564995', email: 'neha.patel@gmail.com', paymentDate: '01-12-2025', approvedDate: '01-12-2025' },
];

export const AdminInvoicesPage: React.FC = () => {
  const [view, setView] = useState<'main' | 'create' | 'preview' | 'fee-details'>('main');
  const [invoiceTab, setInvoiceTab] = useState<'Approved' | 'Requests' | 'Cancelled'>('Approved');
  
  // Selection states
  const [selectedFee, setSelectedFee] = useState<FeeItem>(INITIAL_FEES[0]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem>(INITIAL_INVOICES[0]);

  // Modals
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmGenModal, setShowConfirmGenModal] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Calendar State for Fees Details
  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number | null>(null);

  const filteredInvoices = INITIAL_INVOICES.filter(inv => inv.status === invoiceTab);

  const handleOpenApproveModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setShowApproveModal(true);
  };

  const handleOpenRejectModal = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setShowRejectModal(true);
  };

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      
      {/* ========================================================= */}
      {/* 1. INVOICE & FEES DASHBOARD (SCREENSHOT 1)                */}
      {/* ========================================================= */}
      {view === 'main' && (
        <div className="space-y-10">
          
          {/* --- TOP SECTION: INVOICE --- */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold font-['Sora']">Invoice</h1>
              <button 
                onClick={() => setView('create')}
                className="px-4 py-2 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
              >
                Create Invoice
              </button>
            </div>

            {/* 3 Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Requests</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">3+</span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Invoices Generated</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">04</span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Pending Payments</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">02</span>
              </div>
            </div>

            {/* Invoices Table Card */}
            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              {/* Tabs */}
              <div className="flex items-center gap-8 border-b border-[#050720]/10 text-xs font-bold">
                {(['Approved', 'Requests', 'Cancelled'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setInvoiceTab(tab)}
                    className={`pb-3 relative transition-colors ${invoiceTab === tab ? 'text-[#050720]' : 'text-[#050720]/50'}`}
                  >
                    {tab}
                    {invoiceTab === tab && (
                      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFB908] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Table */}
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 font-bold">
                    <th className="pb-3.5">Sr. No.</th>
                    <th className="pb-3.5">Name</th>
                    <th className="pb-3.5">Course</th>
                    <th className="pb-3.5">Paid fees</th>
                    <th className="pb-3.5">Mobile</th>
                    <th className="pb-3.5">Approved on</th>
                    <th className="pb-3.5">Email</th>
                    <th className="pb-3.5">Invoice ID</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-[#FFB908]/5">
                      <td className="py-3.5 text-[#050720]/70">{inv.srNo}</td>
                      <td className="py-3.5 font-medium">{inv.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                      <td className="py-3.5 font-semibold">{inv.paidFees}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.mobile}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.approvedOn}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.email}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.invoiceId}</td>
                      <td className="py-3.5 text-right">
                        {inv.status === 'Requests' ? (
                          <div className="flex justify-end gap-2">
                            <button 
                              onClick={() => handleOpenApproveModal(inv)} 
                              className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded font-semibold text-[11px]"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => handleOpenRejectModal(inv)} 
                              className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded font-semibold text-[11px]"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setView('preview')}
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5"
                          >
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
                <span className="text-[11px]">Jump to</span>
                <input type="text" defaultValue="01" className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs" />
                <button className="p-1"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>

          {/* --- BOTTOM SECTION: FEES --- */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold font-['Sora']">Fees</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Total Fees Collected</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">₹77,000</span>
                <span className="text-[10px] text-[#050720]/50 block mt-1">All time</span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Outstanding Amount</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">₹ 28,000</span>
                <span className="text-[10px] text-[#050720]/50 block mt-1">Pending from 02 students</span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Overdue Payments</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">2 Students</span>
                <span className="text-[10px] text-[#050720]/50 block mt-1">Payments past due date</span>
              </div>
              <div className="bg-white border border-[#050720]/10 rounded-xl p-5 text-center shadow-xs">
                <span className="text-xs font-semibold block">Follow-ups Due Today</span>
                <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
                <span className="text-[10px] text-[#050720]/50 block mt-1">Action required</span>
              </div>
            </div>

            <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs space-y-4">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 font-bold">
                    <th className="pb-3.5">Sr. No.</th>
                    <th className="pb-3.5">Name</th>
                    <th className="pb-3.5">Course</th>
                    <th className="pb-3.5">Total fees</th>
                    <th className="pb-3.5">Paid</th>
                    <th className="pb-3.5">Last follow-up</th>
                    <th className="pb-3.5">Remarks</th>
                    <th className="pb-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5">
                  {INITIAL_FEES.map((fee) => (
                    <tr key={fee.id} className="hover:bg-[#FFB908]/5">
                      <td className="py-3.5 text-[#050720]/70">{fee.srNo}</td>
                      <td className="py-3.5 font-medium">{fee.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.course}</td>
                      <td className="py-3.5">{fee.totalFees}</td>
                      <td className="py-3.5 font-semibold">{fee.paid}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.lastFollowUp}</td>
                      <td className="py-3.5 text-[#050720]/70">{fee.remarks}</td>
                      <td className="py-3.5 text-right">
                        <button
                          onClick={() => {
                            setSelectedFee(fee);
                            setView('fee-details');
                          }}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold hover:bg-[#050720]/5"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-end gap-3 pt-3 text-xs text-[#050720]/70">
                <span className="text-[11px]">Jump to</span>
                <input type="text" defaultValue="01" className="w-8 h-7 text-center border border-[#050720]/20 rounded font-semibold text-xs" />
                <button className="p-1"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. FEES DETAILS DRILLDOWN VIEW (SCREENSHOT 5 & 7)         */}
      {/* ========================================================= */}
      {view === 'fee-details' && (
        <div className="space-y-6">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Fees Details</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Cols: Breakdown, Overview, Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fees Breakdown Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Fees Breakdown</h3>
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Total fees</span>
                    <span className="font-extrabold text-base font-['Sora']">₹35,000</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Paid fees</span>
                    <span className="font-extrabold text-base font-['Sora']">₹35,000</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Pending</span>
                    <span className="font-extrabold text-base font-['Sora']">₹0</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-[#050720]/60 mb-1">
                    <span>Payment progress</span>
                    <span className="font-semibold text-emerald-600">100%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-full" />
                  </div>
                </div>
              </div>

              {/* Student Overview Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">Rahul</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">Sharma</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Email</span>
                    <span className="font-semibold text-sm">rahul@gmail.com</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                    <span className="font-semibold text-sm">9784569874</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Course</span>
                    <span className="font-semibold text-sm">UI/UX Design</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Payment Status</span>
                    <span className="font-semibold text-sm text-emerald-600">Paid</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Invoice</span>
                    <span className="font-semibold text-sm">GST/001</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Amount</span>
                    <span className="font-semibold text-sm">₹35,000</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Payment Date</span>
                    <span className="font-semibold text-sm">01-12-2025</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Approved Date</span>
                    <span className="font-semibold text-sm">01-12-2025</span>
                  </div>
                </div>
              </div>

              {/* Timeline Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="border border-[#050720]/10 rounded-xl p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold block">Installment #1</span>
                      <span className="text-[10px] text-[#050720]/50 block">Due: 01-12-2025</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold block">₹35,000</span>
                      <span className="text-[10px] font-semibold text-emerald-600">Paid</span>
                    </div>
                  </div>
                  <p className="text-xs text-[#050720]/80">Paid on: 01-12-2025</p>
                  <p className="text-xs text-[#050720]/80">Amount left: Nil</p>
                  <div className="pt-2 flex justify-end">
                    <button 
                      onClick={() => setView('preview')}
                      className="px-3 py-1.5 border border-[#050720]/30 rounded text-xs font-semibold hover:bg-[#050720]/5"
                    >
                      View Invoice
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Right 1 Col: Follow-up Calendar & Remarks */}
            <div className="space-y-6">
              
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Add Remark</h3>
                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark title</span>
                  <div className="relative">
                    <select className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 appearance-none focus:outline-none">
                      <option>Follow-up</option>
                      <option>Next Installment</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-[#050720]/40 pointer-events-none" />
                  </div>
                </div>

                {/* Calendar Widget (Figma Screen 7) */}
                <div className="border border-[#050720]/15 rounded-xl p-4 bg-white">
                  <span className="text-xs font-semibold block mb-3">Select Follow-up Date</span>
                  <div className="flex gap-2 mb-3">
                    <div className="w-1/2 relative">
                      <select className="w-full bg-[#F8FAFC] text-xs p-1.5 rounded border border-[#050720]/15 appearance-none">
                        <option>Month</option>
                        <option>December</option>
                      </select>
                      <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-[#050720]/40" />
                    </div>
                    <input type="text" placeholder="Year" defaultValue="2025" className="w-1/2 bg-[#F8FAFC] text-xs p-1.5 rounded border border-[#050720]/15 text-center" />
                  </div>

                  {/* Calendar Days Matrix */}
                  <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium pt-1">
                    <span className="text-[#050720]/40"></span>
                    <span className="text-[#050720]/40"></span>
                    <span className="text-[#050720]/40"></span>
                    <span className="text-[#050720]/40"></span>
                    {[1, 2, 3].map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedCalendarDay(d)} 
                        className={`p-1.5 rounded ${selectedCalendarDay === d ? 'bg-[#FFB908] font-bold' : 'hover:bg-slate-100'}`}
                      >
                        0{d}
                      </button>
                    ))}
                    {[4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map(d => (
                      <button 
                        key={d} 
                        onClick={() => setSelectedCalendarDay(d)} 
                        className={`p-1.5 rounded ${selectedCalendarDay === d ? 'bg-[#FFB908] font-bold' : 'hover:bg-slate-100'}`}
                      >
                        {d < 10 ? `0${d}` : d}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-[#050720]/10 mt-3 text-[10px]">
                    <button onClick={() => setSelectedCalendarDay(null)} className="text-[#050720]/60 hover:underline">Clear</button>
                    <button className="font-bold text-[#050720]">Done</button>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark Description</span>
                  <textarea 
                    rows={4}
                    placeholder="Enter remark here.." 
                    className="w-full bg-[#F8FAFC] text-xs p-3 rounded-lg border border-[#050720]/15 focus:outline-none resize-none"
                  />
                </div>

                <button 
                  onClick={() => alert('Remark saved successfully')}
                  className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] shadow-xs"
                >
                  Save Remark
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. CREATE INVOICE FORM (SCREENSHOT 6)                     */}
      {/* ========================================================= */}
      {view === 'create' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Create Invoice</span>
          </button>

          {/* Company Details */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Company Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" defaultValue="Radiquolab Private Limited" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="9145272921" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="Horizon Chambers, Shop No. 6, GAT NO 281/2, Pirangut, Pune" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="info@radiquolab.com" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="27AANCR8297C1ZT" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="UI/UX Design" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="AANCR8297C" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="AANCR8297C" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
            </div>
          </div>

          {/* Bank Details */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" defaultValue="State Bank of India" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="Pirangut" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="Radiquolab Private Limited" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="20523204478" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="SBIN0011430" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
              <input type="text" defaultValue="SBININBB23B" className="bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
            </div>
          </div>

          {/* Bill To */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Bill to</h3>
            <input type="text" placeholder="Search by name/contact" defaultValue="" className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15" />
          </div>

          {/* Tax & Amounts */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Tax Calculation</h3>
            <div className="flex justify-between text-xs font-semibold py-1">
              <span>Subtotal</span>
              <span>₹35,000</span>
            </div>
            <div className="flex justify-between text-xs font-bold pt-2 border-t border-[#050720]/10">
              <span>Grand Total</span>
              <span>₹35,000</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setView('main')} className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5">
              Cancel
            </button>
            <button onClick={() => setView('preview')} className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold shadow-xs">
              Preview
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 4. INVOICE PREVIEW VIEW (SCREENSHOT 4, 8 & 9)             */}
      {/* ========================================================= */}
      {view === 'preview' && (
        <div className="space-y-6 max-w-4xl">
          <button
            onClick={() => setView('main')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Invoice Preview</span>
          </button>

          {/* Formal GST Tax Invoice Paper Document */}
          <div className="bg-white border-2 border-[#050720] text-xs font-['Onest']">
            {/* Header */}
            <div className="p-4 text-center border-b border-[#050720]">
              <h2 className="text-base font-bold font-['Sora']">Radiquolab Private Limited</h2>
              <p className="text-[11px] text-[#050720]/80 mt-1">Horizon Chambers, Shop No. 6, GAT NO 281/2, Kasar Amboli Ghotawade, Pirangut, Mulshi, Pune 412115</p>
            </div>

            <div className="grid grid-cols-2 border-b border-[#050720] p-2 text-[11px]">
              <div>Mobile: +91-9145272921</div>
              <div>Email: info@radiquolab.com</div>
            </div>

            <div className="grid grid-cols-3 border-b border-[#050720] p-2 text-[10px]">
              <div>GSTIN: 27AANCR8297C1ZT</div>
              <div>Company PAN: AANCR8297C</div>
              <div>IEC Code: AANCR8297C</div>
            </div>

            <div className="flex justify-between items-center border-b border-[#050720] p-2 font-bold">
              <span>Tax Invoice</span>
              <span>Date: 05-01-2026</span>
            </div>

            {/* Bill Info */}
            <div className="grid grid-cols-3 border-b border-[#050720] p-3 text-[11px]">
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Bill To:</span>
                <span className="font-bold">Rahul Sharma</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Invoice No.:</span>
                <span className="font-bold">GST/001</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/60 block">Country of supply:</span>
                <span>India</span>
              </div>
            </div>

            {/* Invoice Line Items */}
            <table className="w-full text-left border-b border-[#050720]">
              <thead className="border-b border-[#050720] font-bold">
                <tr>
                  <th className="p-2 border-r border-[#050720]">Sr. No.</th>
                  <th className="p-2 border-r border-[#050720]">Description</th>
                  <th className="p-2 border-r border-[#050720]">Hsn/Sac</th>
                  <th className="p-2 border-r border-[#050720]">Qty/Hrs</th>
                  <th className="p-2 border-r border-[#050720]">Rate</th>
                  <th className="p-2 border-r border-[#050720]">Currency</th>
                  <th className="p-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2 border-r border-[#050720]">01</td>
                  <td className="p-2 border-r border-[#050720]">UI/UX Design</td>
                  <td className="p-2 border-r border-[#050720]">998456</td>
                  <td className="p-2 border-r border-[#050720]">01</td>
                  <td className="p-2 border-r border-[#050720]">-</td>
                  <td className="p-2 border-r border-[#050720]">Rupee(₹)</td>
                  <td className="p-2 text-right font-bold">35,000</td>
                </tr>
              </tbody>
            </table>

            {/* Calculations */}
            <div className="text-right p-3 space-y-1 text-xs border-b border-[#050720]">
              <div>Subtotal: 35,000</div>
              <div>CGST @ 0%: 0</div>
              <div>SGST @ 0%: 0</div>
              <div>IGST @ 0%: 0</div>
              <div className="font-bold text-sm pt-1">Grand total: ₹35,000</div>
              <div className="text-[10px] text-[#050720]/70">In words: Thirty- five thousand only</div>
            </div>

            {/* Terms & Bank details */}
            <div className="p-3 border-b border-[#050720] text-[11px] space-y-1">
              <span className="font-bold block">Terms & Conditions</span>
              <p>Payment terms: 30 Days</p>
              <p>Due date: 04-Feb-2026</p>
              <p>Billing Period: 04-Oct-2026 to 04-Feb-2026</p>
            </div>

            <div className="grid grid-cols-2 p-3 text-[11px]">
              <div>
                <span className="font-bold block mb-1">Bank Details:</span>
                <p>Bank Name: State Bank of India</p>
                <p>Branch: Pirangut</p>
                <p>Account Name: Radiquolab Private Limited</p>
                <p>Account Number: 20523204478</p>
                <p>IFSC: SBIN0011430</p>
                <p>Swift Code: SBININBB23B</p>
              </div>
              <div className="flex flex-col justify-end items-end text-center">
                <div className="border-t border-[#050720] w-40 pt-1 text-[10px] font-semibold">
                  Authorised Signature
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button onClick={() => setView('main')} className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5">
              Cancel
            </button>
            <button onClick={() => setShowConfirmGenModal(true)} className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold shadow-xs">
              Generate Invoice
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 5. MODALS & POPUPS                                        */}
      {/* ========================================================= */}
      
      {/* Approve Invoice Modal (Screenshot 2) */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h2 className="text-base font-bold font-['Sora']">Approve Invoice?</h2>
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold">{selectedInvoice.name.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold">{selectedInvoice.name.split(' ')[1] || 'Mehta'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Email</span>
                <span className="font-semibold">{selectedInvoice.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold">{selectedInvoice.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Invoice</span>
                <span className="font-semibold">{selectedInvoice.invoiceId}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Amount</span>
                <span className="font-semibold">{selectedInvoice.paidFees}</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowApproveModal(false)} className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowApproveModal(false);
                  alert('Invoice approved successfully');
                }} 
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Invoice Modal (Screenshot 3) */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl space-y-5">
            <h2 className="text-base font-bold font-['Sora']">Reject Invoice?</h2>
            <div className="grid grid-cols-2 gap-y-3 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold">{selectedInvoice.name.split(' ')[0]}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold">{selectedInvoice.name.split(' ')[1] || 'Mehta'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Email</span>
                <span className="font-semibold">{selectedInvoice.email}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Mobile</span>
                <span className="font-semibold">{selectedInvoice.mobile}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Invoice</span>
                <span className="font-semibold">{selectedInvoice.invoiceId}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Amount</span>
                <span className="font-semibold">{selectedInvoice.paidFees}</span>
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Reason for rejection"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
            />
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowRejectModal(false);
                  alert('Invoice rejected');
                }} 
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Invoice Generation Modal (Screenshot 8) */}
      {showConfirmGenModal && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            <h2 className="text-base font-bold font-['Sora']">Confirm Invoice Generation?</h2>
            <p className="text-xs text-[#050720]/70">
              This invoice will be permanently recorded and shared with the client. Once generated, it cannot be deleted, only marked as paid or cancelled.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setShowConfirmGenModal(false)} className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold">
                Cancel
              </button>
              <button 
                onClick={() => {
                  setShowConfirmGenModal(false);
                  setShowSuccessToast(true);
                  setTimeout(() => {
                    setShowSuccessToast(false);
                    setView('main');
                  }, 2000);
                }} 
                className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Generated Success Toast (Screenshot 9) */}
      {showSuccessToast && (
        <div className="fixed inset-0 z-50 bg-[#050720]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center space-y-2">
            <h2 className="text-base font-bold font-['Sora']">Invoice Generated</h2>
            <p className="text-xs text-[#050720]/70">Invoice has been generated</p>
          </div>
        </div>
      )}

    </div>
  );
};
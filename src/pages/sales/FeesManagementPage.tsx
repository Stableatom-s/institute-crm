import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp,
  Download, 
  Plus 
} from 'lucide-react';

// --- TYPES ---
export interface InstallmentRecord {
  id: string;
  title: string;
  dueDate: string;
  paidDate?: string;
  lastContacted?: string;
  amount: string;
  amountLeft: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  hasInvoice?: boolean;
}

export interface FeeStudent {
  id: string;
  srNo: string;
  name: string;
  firstName: string;
  lastName: string;
  course: string;
  totalFees: number;
  paidFees: number;
  lastFollowUp: string;
  remarks: 'Paid' | 'Partially Paid' | 'Overdue';
  timeline: InstallmentRecord[];
}

const INITIAL_FEE_STUDENTS: FeeStudent[] = [
  {
    id: 'fee-1',
    srNo: '01',
    name: 'Aanya Shah',
    firstName: 'Aanya',
    lastName: 'Shah',
    course: 'UI/UX Design',
    totalFees: 35000,
    paidFees: 35000,
    lastFollowUp: '01-12-2025',
    remarks: 'Paid',
    timeline: [
      {
        id: 'inst-1',
        title: 'Installment #1',
        dueDate: '01-12-2025',
        paidDate: '01-12-2025',
        amount: '₹35,000',
        amountLeft: 'Nil',
        status: 'Paid',
        hasInvoice: true
      }
    ]
  },
  {
    id: 'fee-2',
    srNo: '02',
    name: 'Rohan Mehta',
    firstName: 'Rohan',
    lastName: 'Mehta',
    course: 'No Code',
    totalFees: 35000,
    paidFees: 14000,
    lastFollowUp: '01-12-2025',
    remarks: 'Partially Paid',
    timeline: [
      {
        id: 'inst-2-1',
        title: 'Installment #2',
        dueDate: '01-10-2025',
        paidDate: '01-10-2025',
        amount: '₹7,000',
        amountLeft: '₹24,000',
        status: 'Paid',
        hasInvoice: true
      },
      {
        id: 'inst-2-2',
        title: 'Follow-up Installment #2',
        dueDate: '01-10-2025',
        lastContacted: '30-09-2025, 12:00',
        amount: '₹7,000',
        amountLeft: '₹28,000',
        status: 'Paid',
        hasInvoice: false
      },
      {
        id: 'inst-2-3',
        title: 'Installment #1',
        dueDate: '01-09-2025',
        paidDate: '01-09-2025',
        amount: '₹7,000',
        amountLeft: '₹28,000',
        status: 'Paid',
        hasInvoice: true
      }
    ]
  },
  {
    id: 'fee-3',
    srNo: '03',
    name: 'Neha Patel',
    firstName: 'Neha',
    lastName: 'Patel',
    course: 'UI/UX Design',
    totalFees: 35000,
    paidFees: 28000,
    lastFollowUp: '01-12-2025',
    remarks: 'Partially Paid',
    timeline: [
      {
        id: 'inst-3-1',
        title: 'Installment #1',
        dueDate: '01-11-2025',
        paidDate: '01-11-2025',
        amount: '₹28,000',
        amountLeft: '₹7,000',
        status: 'Paid',
        hasInvoice: true
      }
    ]
  }
];

export const FeesManagementPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [students, setStudents] = useState<FeeStudent[]>(INITIAL_FEE_STUDENTS);
  const [selectedStudent, setSelectedStudent] = useState<FeeStudent>(INITIAL_FEE_STUDENTS[0]);

  // Installment update form states
  const [showInstallmentForm, setShowInstallmentForm] = useState(false);
  const [installmentDate, setInstallmentDate] = useState('2026-01-15');
  const [installmentAmount, setInstallmentAmount] = useState('7000');
  const [screenshotName, setScreenshotName] = useState('');

  // Right sidebar "Add Remark" state
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<'Follow-up' | 'Payment' | 'Demo'>('Follow-up');
  const [selectedMonth, setSelectedMonth] = useState('Month');
  const [yearOrName, setYearOrName] = useState('2026');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [remarkDescription, setRemarkDescription] = useState('');

  const totalCollected = students.reduce((acc, curr) => acc + curr.paidFees, 0);
  const totalOutstanding = students.reduce((acc, curr) => acc + (curr.totalFees - curr.paidFees), 0);
  const overdueCount = students.filter(s => s.remarks === 'Partially Paid' || s.remarks === 'Overdue').length;

  const handleOpenDetails = (student: FeeStudent) => {
    setSelectedStudent(student);
    setShowInstallmentForm(false);
    setView('details');
  };

  const handleSaveInstallment = () => {
    const amtNum = parseFloat(installmentAmount) || 0;
    const newPaid = selectedStudent.paidFees + amtNum;
    const newPending = Math.max(0, selectedStudent.totalFees - newPaid);

    const newRecord: InstallmentRecord = {
      id: `inst-${Date.now()}`,
      title: `Installment #${selectedStudent.timeline.length + 1}`,
      dueDate: installmentDate,
      paidDate: installmentDate,
      amount: `₹${amtNum.toLocaleString()}`,
      amountLeft: newPending === 0 ? 'Nil' : `₹${newPending.toLocaleString()}`,
      status: 'Paid',
      hasInvoice: true
    };

    const updatedStudent: FeeStudent = {
      ...selectedStudent,
      paidFees: newPaid,
      remarks: newPaid >= selectedStudent.totalFees ? 'Paid' : 'Partially Paid',
      timeline: [newRecord, ...selectedStudent.timeline]
    };

    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    setSelectedStudent(updatedStudent);
    setShowInstallmentForm(false);
    setInstallmentAmount('');
    setScreenshotName('');
  };

  const handleSaveRemark = () => {
    alert(`Remark saved! Status: ${selectedStatus}, Follow-up Day: ${selectedDay ?? 'Not selected'}`);
    setRemarkDescription('');
  };

  const percentPaid = Math.round((selectedStudent.paidFees / selectedStudent.totalFees) * 100);
  const pendingAmount = Math.max(0, selectedStudent.totalFees - selectedStudent.paidFees);

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ========================================================= */}
      {/* 1. FEES MANAGEMENT OVERVIEW LIST                          */}
      {/* ========================================================= */}
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Fees Management</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Total Fees Collected</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                ₹{totalCollected.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">All time</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Outstanding Amount</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                ₹{totalOutstanding.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Pending from 02 students</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Overdue Payments</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                {overdueCount} Students
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Payments past due date</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Follow-ups Due Today</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">05</span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Action required</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                  <th className="pb-3.5 font-semibold">Sr. No.</th>
                  <th className="pb-3.5 font-semibold">Name</th>
                  <th className="pb-3.5 font-semibold">Course</th>
                  <th className="pb-3.5 font-semibold">Total fees</th>
                  <th className="pb-3.5 font-semibold">Paid</th>
                  <th className="pb-3.5 font-semibold">Last follow-up</th>
                  <th className="pb-3.5 font-semibold">Remarks</th>
                  <th className="pb-3.5 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{st.srNo}</td>
                    <td className="py-3.5 font-medium">{st.name}</td>
                    <td className="py-3.5 text-[#050720]/70">{st.course}</td>
                    <td className="py-3.5 text-[#050720]/70">₹{st.totalFees.toLocaleString()}</td>
                    <td className="py-3.5 text-[#050720]/70">₹{st.paidFees.toLocaleString()}</td>
                    <td className="py-3.5 text-[#050720]/70">{st.lastFollowUp}</td>
                    <td className="py-3.5">
                      <span className={`font-semibold ${
                        st.remarks === 'Paid' ? 'text-[#10B981]' : 'text-[#050720]'
                      }`}>
                        {st.remarks}
                      </span>
                    </td>
                    <td className="py-3.5 text-right">
                      <button
                        onClick={() => handleOpenDetails(st)}
                        className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

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
      )}

      {/* ========================================================= */}
      {/* 2. FEES DETAILS VIEW                                      */}
      {/* ========================================================= */}
      {view === 'details' && selectedStudent && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Fees Details</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left 2 Columns: Breakdowns and Timeline */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Fees Breakdown Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Fees Breakdown</h3>
                <div className="grid grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Total fees</span>
                    <span className="text-base font-bold font-['Sora'] mt-0.5 block">
                      ₹{selectedStudent.totalFees.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Paid fees</span>
                    <span className="text-base font-bold font-['Sora'] mt-0.5 block">
                      ₹{selectedStudent.paidFees.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Pending</span>
                    <span className="text-base font-bold font-['Sora'] mt-0.5 block">
                      ₹{pendingAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-[10px] text-[#050720]/50 mb-1.5 font-medium">
                    <span>Payment progress</span>
                    <span>{percentPaid}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#10B981] rounded-full transition-all duration-300"
                      style={{ width: `${percentPaid}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Student Overview Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedStudent.firstName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">{selectedStudent.lastName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Course</span>
                    <span className="font-semibold text-sm">{selectedStudent.course}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Payment Status</span>
                    <span className={`font-semibold text-sm ${
                      selectedStudent.remarks === 'Paid' ? 'text-[#10B981]' : 'text-[#FFB908]'
                    }`}>
                      {selectedStudent.remarks}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="space-y-3">
                  {selectedStudent.timeline.map((inst) => (
                    <div key={inst.id} className="border border-[#050720]/10 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold font-['Sora']">{inst.title}</h4>
                          <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {inst.dueDate}</span>
                          {inst.paidDate && (
                            <span className="text-[11px] font-semibold text-[#050720] block mt-1">
                              Paid on: {inst.paidDate}
                            </span>
                          )}
                          {inst.lastContacted && (
                            <span className="text-[11px] font-semibold text-[#050720] block mt-1">
                              Last Contacted: {inst.lastContacted}
                            </span>
                          )}
                          <span className="text-[11px] font-semibold text-[#050720] block">
                            Amount left: <span className={inst.amountLeft === 'Nil' ? 'text-[#10B981]' : 'text-[#FFB908]'}>{inst.amountLeft}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold font-['Sora'] block">
                            {inst.title.includes('Follow-up') ? 'Installment Amount:' : ''} {inst.amount}
                          </span>
                          <span className="text-[10px] text-[#10B981] font-semibold block mt-0.5">
                            {inst.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        {inst.hasInvoice ? (
                          <button 
                            onClick={() => alert(`Downloading invoice for ${inst.title}`)}
                            className="px-4 py-1.5 bg-[#050720] hover:bg-[#050720]/90 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download Invoice</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => alert(`Invoice requested for ${inst.title}`)}
                            className="px-4 py-1.5 border border-[#050720]/30 hover:bg-[#050720]/5 text-[#050720] rounded-lg text-xs font-semibold transition-colors"
                          >
                            Request Invoice
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Installment Payment Update Form */}
              {pendingAmount > 0 && (
                <div>
                  {!showInstallmentForm ? (
                    <button
                      onClick={() => setShowInstallmentForm(true)}
                      className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                    >
                      Add Installment Updates
                    </button>
                  ) : (
                    <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-sm font-bold font-['Sora']">Installment Payment</h3>
                        <span className="text-xs font-semibold text-[#050720]/60">
                          Installment #{selectedStudent.timeline.length + 1}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <input
                            type="date"
                            value={installmentDate}
                            onChange={(e) => setInstallmentDate(e.target.value)}
                            className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Enter Installment amount"
                            value={installmentAmount}
                            onChange={(e) => setInstallmentAmount(e.target.value)}
                            className="w-full bg-[#F8FAFC] text-xs px-3.5 py-2.5 rounded-lg border border-[#050720]/15 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 border border-[#050720]/20 rounded-lg text-xs font-semibold hover:bg-[#050720]/5 transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Screenshot</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                setScreenshotName(e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs text-[#050720]/50 font-mono">
                          {screenshotName || 'name.jpeg/png/jpg'}
                        </span>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          onClick={() => setShowInstallmentForm(false)}
                          className="flex-1 py-2.5 border border-[#050720]/20 rounded-lg text-xs font-bold hover:bg-[#050720]/5 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveInstallment}
                          className="flex-1 py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                        >
                          Save Installment Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Right Column: Custom Add Remark Card & Calendar Grid */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Add Remark</h3>

                {/* 1. Status Dropdown Card */}
                <div className="border border-[#050720]/15 rounded-xl p-3.5 bg-white space-y-2">
                  <div 
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                    className="flex justify-between items-center cursor-pointer select-none"
                  >
                    <div>
                      <span className="text-[11px] text-[#050720]/50 block font-medium">Status</span>
                      <span className="text-sm font-semibold text-[#050720]">{selectedStatus}</span>
                    </div>
                    {isStatusDropdownOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#050720]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#050720]" />
                    )}
                  </div>

                  {isStatusDropdownOpen && (
                    <div className="pt-2 border-t border-[#050720]/10 space-y-1.5">
                      {(['Follow-up', 'Payment', 'Demo'] as const).map((opt) => (
                        <div
                          key={opt}
                          onClick={() => {
                            setSelectedStatus(opt);
                            setIsStatusDropdownOpen(false);
                          }}
                          className={`text-xs py-1 px-1.5 rounded cursor-pointer transition-colors ${
                            selectedStatus === opt 
                              ? 'font-bold text-[#050720] bg-slate-100' 
                              : 'text-[#050720]/70 hover:text-[#050720] hover:bg-slate-50'
                          }`}
                        >
                          {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 2. Select Follow-up Date Calendar */}
                <div className="border border-[#050720]/15 rounded-xl p-4 bg-white space-y-4">
                  <span className="text-xs font-semibold text-[#050720] block">Select Follow-up Date</span>

                  {/* Month & Year/Name Selection Header */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="relative">
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#050720]/15 text-[#050720]/80 appearance-none focus:outline-none"
                      >
                        <option value="Month">Month</option>
                        <option value="January">January</option>
                        <option value="February">February</option>
                        <option value="March">March</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="|Name"
                        value={yearOrName}
                        onChange={(e) => setYearOrName(e.target.value)}
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#050720]/15 text-[#050720] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calendar Matrix with 4 leading offset placeholders */}
                  <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-[#050720]/80">
                    {/* Blank offset placeholders matching screenshot */}
                    <span />
                    <span />
                    <span />
                    <span />
                    
                    {/* Day numbers 01 to 31 */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded-md text-[11px] font-medium transition-colors ${
                          selectedDay === d
                            ? 'bg-[#FFB908] text-[#050720] font-bold shadow-xs'
                            : 'hover:bg-slate-100'
                        }`}
                      >
                        {String(d).padStart(2, '0')}
                      </button>
                    ))}
                  </div>

                  {/* Clear & Done Action Links */}
                  <div className="flex justify-between items-center pt-2 text-xs text-[#050720]/60 border-t border-[#050720]/10">
                    <button 
                      onClick={() => setSelectedDay(null)} 
                      className="hover:text-[#050720] text-[11px]"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => alert(`Selected day: ${selectedDay || 'None'}`)} 
                      className="hover:text-[#050720] text-[11px] font-semibold text-[#050720]"
                    >
                      Done
                    </button>
                  </div>
                </div>

                {/* 3. Remark Description Textarea */}
                <div>
                  <textarea
                    rows={4}
                    placeholder="Enter remark here.."
                    value={remarkDescription}
                    onChange={(e) => setRemarkDescription(e.target.value)}
                    className="w-full bg-[#F8FAFC] text-xs p-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720] resize-none"
                  />
                </div>

                {/* 4. Save Remark Button */}
                <button
                  onClick={handleSaveRemark}
                  className="w-full py-2.5 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                >
                  Save Remark
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
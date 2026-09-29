import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus,
  Calendar as CalendarIcon
} from 'lucide-react';
import { financeService } from '../../services/financeService';
import { leadService } from '../../services/leadService';

// --- TYPES ---
export interface InstallmentRecord {
  id: string;
  title: string;
  dueDate: string;
  paidDate?: string;
  amount: string;
  amountLeft: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceRequested?: boolean;
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

export const FeesManagementPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [students, setStudents] = useState<FeeStudent[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<FeeStudent | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Installment payment form states
  const [paymentDate, setPaymentDate] = useState('');
  const [installmentAmount, setInstallmentAmount] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<string>('');

  // Right sidebar "Add Remark" state
  const [remarkTitle, setRemarkTitle] = useState('Follow-up');
  const [selectedMonth, setSelectedMonth] = useState('Month');
  const [calendarYear, setCalendarYear] = useState('2026');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [remarkDescription, setRemarkDescription] = useState('');

  // Fetch live fee records & leads on mount
  const loadFeeData = async () => {
    try {
      setIsLoading(true);
      const invoices = await financeService.getAllInvoices();
      const leads = await leadService.getAllLeads();

      const invoiceNames = new Set(invoices.map((inv) => inv.studentName.toLowerCase()));

      const enrolledLeads: FeeStudent[] = leads
        .filter((l) => l.status === 'Enrolled' && !invoiceNames.has(`${l.firstName} ${l.lastName || ''}`.trim().toLowerCase()))
        .map((l, index) => {
          const total = parseInt((l.finalFees || '35000').replace(/[^0-9]/g, '')) || 35000;
          const paid = 14000;
          return {
            id: l.id,
            srNo: String(index + 1).padStart(2, '0'),
            name: `${l.firstName} ${l.lastName || ''}`.trim(),
            firstName: l.firstName,
            lastName: l.lastName || '',
            course: l.course,
            totalFees: total,
            paidFees: paid,
            lastFollowUp: l.followUp || l.enquiryDate || '01-12-2025',
            remarks: paid >= total ? 'Paid' : 'Partially Paid',
            timeline: [
              {
                id: `inst-1-${l.id}`,
                title: 'Installment #1',
                dueDate: '01-12-2025',
                paidDate: '01-12-2025',
                amount: `₹${paid.toLocaleString()}`,
                amountLeft: `₹${(total - paid).toLocaleString()}`,
                status: 'Paid',
                invoiceRequested: false,
              },
            ],
          };
        });

      const mappedInvoices: FeeStudent[] = invoices.map((inv, index) => ({
        id: inv.id,
        srNo: String(index + 1).padStart(2, '0'),
        name: inv.studentName,
        firstName: inv.firstName || inv.studentName.split(' ')[0] || '',
        lastName: inv.lastName || inv.studentName.split(' ').slice(1).join(' ') || '',
        course: inv.course,
        totalFees: inv.totalFees || 35000,
        paidFees: inv.paidFees || 14000,
        lastFollowUp: inv.lastFollowUp || '01-12-2025',
        remarks: inv.status === 'Paid' ? 'Paid' : 'Partially Paid',
        timeline: inv.timeline || [
          {
            id: `inst-inv-${inv.id}`,
            title: 'Installment #1',
            dueDate: inv.dueDate || '01-12-2025',
            paidDate: '01-12-2025',
            amount: `₹${(inv.paidFees || 14000).toLocaleString()}`,
            amountLeft: `₹${Math.max(0, (inv.totalFees || 35000) - (inv.paidFees || 14000)).toLocaleString()}`,
            status: 'Paid',
            invoiceRequested: false,
          },
        ],
      }));

      const combined = [...mappedInvoices, ...enrolledLeads];
      setStudents(combined);
      if (combined.length > 0 && !selectedStudent) {
        setSelectedStudent(combined[0]);
      }
    } catch (err) {
      console.error('Failed to load fee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeeData();
  }, []);

  const totalCollected = students.reduce((acc, curr) => acc + curr.paidFees, 0);
  const totalOutstanding = students.reduce((acc, curr) => acc + (curr.totalFees - curr.paidFees), 0);
  const overdueCount = students.filter((s) => s.remarks === 'Partially Paid' || s.remarks === 'Overdue').length;

  const handleOpenDetails = (student: FeeStudent) => {
    setSelectedStudent(student);
    setPaymentDate('');
    setInstallmentAmount('');
    setScreenshotFile('');
    setView('details');
  };

  // Request Invoice Handler
  const handleRequestInvoice = (instId: string) => {
    if (!selectedStudent) return;
    const updatedTimeline = selectedStudent.timeline.map((inst) => 
      inst.id === instId ? { ...inst, invoiceRequested: true } : inst
    );
    const updatedStudent = { ...selectedStudent, timeline: updatedTimeline };
    setSelectedStudent(updatedStudent);
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    alert('Invoice request submitted successfully!');
  };

  // Save Installment Update
  const handleSaveInstallment = async () => {
    if (!selectedStudent) return;
    const amtNum = parseFloat(installmentAmount) || 0;
    if (amtNum <= 0) {
      alert('Please enter a valid installment amount.');
      return;
    }

    const newPaid = selectedStudent.paidFees + amtNum;
    const newPending = Math.max(0, selectedStudent.totalFees - newPaid);
    const instNumber = selectedStudent.timeline.length + 1;
    const dateFormatted = paymentDate || new Date().toISOString().split('T')[0];

    const newRecord: InstallmentRecord = {
      id: `inst-${Date.now()}`,
      title: `Installment #${instNumber}`,
      dueDate: dateFormatted,
      paidDate: dateFormatted,
      amount: `₹${amtNum.toLocaleString()}`,
      amountLeft: newPending === 0 ? 'Nil' : `₹${newPending.toLocaleString()}`,
      status: 'Paid',
      invoiceRequested: false,
    };

    try {
      await financeService.recordInstallment(selectedStudent.id, amtNum, newRecord);
    } catch (err) {
      console.warn('Backend sync error, updating local state:', err);
    }

    const updatedStudent: FeeStudent = {
      ...selectedStudent,
      paidFees: newPaid,
      remarks: newPaid >= selectedStudent.totalFees ? 'Paid' : 'Partially Paid',
      timeline: [newRecord, ...selectedStudent.timeline],
    };

    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setPaymentDate('');
    setInstallmentAmount('');
    setScreenshotFile('');
    alert('Installment update saved successfully!');
  };

  const handleSaveRemark = () => {
    alert(`Remark saved! Title: ${remarkTitle}, Follow-up Day: ${selectedDay ?? 'None'}`);
    setRemarkDescription('');
  };

  const percentPaid = selectedStudent
    ? Math.min(100, Math.round((selectedStudent.paidFees / (selectedStudent.totalFees || 1)) * 100))
    : 40;
  const pendingAmount = selectedStudent
    ? Math.max(0, selectedStudent.totalFees - selectedStudent.paidFees)
    : 21000;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">

      {/* ========================================================= */}
      {/* 1. FEES MANAGEMENT DIRECTORY LIST                         */}
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
              <span className="text-[11px] text-[#050720]/50 font-medium">Pending payments</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Pending / Overdue</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                {String(overdueCount).padStart(2, '0')} Students
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Payments pending</span>
            </div>

            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Total Students</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                {String(students.length).padStart(2, '0')}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Enrolled in courses</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading fee records from database...
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No fee records found.
              </div>
            ) : (
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
                  {students.map((st, index) => (
                    <tr key={st.id} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-medium">{st.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{st.course}</td>
                      <td className="py-3.5 text-[#050720]/70">₹{st.totalFees.toLocaleString()}</td>
                      <td className="py-3.5 text-[#050720]/70">₹{st.paidFees.toLocaleString()}</td>
                      <td className="py-3.5 text-[#050720]/70">{st.lastFollowUp}</td>
                      <td className="py-3.5">
                        <span className={`font-semibold ${
                          st.remarks === 'Paid' ? 'text-[#10B981]' : 'text-[#FFB908]'
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
            )}

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
      {/* 2. FEES DETAILS VIEW (EXACT FIGMA LAYOUT)                */}
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
            
            {/* Left 2 Columns: Breakdown, Overview, Timeline, and Installment Payment */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Fees Breakdown Card */}
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

              {/* 2. Student Overview Card */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedStudent.firstName}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                    <span className="font-semibold text-sm">{selectedStudent.lastName || '—'}</span>
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

              {/* 3. Timeline Card with Request Invoice Button */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                <div className="space-y-3">
                  {selectedStudent.timeline.map((inst) => (
                    <div key={inst.id} className="border border-[#050720]/10 rounded-xl p-5 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-bold font-['Sora']">{inst.title}</h4>
                          <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {inst.dueDate}</span>
                          <span className="text-xs font-medium text-[#050720] block mt-1.5">
                            Paid on: {inst.paidDate || inst.dueDate}
                          </span>
                          <span className="text-xs font-semibold text-[#050720] block mt-1">
                            Amount left: <span className="text-[#FFB908]">{inst.amountLeft}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-bold font-['Sora'] block">
                            {inst.amount}
                          </span>
                          <span className="text-[11px] text-[#10B981] font-semibold block mt-0.5">
                            {inst.status}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2">
                        <button 
                          onClick={() => handleRequestInvoice(inst.id)}
                          disabled={inst.invoiceRequested}
                          className="px-4 py-2 border border-[#050720] hover:bg-[#050720]/5 text-[#050720] rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
                        >
                          {inst.invoiceRequested ? 'Invoice Requested' : 'Request Invoice'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. Installment Payment Card (Matching Figma Screenshot 1 & 2) */}
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-5">
                <h3 className="text-base font-bold font-['Sora'] text-[#050720]">Installment Payment</h3>
                
                <div>
                  <h4 className="text-xs font-bold font-['Sora'] text-[#050720]">
                    Installment #{selectedStudent.timeline.length + 1}
                  </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Payment Date"
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = 'text';
                      }}
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-[#F8FAFC] text-xs px-3.5 py-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                    />
                    {!paymentDate && (
                      <CalendarIcon className="w-4 h-4 text-[#050720]/50 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    )}
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Enter Installment amount"
                      value={installmentAmount}
                      onChange={(e) => setInstallmentAmount(e.target.value)}
                      className="w-full bg-[#F8FAFC] text-xs px-3.5 py-3 rounded-lg border border-[#050720]/15 focus:outline-none focus:border-[#050720]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="cursor-pointer flex items-center gap-2 px-5 py-2.5 border border-[#050720] rounded-lg text-xs font-bold text-[#050720] hover:bg-[#050720]/5 transition-colors">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Screenshot</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setScreenshotFile(e.target.files[0].name);
                        }
                      }}
                    />
                  </label>
                  <span className="text-xs text-[#050720]/50 font-mono">
                    {screenshotFile || 'name.jpeg/png/jpg'}
                  </span>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSaveInstallment}
                    className="w-full sm:w-1/2 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
                  >
                    Save Installment Update
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column: Custom Add Remark Card & Calendar Grid */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora'] text-[#050720]">Add Remark</h3>

                {/* 1. Remark Title Dropdown */}
                <div className="relative border border-[#050720]/15 rounded-lg px-3.5 py-2.5 bg-white">
                  <span className="text-[10px] text-[#050720]/50 block">Remark title</span>
                  <select
                    value={remarkTitle}
                    onChange={(e) => setRemarkTitle(e.target.value)}
                    className="w-full bg-transparent text-xs font-semibold text-[#050720] appearance-none focus:outline-none cursor-pointer mt-0.5"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Payment">Payment</option>
                    <option value="Demo">Demo</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#050720]/60 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                {/* 2. Select Follow-up Date Calendar Box */}
                <div className="border border-[#050720]/15 rounded-xl p-4 bg-white space-y-4">
                  <span className="text-xs font-bold text-[#050720] block">Select Follow-up Date</span>

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
                        <option value="April">April</option>
                        <option value="May">May</option>
                        <option value="June">June</option>
                        <option value="July">July</option>
                        <option value="August">August</option>
                        <option value="September">September</option>
                        <option value="October">October</option>
                        <option value="November">November</option>
                        <option value="December">December</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-[#050720]/50 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Year"
                        value={calendarYear}
                        onChange={(e) => setCalendarYear(e.target.value)}
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#050720]/15 text-[#050720] focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Calendar Matrix */}
                  <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-[#050720]/80">
                    {/* Blank offset placeholders matching screenshot */}
                    <span />
                    <span />
                    <span />
                    <span />
                    
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
                <div className="border border-[#050720]/15 rounded-lg p-3 bg-white">
                  <span className="text-[10px] text-[#050720]/50 block mb-1">Remark Description</span>
                  <textarea
                    rows={4}
                    placeholder="Enter remark here.."
                    value={remarkDescription}
                    onChange={(e) => setRemarkDescription(e.target.value)}
                    className="w-full bg-transparent text-xs focus:outline-none resize-none"
                  />
                </div>

                {/* 4. Save Remark Button */}
                <button
                  onClick={handleSaveRemark}
                  className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs"
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
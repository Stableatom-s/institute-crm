import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown, 
  Plus, 
  Calendar as CalendarIcon, 
  Download 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { leadService } from '../../services/leadService';

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
  approvalStatus: 'Approved' | 'Requests' | 'Cancelled' | 'None';
  invoiceId?: string;
  timeline: InstallmentRecord[];
}

export const FeesManagementPage: React.FC = () => {
  const auth = useAuth() as any;

  const getActiveUser = () => {
    if (auth?.user?.name) return auth.user;
    try {
      const stored = localStorage.getItem('crm_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const activeUser = getActiveUser();
  const currentSalesName = (activeUser?.name || '').trim().toLowerCase();
  const userRole = (activeUser?.role || '').trim().toLowerCase();

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

  const loadFeeData = async () => {
    try {
      setIsLoading(true);
      const [invoices, leads] = await Promise.all([
        financeService.getAllInvoices(),
        leadService.getAllLeads(),
      ]);

      const myLeads = leads.filter((l: any) => {
        if (userRole === 'admin' || userRole === 'super admin') return true;

        const assigned = (l.assignedTo || '').trim().toLowerCase();
        if (!currentSalesName) return true;

        return (
          assigned === currentSalesName ||
          (currentSalesName.length > 0 && assigned.includes(currentSalesName)) ||
          (assigned.length > 0 && currentSalesName.includes(assigned)) ||
          assigned === '' ||
          assigned === 'unassigned' ||
          assigned === 'sales'
        );
      });

      const myLeadNames = new Set(
        myLeads.map((l: any) => `${l.firstName || ''} ${l.lastName || ''}`.trim().toLowerCase())
      );

      const invoiceNames = new Set(invoices.map((inv) => inv.studentName.trim().toLowerCase()));

      const enrolledLeads: FeeStudent[] = myLeads
        .filter(
          (l) =>
            l.status === 'Enrolled' &&
            !invoiceNames.has(`${l.firstName || ''} ${l.lastName || ''}`.trim().toLowerCase())
        )
        .map((l, index) => {
          const total = parseInt((l.finalFees || '0').replace(/[^0-9]/g, ''), 10) || 0;
          return {
            id: l.id,
            srNo: String(index + 1).padStart(2, '0'),
            name: `${l.firstName || ''} ${l.lastName || ''}`.trim(),
            firstName: l.firstName || '',
            lastName: l.lastName || '',
            course: l.course || '—',
            totalFees: total,
            paidFees: 0,
            lastFollowUp: l.followUp || l.enquiryDate || '—',
            remarks: 'Partially Paid',
            approvalStatus: 'None',
            timeline: [],
          };
        });

      const mappedInvoices: FeeStudent[] = invoices
        .filter((inv) => {
          if (userRole === 'admin' || userRole === 'super admin') return true;
          return myLeadNames.has(inv.studentName.trim().toLowerCase());
        })
        .map((inv, index) => {
          const isApproved = inv.approvalStatus === 'Approved';
          const rawPaid = inv.paidFees || 0;
          const boundedPaid = isApproved ? Math.min(inv.totalFees || 0, rawPaid) : 0;

          return {
            id: inv.id,
            srNo: String(index + 1).padStart(2, '0'),
            name: inv.studentName,
            firstName: inv.firstName || inv.studentName.split(' ')[0] || '',
            lastName: inv.lastName || inv.studentName.split(' ').slice(1).join(' ') || '',
            course: inv.course,
            totalFees: inv.totalFees || 0,
            paidFees: boundedPaid,
            lastFollowUp: inv.lastFollowUp || '—',
            remarks: boundedPaid >= inv.totalFees && inv.totalFees > 0 ? 'Paid' : (inv.paymentStatus || 'Partially Paid'),
            approvalStatus: inv.approvalStatus || 'None',
            invoiceId: inv.invoiceCode,
            timeline: (inv.timeline || []).map((t: any) => ({
              id: t.id,
              title: t.installmentTitle || t.title,
              dueDate: t.dueDate,
              paidDate: t.paidDate,
              amount: t.amount,
              amountLeft: t.amountLeft,
              status: isApproved ? 'Paid' : 'Pending',
              invoiceRequested: inv.approvalStatus === 'Requests',
            })),
          };
        });

      const combined = [...mappedInvoices, ...enrolledLeads];
      setStudents(combined);
      if (combined.length > 0 && !selectedStudent) {
        setSelectedStudent(combined[0]);
      } else if (combined.length === 0) {
        setSelectedStudent(null);
      }
    } catch (err) {
      console.error('Failed to load fee data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadFeeData();
  }, [currentSalesName, userRole]);

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

  const handleDownloadInvoice = (student: FeeStudent, inst: InstallmentRecord) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice - ${student.invoiceId || 'GST/001'}</title>
            <style>
              body { font-family: sans-serif; padding: 24px; color: #050720; }
              .header { text-align: center; border-bottom: 2px solid #050720; padding-bottom: 12px; }
              .details { margin-top: 20px; line-height: 1.6; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #050720; padding: 8px 12px; text-align: left; }
              .total { text-align: right; font-weight: bold; margin-top: 15px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Radiquolab Private Limited</h2>
              <p>Horizon Chambers, Shop No. 6, GAT NO 281/2, Kasar Amboli Ghotawade, Pirangut, Pune 412115</p>
              <p>Tax Invoice - <strong>${student.invoiceId || 'GST/001'}</strong></p>
            </div>
            <div class="details">
              <p><strong>Student Name:</strong> ${student.name}</p>
              <p><strong>Course:</strong> ${student.course}</p>
              <p><strong>Date:</strong> ${inst.paidDate || inst.dueDate}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Installment</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${student.course} Tuition Fee</td>
                  <td>${inst.title}</td>
                  <td>${inst.amount}</td>
                </tr>
              </tbody>
            </table>
            <div class="total">
              <p>Total Paid: ${inst.amount}</p>
              <p>Status: Approved (Paid)</p>
            </div>
            <script>window.print();</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleRequestInvoice = async (instId: string) => {
    if (!selectedStudent) return;
    try {
      const targetInst = selectedStudent.timeline.find((i) => i.id === instId);
      const parsedAmount = targetInst ? parseInt(targetInst.amount.replace(/[^0-9]/g, ''), 10) || 0 : 0;

      await financeService.createInvoice({
        studentName: selectedStudent.name,
        firstName: selectedStudent.firstName,
        lastName: selectedStudent.lastName,
        course: selectedStudent.course,
        totalFees: selectedStudent.totalFees,
        paidFees: parsedAmount,
        dueDate: targetInst?.dueDate || selectedStudent.lastFollowUp || '—',
        approvalStatus: 'Requests',
        paymentStatus: selectedStudent.remarks,
        timeline: selectedStudent.timeline.map((inst) => ({
          id: inst.id,
          installmentTitle: inst.title,
          dueDate: inst.dueDate,
          paidDate: inst.paidDate,
          amount: inst.amount,
          amountLeft: inst.amountLeft,
          status: 'Pending',
        })),
      });

      const updatedTimeline = selectedStudent.timeline.map((inst) =>
        inst.id === instId ? { ...inst, invoiceRequested: true } : inst
      );
      const updatedStudent: FeeStudent = { 
        ...selectedStudent, 
        approvalStatus: 'Requests',
        timeline: updatedTimeline 
      };
      setSelectedStudent(updatedStudent);
      setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
      
      alert('Invoice request submitted! It is now pending approval from Admin.');
    } catch (err) {
      console.error('Failed to submit invoice request:', err);
      alert('Could not send invoice request to server.');
    }
  };

  const handleSaveInstallment = async () => {
    if (!selectedStudent) return;
    const amtNum = parseFloat(installmentAmount) || 0;
    if (amtNum <= 0) {
      alert('Please enter a valid installment amount.');
      return;
    }

    const instNumber = selectedStudent.timeline.length + 1;
    const dateFormatted = paymentDate || new Date().toISOString().split('T')[0];
    const newRemaining = Math.max(0, selectedStudent.totalFees - selectedStudent.paidFees - amtNum);

    const newRecord: InstallmentRecord = {
      id: `inst-${Date.now()}`,
      title: `Installment #${instNumber}`,
      dueDate: dateFormatted,
      paidDate: dateFormatted,
      amount: `₹${amtNum.toLocaleString()}`,
      amountLeft: newRemaining === 0 ? 'Nil' : `₹${newRemaining.toLocaleString()}`,
      status: 'Pending',
      invoiceRequested: false,
    };

    try {
      await financeService.recordInstallment(selectedStudent.id, amtNum, newRecord);
    } catch (err) {
      console.warn('Backend sync warning:', err);
    }

    const updatedStudent: FeeStudent = {
      ...selectedStudent,
      timeline: [newRecord, ...selectedStudent.timeline],
    };

    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
    setSelectedStudent(updatedStudent);
    setPaymentDate('');
    setInstallmentAmount('');
    setScreenshotFile('');
    alert('Installment submitted! Click "Request Invoice" to send to Admin for approval.');
  };

  const handleSaveRemark = () => {
    alert(`Remark saved! Title: ${remarkTitle}, Follow-up Day: ${selectedDay ?? 'None'}`);
    setRemarkDescription('');
  };

  const percentPaid = selectedStudent && selectedStudent.totalFees > 0
    ? Math.min(100, Math.round((selectedStudent.paidFees / selectedStudent.totalFees) * 100))
    : 0;
  const pendingAmount = selectedStudent
    ? Math.max(0, selectedStudent.totalFees - selectedStudent.paidFees)
    : 0;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Fees Management</h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-[#050720]/10 text-center shadow-xs">
              <span className="text-xs font-bold block">Total Fees Collected</span>
              <span className="text-2xl font-extrabold font-['Sora'] mt-1 block">
                ₹{totalCollected.toLocaleString()}
              </span>
              <span className="text-[11px] text-[#050720]/50 font-medium">Your students</span>
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
              <span className="text-[11px] text-[#050720]/50 font-medium">Assigned to you</span>
            </div>
          </div>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading fee records from database...
              </div>
            ) : students.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No fee records found for your assigned students.
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
                      <td className="py-3.5 text-[#050720]/70 font-semibold">₹{st.paidFees.toLocaleString()}</td>
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
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
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
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronLeft className="w-3.5 h-3.5" /></button>
                <span className="text-[11px] font-semibold text-[#050720]">01 of 10</span>
                <button className="p-1 hover:text-[#050720] cursor-pointer"><ChevronRight className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === 'details' && selectedStudent && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Fees Details</span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
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

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
                <div className="grid grid-cols-2 gap-y-4 text-xs">
                  <div>
                    <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                    <span className="font-semibold text-sm">{selectedStudent.firstName || '—'}</span>
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

              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
                {selectedStudent.timeline.length === 0 ? (
                  <p className="text-xs text-[#050720]/40 italic py-2">
                    No installments recorded yet. Add an installment payment below.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedStudent.timeline.map((inst) => {
                      const isApproved = selectedStudent.approvalStatus === 'Approved';
                      const isRequested = selectedStudent.approvalStatus === 'Requests' || inst.invoiceRequested;
                      const isRejected = selectedStudent.approvalStatus === 'Cancelled';

                      return (
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
                              <span className={`text-[11px] font-semibold block mt-0.5 ${
                                isApproved ? 'text-[#10B981]' : isRejected ? 'text-[#EF4444]' : 'text-[#FFB908]'
                              }`}>
                                {isApproved ? 'Paid' : isRejected ? 'Rejected' : 'Pending Approval'}
                              </span>
                            </div>
                          </div>

                          <div className="flex justify-end pt-2">
                            {isApproved ? (
                              <button 
                                onClick={() => handleDownloadInvoice(selectedStudent, inst)}
                                className="px-5 py-2.5 bg-[#050720] hover:bg-[#050720]/90 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-2"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Invoice</span>
                              </button>
                            ) : isRejected ? (
                              <button 
                                onClick={() => handleRequestInvoice(inst.id)}
                                className="px-4 py-2 border border-rose-400 text-rose-600 rounded-lg text-xs font-bold hover:bg-rose-50 cursor-pointer"
                              >
                                Rejected — Request Again
                              </button>
                            ) : isRequested ? (
                              <button 
                                disabled
                                className="px-4 py-2 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold cursor-not-allowed opacity-80"
                              >
                                Pending Admin Approval
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleRequestInvoice(inst.id)}
                                className="px-4 py-2 border border-[#050720] hover:bg-[#050720]/5 text-[#050720] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                              >
                                Request Invoice
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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
                    className="w-full sm:w-1/2 py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
                  >
                    Save Installment Update
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold font-['Sora'] text-[#050720]">Add Remark</h3>

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
                  <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-3 text-[#050720]/40 pointer-events-none" />
                </div>

                <div className="border border-[#050720]/15 rounded-xl p-4 bg-white space-y-4">
                  <span className="text-xs font-bold text-[#050720] block">Select Follow-up Date</span>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="relative">
                      <select 
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#050720]/15 text-[#050720]/80 appearance-none focus:outline-none cursor-pointer"
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
                        className="w-full bg-white text-xs px-2.5 py-1.5 rounded-md border border-[#050720]/15 text-[#050720] focus:outline-none text-center"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-y-2 text-center text-xs text-[#050720]/80">
                    <span /><span /><span /><span />
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDay(d)}
                        className={`h-7 w-7 mx-auto flex items-center justify-center rounded-md text-[11px] font-medium transition-colors cursor-pointer ${
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
                      className="hover:text-[#050720] text-[11px] cursor-pointer"
                    >
                      Clear
                    </button>
                    <button 
                      onClick={() => alert(`Selected day: ${selectedDay || 'None'}`)} 
                      className="hover:text-[#050720] text-[11px] font-semibold text-[#050720] cursor-pointer"
                    >
                      Done
                    </button>
                  </div>
                </div>

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

                <button
                  onClick={handleSaveRemark}
                  className="w-full py-3 bg-[#FFB908] hover:bg-[#E5A607] rounded-lg text-xs font-bold text-[#050720] transition-colors shadow-xs cursor-pointer"
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
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { financeService } from '../../services/financeService';
import { leadService } from '../../services/leadService';

interface TimelineItem {
  id: string;
  installmentTitle: string;
  dueDate: string;
  paidDate: string;
  amount: string;
  amountLeft: string;
  status: string;
}

interface InvoiceItem {
  id: string;
  srNo: string;
  name: string;
  firstName: string;
  lastName: string;
  course: string;
  paidFees: number;
  totalFees: number;
  followUp: string;
  dueDate: string;
  invoiceId: string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Overdue';
  approvalStatus: 'Approved' | 'Requests' | 'Cancelled';
  timeline: TimelineItem[];
}

export const SalesInvoicesPage: React.FC = () => {
  const auth = useAuth() as any;
  const currentSalesName = (auth?.user?.name || '').trim().toLowerCase();

  const [view, setView] = useState<'list' | 'details'>('list');
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load only invoices and enrolled students belonging to this salesperson
  const loadInvoices = async () => {
    try {
      setIsLoading(true);
      const [dbInvoices, leads] = await Promise.all([
        financeService.getAllInvoices(),
        leadService.getAllLeads(),
      ]);

      const myLeads = leads.filter((l: any) => {
        const assigned = (l.assignedTo || '').trim().toLowerCase();
        return (
          assigned === currentSalesName ||
          (currentSalesName.length > 0 && assigned.includes(currentSalesName)) ||
          (assigned.length > 0 && currentSalesName.includes(assigned))
        );
      });

      const myLeadNames = new Set(
        myLeads.map((l: any) => `${l.firstName || ''} ${l.lastName || ''}`.trim().toLowerCase())
      );

      const existingNames = new Set(
        dbInvoices.map((i) => i.studentName.trim().toLowerCase())
      );

      const enrolledInvoices: InvoiceItem[] = myLeads
        .filter(
          (l) =>
            l.status === 'Enrolled' &&
            !existingNames.has(`${l.firstName || ''} ${l.lastName || ''}`.trim().toLowerCase())
        )
        .map((l, index) => {
          const total = parseInt((l.finalFees || '0').replace(/[^0-9]/g, ''), 10) || 0;
          return {
            id: l.id,
            srNo: String(index + 1).padStart(2, '0'),
            name: `${l.firstName || ''} ${l.lastName || ''}`.trim() || 'Student',
            firstName: l.firstName || '',
            lastName: l.lastName || '',
            course: l.course || '—',
            paidFees: 0,
            totalFees: total,
            followUp: l.followUp || '—',
            dueDate: l.enquiryDate || '—',
            invoiceId: `GST/${String(index + 1).padStart(3, '0')}`,
            paymentStatus: 'Partially Paid',
            approvalStatus: 'Requests',
            timeline: [],
          };
        });

      const mappedInvoices: InvoiceItem[] = dbInvoices
        .filter((inv) => myLeadNames.has(inv.studentName.trim().toLowerCase()))
        .map((inv, index) => {
          const isApproved = inv.approvalStatus === 'Approved';
          const effectivePaid = isApproved ? (inv.paidFees || 0) : 0;

          let timelineItems: TimelineItem[] = (inv.timeline || []).map((t: any, tIdx: number) => ({
            id: t.id || `t-${tIdx}`,
            installmentTitle: t.installmentTitle || `Installment #${tIdx + 1}`,
            dueDate: t.dueDate || inv.dueDate || '01-12-2025',
            paidDate: t.paidDate || inv.approvedOn || '01-12-2025',
            amount: t.amount || `₹${(effectivePaid || inv.totalFees || 35000).toLocaleString()}`,
            amountLeft: t.amountLeft || (inv.remainingFees === 0 ? 'Nil' : `₹${(inv.remainingFees || 0).toLocaleString()}`),
            status: isApproved ? 'Paid' : 'Pending',
          }));

          if (timelineItems.length === 0 && effectivePaid > 0) {
            timelineItems = [
              {
                id: `inst-1-${inv.id}`,
                installmentTitle: 'Installment #1',
                dueDate: inv.dueDate || '01-12-2025',
                paidDate: inv.approvedOn || inv.dueDate || '01-12-2025',
                amount: `₹${effectivePaid.toLocaleString()}`,
                amountLeft: inv.remainingFees === 0 ? 'Nil' : `₹${(inv.remainingFees || 0).toLocaleString()}`,
                status: 'Paid',
              },
            ];
          }

          return {
            id: inv.id,
            srNo: String(index + 1).padStart(2, '0'),
            name: inv.studentName || '—',
            firstName: inv.firstName || inv.studentName?.split(' ')[0] || '',
            lastName: inv.lastName || inv.studentName?.split(' ').slice(1).join(' ') || '',
            course: inv.course || '—',
            paidFees: effectivePaid,
            totalFees: inv.totalFees || 0,
            followUp: inv.lastFollowUp || '—',
            dueDate: inv.dueDate || '—',
            invoiceId: inv.invoiceCode || `GST/${String(index + 1).padStart(3, '0')}`,
            paymentStatus: inv.paymentStatus || 'Partially Paid',
            approvalStatus: inv.approvalStatus || 'Requests',
            timeline: timelineItems,
          };
        });

      const fullList = [...mappedInvoices, ...enrolledInvoices];
      setInvoices(fullList);

      if (fullList.length > 0 && !selectedInvoice) {
        setSelectedInvoice(fullList[0]);
      } else if (fullList.length === 0) {
        setSelectedInvoice(null);
      }
    } catch (err) {
      console.error('Failed to load invoices from server:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentSalesName) {
      loadInvoices();
    }
  }, [currentSalesName]);

  const handleDownloadPDF = (inv: InvoiceItem, installmentTitle?: string, amount?: string) => {
    if (inv.approvalStatus !== 'Approved') {
      alert(`Invoice ${inv.invoiceId} is currently "${inv.approvalStatus}". Only Admin-approved invoices can be downloaded.`);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Tax Invoice - ${inv.invoiceId}</title>
            <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #050720; }
              .header { text-align: center; border-bottom: 2px solid #050720; padding-bottom: 15px; margin-bottom: 20px; }
              .header h2 { margin: 0 0 5px 0; font-size: 20px; }
              .header p { margin: 2px 0; font-size: 12px; color: #555; }
              .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 13px; }
              th, td { border: 1px solid #050720; padding: 10px; text-align: left; }
              th { background-color: #f8fafc; font-weight: bold; }
              .total-box { margin-top: 20px; text-align: right; font-size: 14px; font-weight: bold; }
              .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 11px; }
            </style>
          </head>
          <body>
            <div class="header">
              <h2>Radiquolab Private Limited</h2>
              <p>Horizon Chambers, Shop No. 6, GAT NO 281/2, Pirangut, Mulshi, Pune 412115</p>
              <p>GSTIN: 27AANCR8297C1ZT | Email: info@radiquolab.com</p>
              <h3 style="margin-top: 10px;">TAX INVOICE - ${inv.invoiceId}</h3>
            </div>
            <div class="meta-grid">
              <div>
                <strong>Billed To:</strong><br/>
                ${inv.name}<br/>
                Course: ${inv.course}
              </div>
              <div style="text-align: right;">
                <strong>Invoice Date:</strong> ${inv.dueDate || '01-12-2025'}<br/>
                <strong>Payment Status:</strong> Paid (Approved)
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Sr. No.</th>
                  <th>Description</th>
                  <th>Installment</th>
                  <th style="text-align: right;">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>01</td>
                  <td>${inv.course} Program Fees</td>
                  <td>${installmentTitle || 'Installment #1'}</td>
                  <td style="text-align: right;">${amount || `₹${inv.paidFees.toLocaleString()}`}</td>
                </tr>
              </tbody>
            </table>
            <div class="total-box">
              Grand Total: ${amount || `₹${inv.paidFees.toLocaleString()}`}
            </div>
            <div class="footer">
              <div>Terms: 30 Days</div>
              <div>Authorised Signature</div>
            </div>
            <script>
              window.print();
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleOpenDetails = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setView('details');
  };

  const percentPaid = selectedInvoice && selectedInvoice.totalFees > 0
    ? Math.min(100, Math.round((selectedInvoice.paidFees / selectedInvoice.totalFees) * 100))
    : 0;
  const pendingAmount = selectedInvoice
    ? Math.max(0, selectedInvoice.totalFees - selectedInvoice.paidFees)
    : 0;

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      {/* 1. INVOICE TABLE DIRECTORY VIEW */}
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Invoice</h1>
          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                Loading invoices from database...
              </div>
            ) : invoices.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#050720]/50">
                No invoices found for your assigned students.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#050720]/10 text-[#050720] font-bold">
                    <th className="pb-3.5 font-semibold">Sr. No.</th>
                    <th className="pb-3.5 font-semibold">Name</th>
                    <th className="pb-3.5 font-semibold">Course</th>
                    <th className="pb-3.5 font-semibold">Paid fees</th>
                    <th className="pb-3.5 font-semibold">Follow-up</th>
                    <th className="pb-3.5 font-semibold">Due Date</th>
                    <th className="pb-3.5 font-semibold">Invoice ID</th>
                    <th className="pb-3.5 text-right font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#050720]/5 text-[#050720]">
                  {invoices.map((inv, index) => (
                    <tr key={`${inv.id}-${inv.invoiceId}`} className="hover:bg-[#FFB908]/5 transition-colors">
                      <td className="py-3.5 text-[#050720]/70">
                        {String(index + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3.5 font-medium">{inv.name}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                      <td className="py-3.5 text-[#050720]/70 font-semibold">₹{inv.paidFees.toLocaleString()}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.followUp}</td>
                      <td className="py-3.5 text-[#050720]/70">{inv.dueDate}</td>
                      <td className="py-3.5 font-medium text-[#050720]">{inv.invoiceId}</td>
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inv.approvalStatus === 'Approved' ? (
                            <button
                              onClick={() => handleDownloadPDF(inv)}
                              title="Download Approved Invoice"
                              className="p-1 text-[#050720] hover:text-black transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          ) : inv.approvalStatus === 'Cancelled' ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              <Ban className="w-3 h-3" />
                              <span>Rejected</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              <Clock className="w-3 h-3" />
                              <span>Pending Approval</span>
                            </span>
                          )}
                          <button
                            onClick={() => handleOpenDetails(inv)}
                            className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors cursor-pointer"
                          >
                            View
                          </button>
                        </div>
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

      {/* 2. INVOICE DETAILS DRILLDOWN VIEW */}
      {view === 'details' && selectedInvoice && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity cursor-pointer"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Invoice Details</span>
          </button>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Fees Breakdown</h3>
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Total fees</span>
                <span className="text-base font-bold font-['Sora'] mt-0.5 block">
                  ₹{selectedInvoice.totalFees.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Paid fees</span>
                <span className="text-base font-bold font-['Sora'] mt-0.5 block">
                  ₹{selectedInvoice.paidFees.toLocaleString()}
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
                <span className="font-semibold text-sm">{selectedInvoice.firstName || selectedInvoice.name.split(' ')[0] || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">{selectedInvoice.lastName || selectedInvoice.name.split(' ').slice(1).join(' ') || '—'}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedInvoice.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Payment Status</span>
                <span className="font-semibold text-sm text-[#10B981]">
                  {selectedInvoice.paidFees >= selectedInvoice.totalFees && selectedInvoice.totalFees > 0 ? 'Paid' : selectedInvoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
            {selectedInvoice.timeline.length === 0 ? (
              <p className="text-xs text-[#050720]/40 italic py-2">
                No installments recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {selectedInvoice.timeline.map((inst) => (
                  <div key={inst.id} className="border border-[#050720]/10 rounded-xl p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-bold font-['Sora'] text-[#050720]">{inst.installmentTitle}</h4>
                        <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {inst.dueDate}</span>
                        <span className="text-xs font-medium text-[#050720] block mt-1.5">
                          Paid on: {inst.paidDate}
                        </span>
                        <span className="text-xs font-semibold text-[#050720] block mt-1">
                          Amount left: <span className="text-[#10B981]">{inst.amountLeft}</span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-bold font-['Sora'] block text-[#050720]">{inst.amount}</span>
                        <span className="text-[10px] text-[#10B981] font-semibold block mt-0.5">
                          {inst.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        onClick={() => handleDownloadPDF(selectedInvoice, inst.installmentTitle, inst.amount)}
                        className="px-6 py-2.5 bg-[#050720] hover:bg-[#050720]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs cursor-pointer"
                      >
                        Download Invoice
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
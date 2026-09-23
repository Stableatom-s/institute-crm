import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Download, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

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
  paymentStatus: 'Paid' | 'Partially Paid';
  timeline: {
    id: string;
    installmentTitle: string;
    dueDate: string;
    paidDate: string;
    amount: string;
    amountLeft: string;
    status: string;
  }[];
}

const INITIAL_INVOICES: InvoiceItem[] = [
  {
    id: 'inv-1',
    srNo: '01',
    name: 'Ashish Mehta',
    firstName: 'Ashish',
    lastName: 'Mehta',
    course: 'No Code',
    paidFees: 35000,
    totalFees: 35000,
    followUp: '30-11-2025',
    dueDate: '01-12-2025',
    invoiceId: 'GST/001',
    paymentStatus: 'Paid',
    timeline: [
      {
        id: 't-1',
        installmentTitle: 'Installment #1',
        dueDate: '01-12-2025',
        paidDate: '01-12-2025',
        amount: '₹35,000',
        amountLeft: 'Nil',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inv-2',
    srNo: '02',
    name: 'Ashu Patel',
    firstName: 'Ashu',
    lastName: 'Patel',
    course: 'UI/UX Design',
    paidFees: 35000,
    totalFees: 35000,
    followUp: '30-11-2025',
    dueDate: '01-12-2025',
    invoiceId: 'GST/002',
    paymentStatus: 'Paid',
    timeline: [
      {
        id: 't-2',
        installmentTitle: 'Installment #1',
        dueDate: '01-12-2025',
        paidDate: '01-12-2025',
        amount: '₹35,000',
        amountLeft: 'Nil',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inv-3',
    srNo: '03',
    name: 'Neha Patel',
    firstName: 'Neha',
    lastName: 'Patel',
    course: 'UI/UX Design',
    paidFees: 7000,
    totalFees: 35000,
    followUp: '30-11-2025',
    dueDate: '01-12-2025',
    invoiceId: 'GST/003',
    paymentStatus: 'Partially Paid',
    timeline: [
      {
        id: 't-3',
        installmentTitle: 'Installment #4',
        dueDate: '01-12-2025',
        paidDate: '01-12-2025',
        amount: '₹7,000',
        amountLeft: '₹7,000',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inv-4',
    srNo: '04',
    name: 'Neha Patel',
    firstName: 'Neha',
    lastName: 'Patel',
    course: 'UI/UX Design',
    paidFees: 7000,
    totalFees: 35000,
    followUp: '30-10-2025',
    dueDate: '01-11-2025',
    invoiceId: 'GST/004',
    paymentStatus: 'Partially Paid',
    timeline: [
      {
        id: 't-4',
        installmentTitle: 'Installment #3',
        dueDate: '01-11-2025',
        paidDate: '01-11-2025',
        amount: '₹7,000',
        amountLeft: '₹14,000',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inv-5',
    srNo: '05',
    name: 'Neha Patel',
    firstName: 'Neha',
    lastName: 'Patel',
    course: 'UI/UX Design',
    paidFees: 7000,
    totalFees: 35000,
    followUp: '30-09-2025',
    dueDate: '01-10-2025',
    invoiceId: 'GST/005',
    paymentStatus: 'Partially Paid',
    timeline: [
      {
        id: 't-5',
        installmentTitle: 'Installment #2',
        dueDate: '01-10-2025',
        paidDate: '01-10-2025',
        amount: '₹7,000',
        amountLeft: '₹21,000',
        status: 'Paid',
      },
    ],
  },
  {
    id: 'inv-6',
    srNo: '06',
    name: 'Neha Patel',
    firstName: 'Neha',
    lastName: 'Patel',
    course: 'UI/UX Design',
    paidFees: 7000,
    totalFees: 35000,
    followUp: '30-08-2025',
    dueDate: '01-09-2025',
    invoiceId: 'GST/001',
    paymentStatus: 'Partially Paid',
    timeline: [
      {
        id: 't-6',
        installmentTitle: 'Installment #1',
        dueDate: '01-09-2025',
        paidDate: '01-09-2025',
        amount: '₹7,000',
        amountLeft: '₹28,000',
        status: 'Paid',
      },
    ],
  },
];

export const SalesInvoicesPage: React.FC = () => {
  const [view, setView] = useState<'list' | 'details'>('list');
  const [invoices] = useState<InvoiceItem[]>(INITIAL_INVOICES);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceItem>(INITIAL_INVOICES[0]);

  const handleDownload = (invoiceId: string, name: string) => {
    alert(`Downloading PDF receipt: ${invoiceId} for ${name}`);
  };

  const handleOpenDetails = (inv: InvoiceItem) => {
    setSelectedInvoice(inv);
    setView('details');
  };

  const percentPaid = Math.round((selectedInvoice.paidFees / selectedInvoice.totalFees) * 100);
  const pendingAmount = Math.max(0, selectedInvoice.totalFees - selectedInvoice.paidFees);

  return (
    <div className="font-['Onest'] text-[#050720] pb-16">
      
      {/* ========================================================= */}
      {/* 1. INVOICE DIRECTORY TABLE VIEW (SCREENSHOT 1)           */}
      {/* ========================================================= */}
      {view === 'list' && (
        <div className="space-y-6">
          <h1 className="text-2xl font-bold font-['Sora']">Invoice</h1>

          <div className="bg-white border border-[#050720]/10 rounded-xl p-6 shadow-xs">
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
                {invoices.map((inv) => (
                  <tr key={`${inv.id}-${inv.invoiceId}`} className="hover:bg-[#FFB908]/5 transition-colors">
                    <td className="py-3.5 text-[#050720]/70">{inv.srNo}</td>
                    <td className="py-3.5 font-medium">{inv.name}</td>
                    <td className="py-3.5 text-[#050720]/70">{inv.course}</td>
                    <td className="py-3.5 text-[#050720]/70">₹{inv.paidFees.toLocaleString()}</td>
                    <td className="py-3.5 text-[#050720]/70">{inv.followUp}</td>
                    <td className="py-3.5 text-[#050720]/70">{inv.dueDate}</td>
                    <td className="py-3.5 font-medium text-[#050720]">{inv.invoiceId}</td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownload(inv.invoiceId, inv.name)}
                          title="Download Invoice"
                          className="p-1 hover:text-[#050720] text-[#050720]/70 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleOpenDetails(inv)}
                          className="px-3 py-1 border border-[#050720]/30 rounded text-[11px] font-semibold text-[#050720] hover:bg-[#050720]/5 transition-colors"
                        >
                          View
                        </button>
                      </div>
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
      )}

      {/* ========================================================= */}
      {/* 2. INVOICE DETAILS VIEW (SCREENSHOT 2)                    */}
      {/* ========================================================= */}
      {view === 'details' && selectedInvoice && (
        <div className="space-y-6">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-2xl font-bold font-['Sora'] hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-6 h-6 text-[#050720]" />
            <span>Invoice Details</span>
          </button>

          {/* Fees Breakdown */}
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

          {/* Student Overview */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Student Overview</h3>
            <div className="grid grid-cols-2 gap-y-4 text-xs">
              <div>
                <span className="text-[10px] text-[#050720]/50 block">First Name</span>
                <span className="font-semibold text-sm">{selectedInvoice.firstName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Last Name</span>
                <span className="font-semibold text-sm">{selectedInvoice.lastName}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Course</span>
                <span className="font-semibold text-sm">{selectedInvoice.course}</span>
              </div>
              <div>
                <span className="text-[10px] text-[#050720]/50 block">Payment Status</span>
                <span className={`font-semibold text-sm ${
                  selectedInvoice.paymentStatus === 'Paid' ? 'text-[#10B981]' : 'text-[#FFB908]'
                }`}>
                  {selectedInvoice.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Timeline & Download Invoice Action */}
          <div className="bg-white rounded-xl border border-[#050720]/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold font-['Sora']">Timeline</h3>
            <div className="space-y-3">
              {selectedInvoice.timeline.map((inst) => (
                <div key={inst.id} className="border border-[#050720]/10 rounded-xl p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold font-['Sora']">{inst.installmentTitle}</h4>
                      <span className="text-[10px] text-[#050720]/50 block mt-0.5">Due: {inst.dueDate}</span>
                      <span className="text-[11px] font-semibold text-[#050720] block mt-1">
                        Paid on: {inst.paidDate}
                      </span>
                      <span className="text-[11px] font-semibold text-[#050720] block mt-1">
                        Amount left: <span className={inst.amountLeft === 'Nil' ? 'text-[#10B981]' : 'text-[#FFB908]'}>{inst.amountLeft}</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold font-['Sora'] block">{inst.amount}</span>
                      <span className="text-[10px] text-[#10B981] font-semibold block mt-0.5">
                        {inst.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handleDownload(selectedInvoice.invoiceId, selectedInvoice.name)}
                      className="px-5 py-2 bg-[#050720] hover:bg-[#050720]/90 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      Download Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
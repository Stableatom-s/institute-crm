import { apiRequest } from '../lib/api';

export interface InstallmentItem {
  id: string;
  installmentTitle: string;
  dueDate: string;
  paidDate?: string;
  amount: string;
  amountLeft: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  invoiceRequested?: boolean;
}

export interface InvoiceItem {
  id: string;
  srNo: string;
  studentName: string;
  firstName?: string;
  lastName?: string;
  mobile?: string;
  email?: string;
  course: string;
  invoiceCode: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  dueDate: string;
  lastFollowUp?: string;
  paymentStatus: 'Paid' | 'Partially Paid' | 'Overdue';
  approvalStatus: 'Approved' | 'Requests' | 'Cancelled';
  approvedOn?: string;
  rejectedReason?: string;
  timeline: InstallmentItem[];
  installments?: any[];
}

export const financeService = {
  getAllInvoices: async (): Promise<InvoiceItem[]> => {
    const data = await apiRequest<any[]>('/invoices');
    return data.map((item) => {
      const total = Number(item.totalFees) || 0;
      const paid = Number(item.paidFees) || 0;
      const remaining = Math.max(0, total - paid);

      const mappedTimeline: InstallmentItem[] = (item.installments || []).map((t: any, idx: number) => ({
        id: t.id || `inst-${idx}`,
        installmentTitle: t.installmentTitle || t.title || `Installment #${idx + 1}`,
        dueDate: t.dueDate || item.dueDate || '—',
        paidDate: t.paidDate || '—',
        amount: typeof t.amount === 'string' && t.amount.startsWith('₹') ? t.amount : `₹${(Number(t.amount) || 0).toLocaleString()}`,
        amountLeft: typeof t.amountLeft === 'string' && t.amountLeft.startsWith('₹') ? t.amountLeft : `₹${(Number(t.amountLeft) || 0).toLocaleString()}`,
        status: t.status || 'Pending',
      }));

      return {
        ...item,
        id: item._id || item.id,
        firstName: item.firstName || item.studentName?.split(' ')[0] || '',
        lastName: item.lastName || item.studentName?.split(' ').slice(1).join(' ') || '',
        totalFees: total,
        paidFees: paid,
        remainingFees: remaining,
        dueDate: item.dueDate || '—',
        lastFollowUp: item.lastFollowUp || '—',
        paymentStatus: item.paymentStatus || (paid >= total && total > 0 ? 'Paid' : 'Partially Paid'),
        approvalStatus: item.approvalStatus || 'Requests',
        approvedOn: item.approvedOn || '—',
        timeline: mappedTimeline,
      };
    });
  },

  createInvoice: async (invoiceData: Partial<InvoiceItem>): Promise<InvoiceItem> => {
    const data = await apiRequest<any>('/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  },

  recordInstallment: async (
    id: string,
    amount: number,
    installmentRecord: any
  ): Promise<InvoiceItem> => {
    const data = await apiRequest<any>(`/invoices/${id}/installment`, {
      method: 'PATCH',
      body: JSON.stringify({ amount, installmentRecord }),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  },

  approveInvoice: async (id: string): Promise<InvoiceItem> => {
    const data = await apiRequest<any>(`/invoices/${id}/approve`, {
      method: 'PATCH',
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  },

  rejectInvoice: async (id: string, reason: string): Promise<InvoiceItem> => {
    const data = await apiRequest<any>(`/invoices/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
    return {
      ...data,
      id: data._id || data.id,
    };
  },
};
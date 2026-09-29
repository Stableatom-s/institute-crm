import { apiRequest } from '../lib/api';

export interface InvoiceItem {
  id: string;
  srNo: string;
  studentName: string;
  firstName?: string;
  lastName?: string;
  course: string;
  invoiceCode: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  dueDate: string;
  lastFollowUp?: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue';
  timeline?: any[];
}

export const financeService = {
  getAllInvoices: async (): Promise<InvoiceItem[]> => {
    const data = await apiRequest<any[]>('/invoices');
    return data.map((item) => ({
      ...item,
      id: item._id || item.id,
      firstName: item.firstName || item.studentName.split(' ')[0] || '',
      lastName: item.lastName || item.studentName.split(' ').slice(1).join(' ') || '',
      remainingFees: item.remainingFees ?? Math.max(0, item.totalFees - item.paidFees),
      lastFollowUp: item.lastFollowUp || item.dueDate || '21-12-2025',
      timeline: item.timeline || [
        {
          id: `inst-${item._id || 'init'}`,
          title: 'Installment #1',
          dueDate: item.dueDate || '21-12-2025',
          paidDate: item.paidFees > 0 ? (item.dueDate || '21-12-2025') : undefined,
          amount: `₹${(item.paidFees || item.totalFees).toLocaleString()}`,
          amountLeft: item.remainingFees === 0 ? 'Nil' : `₹${item.remainingFees.toLocaleString()}`,
          status: item.paidFees >= item.totalFees ? 'Paid' : 'Pending',
          hasInvoice: true,
        },
      ],
    }));
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
};
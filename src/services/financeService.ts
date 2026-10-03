import { apiRequest } from '../lib/api';

export interface InvoiceItem {
  id: string;
  srNo?: string | number;
  name?: string;
  course?: string;
  paidFees?: string | number;
  mobile?: string;
  approvedOn?: string;
  email?: string;
  invoiceId?: string;
  status?: string;
  [key: string]: any;
}

export interface FeeItem {
  id: string;
  srNo?: string | number;
  name?: string;
  course?: string;
  totalFees?: string | number;
  paid?: string | number;
  lastFollowUp?: string;
  remarks?: string;
  [key: string]: any;
}

export interface CreateInvoicePayload {
  companyName?: string;
  companyPhone?: string;
  companyAddress?: string;
  companyEmail?: string;
  gstin?: string;
  courseName?: string;
  companyPan?: string;
  iecCode?: string;
  bankName?: string;
  bankBranch?: string;
  accountName?: string;
  accountNumber?: string;
  ifscCode?: string;
  swiftCode?: string;
  billTo?: string;
  amount?: number;
  [key: string]: any;
}

export const financeService = {
  getInvoices: async (): Promise<InvoiceItem[]> => {
    return apiRequest('/invoices', { method: 'GET' });
  },

  createInvoice: async (payload: CreateInvoicePayload): Promise<InvoiceItem> => {
    return apiRequest<InvoiceItem>('/invoices', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  approveInvoice: async (id: string | undefined): Promise<InvoiceItem> => {
    if (!id) throw new Error('Invoice ID is required for approval');
    return apiRequest<InvoiceItem>(`/invoices/${id}/approve`, {
      method: 'PATCH',
    });
  },

  rejectInvoice: async (id: string | undefined, reason: string): Promise<InvoiceItem> => {
    if (!id) throw new Error('Invoice ID is required for rejection');
    return apiRequest<InvoiceItem>(`/invoices/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    });
  },

  getFees: async (): Promise<FeeItem[]> => {
    return apiRequest('/invoices/fees', { method: 'GET' });
  },

  saveFeeRemark: async (
    feeId: string | undefined,
    title: string,
    date: string,
    description: string
  ): Promise<void> => {
    if (!feeId) throw new Error('Fee ID is required');
    return apiRequest<void>(`/invoices/fees/${feeId}/remarks`, {
      method: 'POST',
      body: JSON.stringify({ title, date, description }),
    });
  },
};
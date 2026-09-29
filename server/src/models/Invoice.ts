import { Schema, model, Document } from 'mongoose';

export interface IInvoice extends Document {
  srNo: string;
  studentName: string;
  course: string;
  invoiceCode: string;
  totalFees: number;
  paidFees: number;
  remainingFees: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Overdue';
}

const invoiceSchema = new Schema<IInvoice>(
  {
    srNo: { type: String, required: true },
    studentName: { type: String, required: true },
    course: { type: String, required: true },
    invoiceCode: { type: String, required: true, unique: true },
    totalFees: { type: Number, required: true },
    paidFees: { type: Number, required: true },
    remainingFees: { type: Number, required: true },
    dueDate: { type: String, required: true },
    status: { type: String, enum: ['Paid', 'Partially Paid', 'Overdue'], default: 'Partially Paid' },
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
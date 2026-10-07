import { Schema, model, Document } from 'mongoose';

export interface IInstallment {
  id: string;
  installmentTitle: string;
  dueDate: string;
  paidDate?: string;
  amount: number;
  amountLeft: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  receiptUrl?: string;
}

export interface IInvoice extends Document {
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
  installments: IInstallment[];
}

const installmentSchema = new Schema<IInstallment>(
  {
    id: String,
    installmentTitle: String,
    dueDate: String,
    paidDate: String,
    amount: Number,
    amountLeft: Number,
    status: { type: String, enum: ['Paid', 'Pending', 'Overdue'], default: 'Paid' },
    receiptUrl: String,
  },
  { _id: false }
);

const invoiceSchema = new Schema<IInvoice>(
  {
    srNo: { type: String, required: true },
    studentName: { type: String, required: true },
    firstName: String,
    lastName: String,
    mobile: String,
    email: String,
    course: { type: String, required: true },
    invoiceCode: { type: String, required: true, unique: true },
    totalFees: { type: Number, required: true },
    paidFees: { type: Number, default: 0 },
    remainingFees: { type: Number, required: true },
    dueDate: { type: String, required: true },
    lastFollowUp: String,
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partially Paid', 'Overdue'],
      default: 'Partially Paid',
    },
    approvalStatus: {
      type: String,
      enum: ['Approved', 'Requests', 'Cancelled'],
      default: 'Requests',
    },
    approvedOn: { type: String, default: '-' },
    rejectedReason: String,
    installments: [installmentSchema],
  },
  { timestamps: true }
);

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
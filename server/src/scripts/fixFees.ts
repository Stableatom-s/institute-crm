import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import { Invoice } from '../models/Invoice';
import { Lead } from '../models/Lead';

async function run() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGODB_URI not found in .env');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('✅ Connected to MongoDB Atlas');

  // 1. Inspect and fix Invoices
  const invoices = await Invoice.find({});
  console.log(`Checking ${invoices.length} invoices...`);

  for (const inv of invoices) {
    console.log(`Invoice: "${inv.studentName}" -> Total: ${inv.totalFees}, Paid: ${inv.paidFees}`);
    
    // If paid exceeds total, cap it
    if (inv.paidFees > inv.totalFees) {
      console.log(`⚠️ Resetting ${inv.studentName} paidFees from ${inv.paidFees} down to ${inv.totalFees}`);
      inv.paidFees = inv.totalFees;
      inv.remainingFees = 0;
      inv.paymentStatus = 'Paid';
      await inv.save();
    }
  }

  // 2. Inspect and fix Leads
  const leads = await Lead.find({});
  for (const lead of leads) {
    const rawFinal = parseInt((lead.finalFees || '0').replace(/[^0-9]/g, ''), 10) || 0;
    console.log(`Lead: "${lead.firstName} ${lead.lastName}" -> Final: ${rawFinal}`);
  }

  console.log('🎉 Cleanup script finished successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('Error running fix script:', err);
  process.exit(1);
});
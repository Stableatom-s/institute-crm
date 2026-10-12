import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/radiquolab-crm';

async function seedUsers() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB for user seeding...');

    const salt = await bcrypt.genSalt(10);
    const defaultPasswordHash = await bcrypt.hash('admin123', salt);
    const facultyPasswordHash = await bcrypt.hash('faculty123', salt);
    const salesPasswordHash = await bcrypt.hash('sales123', salt);

    const defaultAccounts = [
      {
        name: 'Super Admin',
        email: 'admin@radiquolab.com',
        password: defaultPasswordHash,
        role: 'admin',
        status: 'Active',
      },
      {
        name: 'Poorva Pande',
        email: 'faculty@radiquolab.com',
        password: facultyPasswordHash,
        role: 'faculty',
        status: 'Active',
      },
      {
        name: 'Sejal Singh',
        email: 'sales@radiquolab.com',
        password: salesPasswordHash,
        role: 'sales',
        status: 'Active',
      },
    ];

    for (const acc of defaultAccounts) {
      const existing = await User.findOne({ email: acc.email });
      if (!existing) {
        await User.create(acc as any);
        console.log(`Created account: ${acc.email} (${acc.role})`);
      } else {
        existing.password = acc.password;
        existing.status = 'Active';
        existing.role = acc.role as any;
        await existing.save();
        console.log(`Updated existing account: ${acc.email} (${acc.role})`);
      }
    }

    console.log('\n--- Seeding completed successfully! ---');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seedUsers();
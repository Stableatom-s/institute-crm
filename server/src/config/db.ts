import mongoose from 'mongoose';

export const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/institute_crm';
    const conn = await mongoose.connect(uri);
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(' MongoDB Connection Error:', error);
    process.exit(1);
  }
};
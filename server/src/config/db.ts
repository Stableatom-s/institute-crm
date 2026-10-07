import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || process.env.MONGO_URI;

    if (!connStr) {
      throw new Error('MONGODB_URI environment variable is missing in .env');
    }

    const conn = await mongoose.connect(connStr);
    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};
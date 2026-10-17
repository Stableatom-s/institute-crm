import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Route imports
import { leadRoutes } from './routes/leads';
import { demoRoutes } from './routes/demo';
import { invoiceRoutes } from './routes/invoices';
import { attendanceRoutes } from './routes/attendance';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/institute_crm';

// Middleware
app.use(cors());

// High payload limits for base64 screenshot uploads
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ limit: '25mb', extended: true }));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use('/api/leads', leadRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/attendance', attendanceRoutes);

// MongoDB connection & server launch
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`Backend server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

export default app;
import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { leadRoutes } from './routes/leads';
import { demoRoutes } from './routes/demo';
import batchRoutes from './routes/batches';   
import { Batch } from './models/Batch';
import { invoiceRoutes } from './routes/invoices';
import { attendanceRoutes } from './routes/attendance';
import leaveRoutes from './routes/leaves';
import teamRoutes from './routes/team';
import authRoutes from './routes/auth';
import notificationRoutes from './routes/notifications';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

app.use(express.json());

// Health Check with explicit Request & Response types
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/demos', demoRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/notifications', notificationRoutes);
app.listen(PORT, () => {
  console.log(`Backend server running at http://localhost:${PORT}`);
});
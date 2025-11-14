import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import customerRoutes from './routes/customers';
import testRoutes from './routes/tests';
import dashboardRoutes from './routes/dashboard';

const app = express();

// Middleware
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Connect to database
connectDB();

// Routes
app.use('/api', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
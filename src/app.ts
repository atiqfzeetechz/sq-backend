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


// main get routes

app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>SQ Backend</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #4e73df, #1cc88a);
        font-family: 'Arial';
      ">
        <div style="
          background: white;
          padding: 40px 60px;
          border-radius: 15px;
          box-shadow: 0px 10px 25px rgba(0,0,0,0.15);
          text-align: center;
        ">
          <h1 style="
            margin: 0;
            font-size: 32px;
            color: #4e73df;
          ">
            🚀 SQ Backend is Running! 9122
          </h1>
          <p style="
            font-size: 16px;
            margin-top: 10px;
            color: #555;
          ">
            Your server is up and working perfectly.
          </p>
        </div>
      </body>
    </html>
  `);
});


// Routes
app.use('/api', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/dashboard', dashboardRoutes);

export default app;
import express from 'express';
import { Customer } from '../models/Customer';
import { Test } from '../models/Test';
import { auth } from '../middleware/auth';

const router = express.Router();

// Dashboard Stats
router.get('/stats', auth, async (req: any, res) => {
  try {
    const totalCustomers = await Customer.countDocuments({ userId: req.userId });
    const totalTests = await Test.countDocuments({ userId: req.userId });
    
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
    
    const testsToday = await Test.countDocuments({
      userId: req.userId,
      createdAt: { $gte: todayStart, $lt: todayEnd }
    });
    
    const pendingReports = Math.floor(totalTests * 0.1);
    
    res.json({
      totalCustomers,
      totalTests,
      testsToday,
      pendingReports
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
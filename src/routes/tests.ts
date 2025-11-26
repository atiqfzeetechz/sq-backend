import express from 'express';
import { Test } from '../models/Test';
import { Customer } from '../models/Customer';
import { auth } from '../middleware/auth';
import { updateCustomerWorkload } from '../utils/workload';

const router = express.Router();

// Get All Tests with optional month/date filtering
router.get('/', auth, async (req: any, res) => {
  try {
    const { month, year, startDate, endDate, all } = req.query;
    let query: any = { userId: req.userId };
    
    // If 'all' parameter is true, return all tests without filtering
    if (all === 'true') {
      const tests = await Test.find(query).populate('customerId', 'customerName serialNumber');
      return res.json(tests);
    }
    
    // Filter by month and year (current month by default)
    if (month && year) {
      const monthStart = new Date(year, month - 1, 1);
      const monthEnd = new Date(year, month, 0, 23, 59, 59);
      query.$or = [
        {
          startDate: {
            $gte: monthStart.toISOString().split('T')[0],
            $lte: monthEnd.toISOString().split('T')[0]
          }
        },
        {
          endDate: {
            $gte: monthStart.toISOString().split('T')[0],
            $lte: monthEnd.toISOString().split('T')[0]
          }
        }
      ];
    } else if (startDate && endDate) {
      // Filter by custom date range
      query.$or = [
        {
          startDate: {
            $gte: startDate,
            $lte: endDate
          }
        },
        {
          endDate: {
            $gte: startDate,
            $lte: endDate
          }
        }
      ];
    } else {
      // Default: current month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      query.$or = [
        {
          startDate: {
            $gte: monthStart.toISOString().split('T')[0],
            $lte: monthEnd.toISOString().split('T')[0]
          }
        },
        {
          endDate: {
            $gte: monthStart.toISOString().split('T')[0],
            $lte: monthEnd.toISOString().split('T')[0]
          }
        }
      ];
    }
    
    const tests = await Test.find(query).populate('customerId', 'customerName serialNumber');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Tests by Serial Number
router.get('/serial/:serialNumber', auth, async (req: any, res) => {
  try {
    const tests = await Test.find({ 
      serialNumber: req.params.serialNumber, 
      userId: req.userId 
    });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/Update Test
router.post('/', auth, async (req: any, res) => {
  try {
    const testData = req.body;
    
    const customer = await Customer.findOne({ 
      serialNumber: testData.serialNumber, 
      userId: req.userId 
    });
    
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found with this serial number' });
    }
    
    const existingTest = await Test.findOne({ 
      serialNumber: testData.serialNumber,
      startDate: testData.startDate,
      endDate: testData.endDate,
      userId: req.userId 
    });
    
    let savedTest;
    if (existingTest) {
      Object.assign(existingTest, testData);
      existingTest.customerId = customer._id;
      savedTest = await existingTest.save();
    } else {
      const test = new Test({ 
        ...testData, 
        customerId: customer._id,
        userId: req.userId 
      });
      savedTest = await test.save();
    }
    
    await updateCustomerWorkload(customer._id, req.userId);
    res.json(savedTest);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save test data' });
  }
});

// Update Test
router.put('/:id', auth, async (req: any, res) => {
  try {
    const testData = req.body;
    
    if (testData.serialNumber) {
      const customer = await Customer.findOne({ 
        serialNumber: testData.serialNumber, 
        userId: req.userId 
      });
      
      if (customer) {
        testData.customerId = customer._id;
      }
    }
    
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      testData,
      { new: true, runValidators: true }
    );
    
    if (!test) return res.status(404).json({ error: 'Test not found' });
    
    await updateCustomerWorkload(test.customerId, req.userId);
    res.json(test);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Delete Test
router.delete('/:id', auth, async (req: any, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    
    await updateCustomerWorkload(test.customerId, req.userId);
    res.json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

export default router;
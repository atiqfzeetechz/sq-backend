import express from 'express';
import { Customer } from '../models/Customer';
import { Test } from '../models/Test';
import { auth } from '../middleware/auth';

const router = express.Router();

// Get Customers
router.get('/', auth, async (req: any, res) => {
  try {
    const customers = await Customer.find({ userId: req.userId });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Customer
router.post('/', auth, async (req: any, res) => {
  try {
    const { customerName, zone, state, installationDate, workload, serialNumber, instrument } = req.body;
    
    const existingCustomer = await Customer.findOne({ serialNumber });
    if (existingCustomer) {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    
    const customer = new Customer({ 
      customerName, zone, state, installationDate, workload, serialNumber, instrument, 
      userId: req.userId 
    });
    await customer.save();
    
    const today = new Date().toISOString().split('T')[0];
    const testTemplate = new Test({
      serialNumber,
      startDate: today,
      endDate: today,
      customerId: customer._id,
      userId: req.userId
    });
    await testTemplate.save();
    
    res.json({ customer, testTemplate });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Delete Customer
router.delete('/:id', auth, async (req: any, res) => {
  try {
    await Test.deleteMany({ customerId: req.params.id, userId: req.userId });
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
    
    res.json({ message: 'Customer and associated tests deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

export default router;
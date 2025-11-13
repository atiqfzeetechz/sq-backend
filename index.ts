import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 9122;
const JWT_SECRET = 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb+srv://Horiba:Horiba@cluster0.fxxl9ej.mongodb.net/?appName=Cluster0');

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

// Customer Schema
const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  zone: { type: String, required: true },
  state: { type: String, required: true },
  installationDate: { type: String, required: true },
  workload: { type: String, required: true },
  serialNumber: { type: String, required: true, unique: true },
  instrument: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

// Test Schema
const testSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  testDate: { type: String, required: true },
  ALB: { type: Number, default: 0 },
  ALP: { type: Number, default: 0 },
  ALT: { type: Number, default: 0 },
  AMY: { type: Number, default: 0 },
  AST: { type: Number, default: 0 },
  CAA: { type: Number, default: 0 },
  CHOL: { type: Number, default: 0 },
  CREA_ENZ: { type: Number, default: 0 },
  CRP: { type: Number, default: 0 },
  DBILI: { type: Number, default: 0 },
  GGT: { type: Number, default: 0 },
  GLUP: { type: Number, default: 0 },
  HDL: { type: Number, default: 0 },
  LDH: { type: Number, default: 0 },
  LIPASE: { type: Number, default: 0 },
  TBILI: { type: Number, default: 0 },
  TGL: { type: Number, default: 0 },
  TP: { type: Number, default: 0 },
  UA: { type: Number, default: 0 },
  UREA: { type: Number, default: 0 },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Customer = mongoose.model('Customer', customerSchema);
const Test = mongoose.model('Test', testSchema);

// Auth middleware
const auth = async (req: any, res: any, next: any) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Access denied' });
    
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Routes

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ userId: user._id }, JWT_SECRET);
    res.json({ token, user: { id: user._id, name: user.name, email } });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add Customer
app.post('/api/customers', auth, async (req, res) => {
  try {
    console.log('Creating customer with data:', req.body);
    const { customerName, zone, state, installationDate, workload, serialNumber, instrument } = req.body;
    
    // Check if serial number already exists
    const existingCustomer = await Customer.findOne({ serialNumber });
    if (existingCustomer) {
      console.log('Duplicate serial number found:', serialNumber);
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    
    const customer = new Customer({ 
      customerName, zone, state, installationDate, workload, serialNumber, instrument, 
      userId: req.userId 
    });
    await customer.save();
    console.log('Customer created successfully:', customer._id);
    
    // Auto-create test template with 0 values
    const testTemplate = new Test({
      serialNumber,
      testDate: new Date().toLocaleDateString('en-GB'),
      customerId: customer._id,
      userId: req.userId
    });
    await testTemplate.save();
    console.log('Test template created:', testTemplate._id);
    
    res.json({ customer, testTemplate });
  } catch (error: any) {
    console.error('Customer creation error:', error);
    if (error.code === 11000) {
      console.log('MongoDB duplicate key error');
      return res.status(400).json({ error: 'Serial number already exists' });
    }
    res.status(500).json({ error: 'Failed to create customer' });
  }
});

// Get Customers
app.get('/api/customers', auth, async (req, res) => {
  try {
    const customers = await Customer.find({ userId: req.userId });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add/Update Test
app.post('/api/tests', auth, async (req, res) => {
  try {
    const testData = req.body;
    
    // Find customer by serial number to get customerId
    const customer = await Customer.findOne({ 
      serialNumber: testData.serialNumber, 
      userId: req.userId 
    });
    
    if (!customer) {
      return res.status(400).json({ error: 'Customer not found with this serial number' });
    }
    
    const existingTest = await Test.findOne({ 
      serialNumber: testData.serialNumber, 
      userId: req.userId 
    });
    
    if (existingTest) {
      Object.assign(existingTest, testData);
      existingTest.customerId = customer._id;
      await existingTest.save();
      res.json(existingTest);
    } else {
      const test = new Test({ 
        ...testData, 
        customerId: customer._id,
        userId: req.userId 
      });
      await test.save();
      res.json(test);
    }
  } catch (error: any) {
    console.error('Test creation error:', error);
    res.status(500).json({ error: 'Failed to save test data' });
  }
});

// Get Tests by Serial Number
app.get('/api/tests/serial/:serialNumber', auth, async (req, res) => {
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

// Get All Tests
app.get('/api/tests', auth, async (req, res) => {
  try {
    const tests = await Test.find({ userId: req.userId }).populate('customerId', 'customerName serialNumber');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update Test
app.put('/api/tests/:id', auth, async (req, res) => {
  try {
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true }
    );
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json(test);
  } catch (error: any) {
    console.error('Test update error:', error);
    res.status(500).json({ error: 'Failed to update test' });
  }
});

// Delete Test
app.delete('/api/tests/:id', auth, async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!test) return res.status(404).json({ error: 'Test not found' });
    res.json({ message: 'Test deleted successfully' });
  } catch (error: any) {
    console.error('Test deletion error:', error);
    res.status(500).json({ error: 'Failed to delete test' });
  }
});

// Dashboard Stats
app.get('/api/dashboard/stats', auth, async (req, res) => {
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
    
    const pendingReports = Math.floor(totalTests * 0.1); // 10% as pending
    
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
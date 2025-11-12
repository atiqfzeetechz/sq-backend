import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3000;
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
});

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
});

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
    const { customerName, zone, state, installationDate, workload, serialNumber, instrument } = req.body;
    const customer = new Customer({ 
      customerName, zone, state, installationDate, workload, serialNumber, instrument, 
      userId: req.userId 
    });
    await customer.save();
    
    // Auto-create test template with 0 values
    const testTemplate = new Test({
      serialNumber,
      testDate: new Date().toLocaleDateString('en-GB'),
      customerId: customer._id,
      userId: req.userId
    });
    await testTemplate.save();
    
    res.json({ customer, testTemplate });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
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
    const existingTest = await Test.findOne({ 
      serialNumber: testData.serialNumber, 
      userId: req.userId 
    });
    
    if (existingTest) {
      Object.assign(existingTest, testData);
      await existingTest.save();
      res.json(existingTest);
    } else {
      const test = new Test({ ...testData, userId: req.userId });
      await test.save();
      res.json(test);
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get Tests for a Customer
app.get('/api/tests/:customerId', auth, async (req, res) => {
  try {
    const tests = await Test.find({ 
      customerId: req.params.customerId, 
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
    const tests = await Test.find({ userId: req.userId }).populate('customerId', 'name email');
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
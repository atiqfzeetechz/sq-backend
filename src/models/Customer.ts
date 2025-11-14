import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  zone: { type: String, required: true },
  state: { type: String, required: true },
  installationDate: { type: String, required: true },
  workload: { type: Number, default: 0 },
  serialNumber: { type: String, required: true, unique: true },
  instrument: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

export const Customer = mongoose.model('Customer', customerSchema);
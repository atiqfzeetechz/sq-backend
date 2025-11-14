import mongoose from 'mongoose';

const testSchema = new mongoose.Schema({
  serialNumber: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  ALB: { type: Number },
  ALP: { type: Number },
  ALT: { type: Number },
  AMY: { type: Number },
  AST: { type: Number },
  CAA: { type: Number },
  CHOL: { type: Number },
  CREA_ENZ: { type: Number },
  CRP: { type: Number },
  DBILI: { type: Number },
  GGT: { type: Number },
  GLUP: { type: Number },
  HDL: { type: Number },
  LDH: { type: Number },
  LIPASE: { type: Number },
  TBILI: { type: Number },
  TGL: { type: Number },
  TP: { type: Number },
  UA: { type: Number },
  UREA: { type: Number },
  remarks: { type: String },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true, strict: false });

export const Test = mongoose.model('Test', testSchema);
const mongoose = require('mongoose');

const ACCOUNT_TYPES = ['UPI', 'Credit Card (UPI)', 'Debit Card', 'Net Banking', 'Wallet'];

const paymentAccountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ACCOUNT_TYPES, required: true },
  displayName: { type: String, required: true, trim: true, maxlength: 50 },
  accountId: { type: String, trim: true, maxlength: 100, default: '' },
  bankName: { type: String, trim: true, maxlength: 60, default: '' },
  color: { type: String, default: '#6366f1' },
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

paymentAccountSchema.index({ user: 1, type: 1 });

module.exports = mongoose.model('PaymentAccount', paymentAccountSchema);

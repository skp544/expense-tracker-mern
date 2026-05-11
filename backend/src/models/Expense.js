const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Investments', 'EMI', 'Others'],
  },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, maxlength: 500 },
  receipt: { type: String, default: null },
  tags: [{ type: String, trim: true }],
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Wallet', 'Other'],
    default: 'Cash',
  },
  location: { type: String, maxlength: 100 },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', null],
    default: null,
  },
  currency: { type: String, default: 'INR' },
  card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', default: null },
}, { timestamps: true });

expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

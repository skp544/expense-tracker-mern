const mongoose = require('mongoose');

const incomeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true, maxlength: 100 },
  amount: { type: Number, required: true, min: 0 },
  source: {
    type: String,
    required: true,
    enum: ['Salary', 'Freelance', 'Investment', 'Business', 'Rental', 'Gift', 'Bonus', 'Other'],
  },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, maxlength: 500 },
  isRecurring: { type: Boolean, default: false },
  recurringFrequency: {
    type: String,
    enum: ['Daily', 'Weekly', 'Monthly', 'Yearly', null],
    default: null,
  },
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

incomeSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Income', incomeSchema);

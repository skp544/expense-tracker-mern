const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Investments', 'EMI', 'Others', 'Total'],
  },
  amount: { type: Number, required: true, min: 0 },
  month: { type: Number, required: true, min: 1, max: 12 },
  year: { type: Number, required: true },
  alertAt: { type: Number, default: 80, min: 1, max: 100 },
  alertSent: { type: Boolean, default: false },
}, { timestamps: true });

budgetSchema.index({ user: 1, month: 1, year: 1, category: 1 }, { unique: true });

module.exports = mongoose.model('Budget', budgetSchema);

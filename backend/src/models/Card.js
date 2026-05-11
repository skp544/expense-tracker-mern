const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cardHolderName: { type: String, required: true, trim: true },
  cardNumber: { type: String, required: true },
  bankName: { type: String, required: true, trim: true },
  expiryDate: { type: String, required: true },
  creditLimit: { type: Number, required: true, min: 0 },
  currentUsage: { type: Number, default: 0, min: 0 },
  billingCycleDate: { type: Number, min: 1, max: 31, default: 1 },
  dueDate: { type: Number, min: 1, max: 31, default: 15 },
  cardColor: { type: String, default: 'from-violet-600 to-indigo-700' },
  cardType: { type: String, enum: ['Visa', 'Mastercard', 'Amex', 'RuPay', 'Other'], default: 'Visa' },
  isDefault: { type: Boolean, default: false },
  notes: { type: String, maxlength: 300 },
}, { timestamps: true });

cardSchema.virtual('availableLimit').get(function () {
  return this.creditLimit - this.currentUsage;
});

cardSchema.virtual('utilizationPercent').get(function () {
  return this.creditLimit > 0 ? Math.round((this.currentUsage / this.creditLimit) * 100) : 0;
});

cardSchema.set('toJSON', { virtuals: true });
cardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Card', cardSchema);

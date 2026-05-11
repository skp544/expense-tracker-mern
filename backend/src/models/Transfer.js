const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  // source — null means Cash
  fromAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentAccount', default: null },

  // destination
  toType: { type: String, enum: ['own_account', 'person'], required: true },
  toAccount: { type: mongoose.Schema.Types.ObjectId, ref: 'PaymentAccount', default: null },
  toName: { type: String, trim: true, maxlength: 80, default: '' },
  toAccountId: { type: String, trim: true, maxlength: 100, default: '' },

  amount: { type: Number, required: true, min: 0 },
  date: { type: Date, required: true, default: Date.now },
  notes: { type: String, maxlength: 300, default: '' },
  reference: { type: String, trim: true, maxlength: 100, default: '' },
  currency: { type: String, default: 'INR' },
}, { timestamps: true });

transferSchema.index({ user: 1, date: -1 });

module.exports = mongoose.model('Transfer', transferSchema);

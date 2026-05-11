const PaymentAccount = require('../models/PaymentAccount');

exports.getPaymentAccounts = async (req, res, next) => {
  try {
    const accounts = await PaymentAccount.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, data: accounts });
  } catch (err) { next(err); }
};

exports.createPaymentAccount = async (req, res, next) => {
  try {
    const account = await PaymentAccount.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: account });
  } catch (err) { next(err); }
};

exports.updatePaymentAccount = async (req, res, next) => {
  try {
    const account = await PaymentAccount.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, data: account });
  } catch (err) { next(err); }
};

exports.deletePaymentAccount = async (req, res, next) => {
  try {
    const account = await PaymentAccount.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!account) return res.status(404).json({ success: false, message: 'Account not found' });
    res.json({ success: true, message: 'Account deleted' });
  } catch (err) { next(err); }
};

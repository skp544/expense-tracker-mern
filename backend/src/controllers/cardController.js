const Card = require('../models/Card');
const Expense = require('../models/Expense');

exports.getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({ user: req.user.id }).sort({ isDefault: -1, createdAt: -1 });
    res.json({ success: true, count: cards.length, data: cards });
  } catch (err) { next(err); }
};

exports.createCard = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Card.updateMany({ user: req.user.id }, { isDefault: false });
    }
    const card = await Card.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: card });
  } catch (err) { next(err); }
};

exports.updateCard = async (req, res, next) => {
  try {
    if (req.body.isDefault) {
      await Card.updateMany({ user: req.user.id }, { isDefault: false });
    }
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    res.json({ success: true, data: card });
  } catch (err) { next(err); }
};

exports.deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });
    await Expense.updateMany({ card: req.params.id }, { card: null });
    res.json({ success: true, message: 'Card deleted' });
  } catch (err) { next(err); }
};

exports.getCardSpending = async (req, res, next) => {
  try {
    const card = await Card.findOne({ _id: req.params.id, user: req.user.id });
    if (!card) return res.status(404).json({ success: false, message: 'Card not found' });

    const now = new Date();
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      return { month: d.getMonth() + 1, year: d.getFullYear() };
    }).reverse();

    const spending = await Promise.all(
      last6Months.map(async ({ month, year }) => {
        const start = new Date(year, month - 1, 1);
        const end = new Date(year, month, 0);
        const result = await Expense.aggregate([
          { $match: { user: req.user._id, card: card._id, date: { $gte: start, $lte: end } } },
          { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        return { month, year, total: result[0]?.total || 0 };
      })
    );

    res.json({ success: true, data: { card, spending } });
  } catch (err) { next(err); }
};

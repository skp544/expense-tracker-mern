const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

exports.getBudgets = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month) || now.getMonth() + 1;
    const year = parseInt(req.query.year) || now.getFullYear();

    const budgets = await Budget.find({ user: req.user.id, month, year });

    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0);

    const spending = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', spent: { $sum: '$amount' } } },
    ]);

    const spendingMap = {};
    spending.forEach(s => { spendingMap[s._id] = s.spent; });

    const budgetsWithProgress = budgets.map(b => ({
      ...b.toObject(),
      spent: spendingMap[b.category] || 0,
      remaining: b.amount - (spendingMap[b.category] || 0),
      percentUsed: b.amount > 0 ? Math.round(((spendingMap[b.category] || 0) / b.amount) * 100) : 0,
    }));

    res.json({ success: true, data: budgetsWithProgress, month, year });
  } catch (err) { next(err); }
};

exports.setBudget = async (req, res, next) => {
  try {
    const { category, amount, month, year, alertAt } = req.body;
    const budget = await Budget.findOneAndUpdate(
      { user: req.user.id, category, month, year },
      { amount, alertAt: alertAt || 80, alertSent: false },
      { new: true, upsert: true, runValidators: true }
    );
    res.status(201).json({ success: true, data: budget });
  } catch (err) { next(err); }
};

exports.deleteBudget = async (req, res, next) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!budget) return res.status(404).json({ success: false, message: 'Budget not found' });
    res.json({ success: true, message: 'Budget deleted' });
  } catch (err) { next(err); }
};

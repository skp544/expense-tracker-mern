const Expense = require('../models/Expense');
const Card = require('../models/Card');

exports.getExpenses = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, category, startDate, endDate, search, sortBy = 'date', order = 'desc' } = req.query;
    const query = { user: req.user.id };
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('card', 'bankName cardNumber cardColor')
      .populate('paymentAccount', 'displayName type bankName color');

    res.json({ success: true, count: expenses.length, total, pages: Math.ceil(total / limit), data: expenses });
  } catch (err) { next(err); }
};

exports.createExpense = async (req, res, next) => {
  try {
    const data = { ...req.body, user: req.user.id };
    if (req.file) data.receipt = `/uploads/receipts/${req.file.filename}`;
    const expense = await Expense.create(data);

    if (data.card && data.amount) {
      await Card.findByIdAndUpdate(data.card, { $inc: { currentUsage: Number(data.amount) } });
    }
    res.status(201).json({ success: true, data: expense });
  } catch (err) { next(err); }
};

exports.updateExpense = async (req, res, next) => {
  try {
    let expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    if (req.file) req.body.receipt = `/uploads/receipts/${req.file.filename}`;

    if (expense.card && expense.card.toString() !== req.body.card) {
      await Card.findByIdAndUpdate(expense.card, { $inc: { currentUsage: -expense.amount } });
    }
    if (req.body.card) {
      await Card.findByIdAndUpdate(req.body.card, { $inc: { currentUsage: Number(req.body.amount || expense.amount) - (expense.card?.toString() === req.body.card ? expense.amount : 0) } });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, data: expense });
  } catch (err) { next(err); }
};

exports.deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user.id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });
    if (expense.card) {
      await Card.findByIdAndUpdate(expense.card, { $inc: { currentUsage: -expense.amount } });
    }
    await expense.deleteOne();
    res.json({ success: true, message: 'Expense deleted' });
  } catch (err) { next(err); }
};

exports.getExpenseStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [monthlyTotal, categoryBreakdown, recentExpenses] = await Promise.all([
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Expense.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(5).populate('card', 'bankName').populate('paymentAccount', 'displayName type color'),
    ]);

    res.json({
      success: true,
      data: {
        monthlyTotal: monthlyTotal[0]?.total || 0,
        categoryBreakdown,
        recentExpenses,
      },
    });
  } catch (err) { next(err); }
};

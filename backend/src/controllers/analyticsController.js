const Expense = require('../models/Expense');
const Income = require('../models/Income');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalExpenseMonth, totalExpenseLastMonth,
      totalIncomeMonth, totalIncomeLastMonth,
      categoryBreakdown, recentTransactions,
      allTimeExpense, allTimeIncome,
    ] = await Promise.all([
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } }, { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } }, { $sort: { total: -1 } }]),
      Expense.find({ user: req.user.id }).sort({ date: -1 }).limit(8).lean(),
      Expense.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      Income.aggregate([{ $match: { user: req.user._id } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    const expenseThisMonth = totalExpenseMonth[0]?.total || 0;
    const expenseLastMonth = totalExpenseLastMonth[0]?.total || 0;
    const incomeThisMonth = totalIncomeMonth[0]?.total || 0;
    const incomeLastMonth = totalIncomeLastMonth[0]?.total || 0;
    const totalExpenseAllTime = allTimeExpense[0]?.total || 0;
    const totalIncomeAllTime = allTimeIncome[0]?.total || 0;

    const recentIncome = await Income.find({ user: req.user.id }).sort({ date: -1 }).limit(3).lean();
    const combined = [...recentTransactions.map(e => ({ ...e, type: 'expense' })), ...recentIncome.map(i => ({ ...i, type: 'income' }))];
    combined.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        totalBalance: totalIncomeAllTime - totalExpenseAllTime,
        totalExpenseMonth: expenseThisMonth,
        totalIncomeMonth: incomeThisMonth,
        savingsMonth: incomeThisMonth - expenseThisMonth,
        expenseChange: expenseLastMonth > 0 ? ((expenseThisMonth - expenseLastMonth) / expenseLastMonth) * 100 : 0,
        incomeChange: incomeLastMonth > 0 ? ((incomeThisMonth - incomeLastMonth) / incomeLastMonth) * 100 : 0,
        categoryBreakdown,
        recentTransactions: combined.slice(0, 8),
      },
    });
  } catch (err) { next(err); }
};

exports.getMonthlyTrend = async (req, res, next) => {
  try {
    const months = 12;
    const now = new Date();
    const monthsData = Array.from({ length: months }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1);
      return { month: d.getMonth() + 1, year: d.getFullYear(), label: d.toLocaleString('default', { month: 'short', year: '2-digit' }) };
    });

    const data = await Promise.all(monthsData.map(async ({ month, year, label }) => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0);
      const [exp, inc] = await Promise.all([
        Expense.aggregate([{ $match: { user: req.user._id, date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
        Income.aggregate([{ $match: { user: req.user._id, date: { $gte: start, $lte: end } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      ]);
      return { month, year, label, expenses: exp[0]?.total || 0, income: inc[0]?.total || 0, savings: (inc[0]?.total || 0) - (exp[0]?.total || 0) };
    }));

    res.json({ success: true, data });
  } catch (err) { next(err); }
};

exports.getCategoryTrend = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const breakdown = await Expense.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfYear } } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
    res.json({ success: true, data: breakdown });
  } catch (err) { next(err); }
};

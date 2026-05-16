const Income = require('../models/Income');

exports.getIncome = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, source, startDate, endDate, search, sortBy = 'date', order = 'desc' } = req.query;
    const query = { user: req.user.id };
    if (source && source !== 'All') query.source = source;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await Income.countDocuments(query);
    const income = await Income.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate('paymentAccount', 'displayName type bankName color');

    res.json({ success: true, count: income.length, total, pages: Math.ceil(total / limit), data: income });
  } catch (err) { next(err); }
};

exports.createIncome = async (req, res, next) => {
  try {
    const income = await Income.create({ ...req.body, user: req.user.id });
    res.status(201).json({ success: true, data: income });
  } catch (err) { next(err); }
};

exports.updateIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!income) return res.status(404).json({ success: false, message: 'Income not found' });
    res.json({ success: true, data: income });
  } catch (err) { next(err); }
};

exports.deleteIncome = async (req, res, next) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!income) return res.status(404).json({ success: false, message: 'Income not found' });
    res.json({ success: true, message: 'Income deleted' });
  } catch (err) { next(err); }
};

exports.getIncomeStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const [monthlyTotal, sourceBreakdown, accountBreakdown] = await Promise.all([
      Income.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Income.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth } } },
        { $group: { _id: '$source', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Income.aggregate([
        { $match: { user: req.user._id, date: { $gte: startOfMonth }, paymentAccount: { $ne: null } } },
        { $group: { _id: '$paymentAccount', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
        { $lookup: { from: 'paymentaccounts', localField: '_id', foreignField: '_id', as: 'acc' } },
        { $unwind: { path: '$acc', preserveNullAndEmptyArrays: true } },
        { $project: { total: 1, count: 1, name: '$acc.displayName', type: '$acc.type', color: '$acc.color' } },
      ]),
    ]);
    res.json({ success: true, data: { monthlyTotal: monthlyTotal[0]?.total || 0, sourceBreakdown, accountBreakdown } });
  } catch (err) { next(err); }
};

const Transfer = require('../models/Transfer');

const POPULATE_FROM = { path: 'fromAccount', select: 'displayName type color bankName' };
const POPULATE_TO   = { path: 'toAccount',   select: 'displayName type color bankName' };

exports.getTransfers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, sortBy = 'date', order = 'desc', startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (search) query.$or = [
      { toName: { $regex: search, $options: 'i' } },
      { notes: { $regex: search, $options: 'i' } },
      { reference: { $regex: search, $options: 'i' } },
    ];
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const total = await Transfer.countDocuments(query);
    const transfers = await Transfer.find(query)
      .sort({ [sortBy]: order === 'desc' ? -1 : 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate(POPULATE_FROM)
      .populate(POPULATE_TO);

    res.json({ success: true, total, pages: Math.ceil(total / limit), data: transfers });
  } catch (err) { next(err); }
};

exports.createTransfer = async (req, res, next) => {
  try {
    const body = { ...req.body, user: req.user.id };
    if (!body.fromAccount) body.fromAccount = null;
    if (body.toType === 'own_account') { body.toName = ''; body.toAccountId = ''; }
    if (body.toType === 'person') { body.toAccount = null; }
    const transfer = await Transfer.create(body);
    const populated = await transfer.populate([POPULATE_FROM, POPULATE_TO]);
    res.status(201).json({ success: true, data: populated });
  } catch (err) { next(err); }
};

exports.updateTransfer = async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (!body.fromAccount) body.fromAccount = null;
    if (body.toType === 'own_account') { body.toName = ''; body.toAccountId = ''; }
    if (body.toType === 'person') { body.toAccount = null; }

    const transfer = await Transfer.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      body,
      { new: true, runValidators: true }
    ).populate(POPULATE_FROM).populate(POPULATE_TO);

    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, data: transfer });
  } catch (err) { next(err); }
};

exports.deleteTransfer = async (req, res, next) => {
  try {
    const transfer = await Transfer.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!transfer) return res.status(404).json({ success: false, message: 'Transfer not found' });
    res.json({ success: true, message: 'Transfer deleted' });
  } catch (err) { next(err); }
};

exports.getTransferStats = async (req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [monthly] = await Transfer.aggregate([
      { $match: { user: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: { monthlyTotal: monthly?.total || 0, monthlyCount: monthly?.count || 0 },
    });
  } catch (err) { next(err); }
};

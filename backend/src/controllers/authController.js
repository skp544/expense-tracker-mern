const User = require('../models/User');

const sendToken = (user, statusCode, res) => {
  const token = user.getSignedToken();
  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  };
  const userData = { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, currency: user.currency, monthlyBudgetGoal: user.monthlyBudgetGoal, savingsGoal: user.savingsGoal };
  res.status(statusCode).cookie('token', token, options).json({ success: true, token, user: userData });
};

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ success: false, message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    sendToken(user, 201, res);
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

exports.logout = (req, res) => {
  res.cookie('token', 'none', { expires: new Date(Date.now() + 5000), httpOnly: true });
  res.json({ success: true, message: 'Logged out' });
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { name, currency, monthlyBudgetGoal, savingsGoal } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (currency) updates.currency = currency;
    if (monthlyBudgetGoal !== undefined) updates.monthlyBudgetGoal = monthlyBudgetGoal;
    if (savingsGoal !== undefined) updates.savingsGoal = savingsGoal;
    if (req.file) updates.avatar = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) { next(err); }
};

exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    sendToken(user, 200, res);
  } catch (err) { next(err); }
};

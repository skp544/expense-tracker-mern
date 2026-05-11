require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Income = require('../models/Income');
const Card = require('../models/Card');
const Budget = require('../models/Budget');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker');
  console.log('MongoDB connected for seeding');
};

const expenseCategories = ['Food', 'Travel', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Investments', 'EMI', 'Others'];
const incomeSources = ['Salary', 'Freelance', 'Investment', 'Business'];
const paymentMethods = ['Cash', 'Credit Card', 'Debit Card', 'UPI'];

const expenseTitles = {
  Food: ['Grocery Store', 'Restaurant Dinner', 'Coffee Shop', 'Pizza Delivery', 'Fast Food', 'Cafe Breakfast'],
  Travel: ['Uber Ride', 'Flight Ticket', 'Hotel Stay', 'Train Ticket', 'Fuel', 'Parking Fee'],
  Shopping: ['Amazon Order', 'Clothing Store', 'Electronics', 'Home Decor', 'Books', 'Sports Gear'],
  Bills: ['Electricity Bill', 'Internet Bill', 'Water Bill', 'Rent', 'Gas Bill', 'Phone Bill'],
  Entertainment: ['Netflix', 'Movie Tickets', 'Spotify', 'Gaming', 'Concert Tickets', 'YouTube Premium'],
  Health: ['Gym Membership', 'Doctor Visit', 'Pharmacy', 'Health Insurance', 'Dental Checkup'],
  Education: ['Online Course', 'Books', 'Tuition Fee', 'Workshop', 'Software License'],
  Investments: ['Mutual Fund', 'Stock Purchase', 'Gold Investment', 'SIP'],
  EMI: ['Car Loan EMI', 'Home Loan EMI', 'Personal Loan'],
  Others: ['Gift', 'Donation', 'Pet Care', 'Laundry'],
};

const seed = async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Expense.deleteMany(), Income.deleteMany(), Card.deleteMany(), Budget.deleteMany()]);

  const user = await User.create({
    name: 'Alex Morgan',
    email: 'demo@example.com',
    password: 'password123',
    currency: 'INR',
    monthlyBudgetGoal: 5000,
    savingsGoal: 20000,
  });

  const cards = await Card.insertMany([
    { user: user._id, cardHolderName: 'Alex Morgan', cardNumber: '4532015112830366', bankName: 'Chase Bank', expiryDate: '12/27', creditLimit: 15000, currentUsage: 4230, billingCycleDate: 1, dueDate: 25, cardColor: 'from-violet-600 to-indigo-800', cardType: 'Visa', isDefault: true },
    { user: user._id, cardHolderName: 'Alex Morgan', cardNumber: '5425233430109903', bankName: 'Bank of America', expiryDate: '08/26', creditLimit: 10000, currentUsage: 1850, billingCycleDate: 15, dueDate: 10, cardColor: 'from-emerald-500 to-teal-700', cardType: 'Mastercard' },
    { user: user._id, cardHolderName: 'Alex Morgan', cardNumber: '374251018720955', bankName: 'Amex', expiryDate: '03/28', creditLimit: 25000, currentUsage: 7600, billingCycleDate: 5, dueDate: 28, cardColor: 'from-amber-500 to-orange-600', cardType: 'Amex' },
  ]);

  const expenses = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
    const numExpenses = 15 + Math.floor(Math.random() * 10);
    for (let j = 0; j < numExpenses; j++) {
      const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
      const titles = expenseTitles[cat];
      const day = 1 + Math.floor(Math.random() * daysInMonth);
      const date = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      expenses.push({
        user: user._id,
        title: titles[Math.floor(Math.random() * titles.length)],
        amount: Math.round((20 + Math.random() * 480) * 100) / 100,
        category: cat,
        date,
        paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        card: Math.random() > 0.5 ? cards[Math.floor(Math.random() * cards.length)]._id : null,
      });
    }
  }
  await Expense.insertMany(expenses);

  const incomeEntries = [];
  for (let i = 11; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    incomeEntries.push(
      { user: user._id, title: 'Monthly Salary', amount: 8500 + Math.round(Math.random() * 500), source: 'Salary', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 1), isRecurring: true, recurringFrequency: 'Monthly' },
      { user: user._id, title: 'Freelance Project', amount: 500 + Math.round(Math.random() * 1500), source: 'Freelance', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 10 + Math.floor(Math.random() * 10)) },
    );
    if (Math.random() > 0.6) {
      incomeEntries.push({ user: user._id, title: 'Investment Returns', amount: 200 + Math.round(Math.random() * 800), source: 'Investment', date: new Date(monthDate.getFullYear(), monthDate.getMonth(), 20) });
    }
  }
  await Income.insertMany(incomeEntries);

  const budgets = expenseCategories.map(cat => ({
    user: user._id, category: cat,
    amount: cat === 'Food' ? 800 : cat === 'Bills' ? 600 : cat === 'Shopping' ? 500 : cat === 'Entertainment' ? 300 : cat === 'Travel' ? 400 : cat === 'Health' ? 200 : cat === 'Investments' ? 1000 : cat === 'EMI' ? 1200 : 200,
    month: now.getMonth() + 1, year: now.getFullYear(), alertAt: 80,
  }));
  await Budget.insertMany(budgets);

  console.log('✅ Database seeded successfully!');
  console.log('📧 Demo login: demo@example.com / password123');
  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });

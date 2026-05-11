const router = require('express').Router();
const { getExpenses, createExpense, updateExpense, deleteExpense, getExpenseStats } = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');
const { uploadReceipt } = require('../middleware/upload');

router.use(protect);
router.get('/stats', getExpenseStats);
router.get('/', getExpenses);
router.post('/', uploadReceipt.single('receipt'), createExpense);
router.put('/:id', uploadReceipt.single('receipt'), updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;

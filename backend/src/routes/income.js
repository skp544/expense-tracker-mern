const router = require('express').Router();
const { getIncome, createIncome, updateIncome, deleteIncome, getIncomeStats } = require('../controllers/incomeController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getIncomeStats);
router.get('/', getIncome);
router.post('/', createIncome);
router.put('/:id', updateIncome);
router.delete('/:id', deleteIncome);

module.exports = router;

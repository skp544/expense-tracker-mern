const router = require('express').Router();
const { getDashboardStats, getMonthlyTrend, getCategoryTrend } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/dashboard', getDashboardStats);
router.get('/monthly-trend', getMonthlyTrend);
router.get('/category-trend', getCategoryTrend);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getPaymentAccounts,
  createPaymentAccount,
  updatePaymentAccount,
  deletePaymentAccount,
} = require('../controllers/paymentAccountController');

router.use(protect);
router.route('/').get(getPaymentAccounts).post(createPaymentAccount);
router.route('/:id').put(updatePaymentAccount).delete(deletePaymentAccount);

module.exports = router;

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getTransfers, createTransfer, updateTransfer,
  deleteTransfer, getTransferStats,
} = require('../controllers/transferController');

router.use(protect);
router.get('/stats', getTransferStats);
router.route('/').get(getTransfers).post(createTransfer);
router.route('/:id').put(updateTransfer).delete(deleteTransfer);

module.exports = router;

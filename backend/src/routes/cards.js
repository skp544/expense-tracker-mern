const router = require('express').Router();
const { getCards, createCard, updateCard, deleteCard, getCardSpending } = require('../controllers/cardController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getCards);
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);
router.get('/:id/spending', getCardSpending);

module.exports = router;

const express = require('express');

const {
  createExpense,
  getExpenses,
  getExpenseById,
} = require('../controllers/expenseController');

const {
  authenticateToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createExpense);
router.get('/', authenticateToken, getExpenses);
router.get('/:id', authenticateToken, getExpenseById);

module.exports = router;

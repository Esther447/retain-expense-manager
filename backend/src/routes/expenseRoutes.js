const express = require('express');

const {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
} = require('../controllers/expenseController');

const {
  authenticateToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authenticateToken, createExpense);
router.get('/', authenticateToken, getExpenses);
router.get('/:id', authenticateToken, getExpenseById);
router.put('/:id', authenticateToken, updateExpense);
router.delete('/:id', authenticateToken, deleteExpense);

module.exports = router;

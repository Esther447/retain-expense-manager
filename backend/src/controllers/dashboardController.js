const pool = require('../config/db');

const getDashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalResult = await pool.query(
      `SELECT
         COALESCE(SUM(amount), 0) AS total_spending,
         COUNT(*) AS total_expenses,
         COALESCE(AVG(amount), 0) AS average_expense
       FROM expenses
       WHERE user_id = $1`,
      [userId]
    );

    const categoryResult = await pool.query(
      `SELECT
         c.id AS category_id,
         c.name AS category_name,
         COALESCE(SUM(e.amount), 0) AS total_amount,
         COUNT(e.id) AS expense_count
       FROM categories c
       LEFT JOIN expenses e
         ON e.category_id = c.id
         AND e.user_id = $1
       GROUP BY c.id, c.name
       ORDER BY total_amount DESC`,
      [userId]
    );

    const highestResult = await pool.query(
      `SELECT
         e.id,
         e.title,
         e.amount,
         c.name AS category_name,
         e.expense_date
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = $1
       ORDER BY e.amount DESC
       LIMIT 1`,
      [userId]
    );

    const recentResult = await pool.query(
      `SELECT
         e.id,
         e.title,
         e.amount,
         c.name AS category_name,
         e.expense_date,
         e.payment_method
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = $1
       ORDER BY e.expense_date DESC, e.created_at DESC
       LIMIT 5`,
      [userId]
    );

    const budgetResult = await pool.query(
      `SELECT
         id,
         month,
         amount
       FROM budgets
       WHERE user_id = $1
       ORDER BY month DESC
       LIMIT 1`,
      [userId]
    );

    const totalSpending = Number(totalResult.rows[0].total_spending);
    const currentBudget = budgetResult.rows[0]
      ? Number(budgetResult.rows[0].amount)
      : 0;

    return res.json({
      summary: {
        total_spending: totalSpending,
        total_expenses: Number(totalResult.rows[0].total_expenses),
        average_expense: Number(
          Number(totalResult.rows[0].average_expense).toFixed(2)
        ),
      },
      budget: budgetResult.rows[0] || null,
      budget_remaining:
        currentBudget > 0 ? currentBudget - totalSpending : null,
      spending_by_category: categoryResult.rows,
      highest_expense: highestResult.rows[0] || null,
      recent_expenses: recentResult.rows,
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);

    return res.status(500).json({
      message: 'Server error while fetching dashboard insights',
    });
  }
};

module.exports = {
  getDashboardInsights,
};

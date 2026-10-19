const pool = require('../config/db');

const getDashboardInsights = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;

    let targetMonthStart;
    let targetMonthEnd;

    if (month) {
      // Validate YYYY-MM format
      if (!/^\d{4}-\d{2}$/.test(month)) {
        return res.status(400).json({ message: 'month query param must be in YYYY-MM format' });
      }
      targetMonthStart = `${month}-01`;
      const [year, m] = month.split('-').map(Number);
      const nextMonth = m === 12
        ? `${year + 1}-01-01`
        : `${year}-${String(m + 1).padStart(2, '0')}-01`;
      targetMonthEnd = nextMonth;
    } else {
      const now = new Date();
      const year = now.getFullYear();
      const m = String(now.getMonth() + 1).padStart(2, '0');
      targetMonthStart = `${year}-${m}-01`;
      const nextYear = now.getMonth() === 11 ? year + 1 : year;
      const nextM = now.getMonth() === 11 ? '01' : String(now.getMonth() + 2).padStart(2, '0');
      targetMonthEnd = `${nextYear}-${nextM}-01`;
    }

    const [
      totalResult,
      categoryResult,
      highestResult,
      recentResult,
      budgetResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
           COALESCE(SUM(amount), 0) AS total_spending,
           COUNT(*) AS total_expenses,
           COALESCE(AVG(amount), 0) AS average_expense
         FROM expenses
         WHERE user_id = $1 AND expense_date >= $2 AND expense_date < $3`,
        [userId, targetMonthStart, targetMonthEnd]
      ),
      pool.query(
        `SELECT
           c.id AS category_id,
           c.name AS category_name,
           COALESCE(SUM(e.amount), 0) AS total_amount,
           COUNT(e.id) AS expense_count
         FROM categories c
         LEFT JOIN expenses e
           ON e.category_id = c.id
           AND e.user_id = $1
           AND e.expense_date >= $2
           AND e.expense_date < $3
         GROUP BY c.id, c.name
         ORDER BY total_amount DESC`,
        [userId, targetMonthStart, targetMonthEnd]
      ),
      pool.query(
        `SELECT
           e.id, e.title, e.amount,
           c.name AS category_name,
           e.expense_date
         FROM expenses e
         JOIN categories c ON c.id = e.category_id
         WHERE e.user_id = $1 AND e.expense_date >= $2 AND e.expense_date < $3
         ORDER BY e.amount DESC
         LIMIT 1`,
        [userId, targetMonthStart, targetMonthEnd]
      ),
      pool.query(
        `SELECT
           e.id, e.title, e.amount,
           c.name AS category_name,
           e.expense_date, e.payment_method
         FROM expenses e
         JOIN categories c ON c.id = e.category_id
         WHERE e.user_id = $1
         ORDER BY e.expense_date DESC, e.created_at DESC
         LIMIT 5`,
        [userId]
      ),
      pool.query(
        `SELECT id, month, amount
         FROM budgets
         WHERE user_id = $1 AND month = $2`,
        [userId, targetMonthStart]
      ),
    ]);

    const totalSpending = Number(totalResult.rows[0].total_spending);
    const currentBudget = budgetResult.rows[0] ? Number(budgetResult.rows[0].amount) : 0;

    let budgetStatus = 'within';
    if (currentBudget > 0) {
      const ratio = totalSpending / currentBudget;
      if (ratio > 1) budgetStatus = 'over';
      else if (ratio >= 0.8) budgetStatus = 'approaching';
    }

    return res.json({
      selected_month: targetMonthStart.substring(0, 7),
      summary: {
        total_spending: totalSpending,
        total_expenses: Number(totalResult.rows[0].total_expenses),
        average_expense: Number(Number(totalResult.rows[0].average_expense).toFixed(2)),
      },
      budget: budgetResult.rows[0] || null,
      budget_remaining: currentBudget > 0
        ? Number((currentBudget - totalSpending).toFixed(2))
        : null,
      budget_status: budgetStatus,
      spending_by_category: categoryResult.rows,
      highest_expense: highestResult.rows[0] || null,
      recent_expenses: recentResult.rows,
    });
  } catch (error) {
    console.error('Dashboard insights error:', error);
    return res.status(500).json({ message: 'Server error while fetching dashboard insights' });
  }
};

const getAdminInsights = async (req, res) => {
  try {
    const [
      totalsResult,
      currentMonthResult,
      spendingByCategoryResult,
      topCategoriesResult,
      bottomCategoriesResult,
      recentExpensesResult,
      recentUsersResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*) FROM users) AS total_users,
           COUNT(e.id) AS total_expenses,
           COALESCE(SUM(e.amount), 0) AS total_spending
         FROM expenses e`
      ),
      pool.query(
        `SELECT COUNT(*) AS current_month_expenses
         FROM expenses
         WHERE DATE_TRUNC('month', expense_date) = DATE_TRUNC('month', CURRENT_DATE)`
      ),
      pool.query(
        `SELECT
           c.id,
           c.name AS category_name,
           COALESCE(SUM(e.amount), 0) AS total_amount,
           COUNT(e.id) AS expense_count
         FROM categories c
         LEFT JOIN expenses e ON e.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY total_amount DESC`
      ),
      pool.query(
        `SELECT
           c.name AS category_name,
           COUNT(e.id) AS expense_count
         FROM categories c
         LEFT JOIN expenses e ON e.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY expense_count DESC
         LIMIT 5`
      ),
      pool.query(
        `SELECT
           c.name AS category_name,
           COUNT(e.id) AS expense_count
         FROM categories c
         LEFT JOIN expenses e ON e.category_id = c.id
         GROUP BY c.id, c.name
         ORDER BY expense_count ASC
         LIMIT 5`
      ),
      pool.query(
        `SELECT
           e.id, e.title, e.amount,
           u.name AS user_name,
           c.name AS category_name,
           e.expense_date
         FROM expenses e
         JOIN users u ON u.id = e.user_id
         JOIN categories c ON c.id = e.category_id
         ORDER BY e.created_at DESC
         LIMIT 10`
      ),
      pool.query(
        `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 10`
      ),
    ]);

    return res.json({
      summary: {
        total_users: Number(totalsResult.rows[0].total_users),
        total_expenses: Number(totalsResult.rows[0].total_expenses),
        total_spending: Number(totalsResult.rows[0].total_spending),
        current_month_expenses: Number(currentMonthResult.rows[0].current_month_expenses),
      },
      spending_by_category: spendingByCategoryResult.rows,
      top_categories: topCategoriesResult.rows,
      bottom_categories: bottomCategoriesResult.rows,
      recent_expenses: recentExpensesResult.rows,
      recent_users: recentUsersResult.rows,
    });
  } catch (error) {
    console.error('Admin insights error:', error);
    return res.status(500).json({ message: 'Server error while fetching admin insights' });
  }
};

module.exports = {
  getDashboardInsights,
  getAdminInsights,
};

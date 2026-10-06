const pool = require('../config/db');

const createBudget = async (req, res) => {
  try {
    const { month, amount } = req.body;

    if (!month || !amount) {
      return res.status(400).json({
        message: 'Month and amount are required',
      });
    }

    const result = await pool.query(
      `INSERT INTO budgets (user_id, month, amount)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [req.user.id, month, amount]
    );

    return res.status(201).json({
      message: 'Budget created successfully',
      budget: result.rows[0],
    });
  } catch (error) {
    console.error('Create budget error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'A budget already exists for this month',
      });
    }

    return res.status(500).json({
      message: 'Server error while creating budget',
    });
  }
};

const getBudgets = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         month,
         amount,
         created_at,
         updated_at
       FROM budgets
       WHERE user_id = $1
       ORDER BY month DESC`,
      [req.user.id]
    );

    return res.json({
      budgets: result.rows,
    });
  } catch (error) {
    console.error('Get budgets error:', error);

    return res.status(500).json({
      message: 'Server error while fetching budgets',
    });
  }
};

const updateBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const { month, amount } = req.body;

    if (!month || !amount) {
      return res.status(400).json({
        message: 'Month and amount are required',
      });
    }

    const result = await pool.query(
      `UPDATE budgets
       SET
         month = $1,
         amount = $2,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [month, amount, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Budget not found',
      });
    }

    return res.json({
      message: 'Budget updated successfully',
      budget: result.rows[0],
    });
  } catch (error) {
    console.error('Update budget error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'A budget already exists for this month',
      });
    }

    return res.status(500).json({
      message: 'Server error while updating budget',
    });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM budgets
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Budget not found',
      });
    }

    return res.json({
      message: 'Budget deleted successfully',
    });
  } catch (error) {
    console.error('Delete budget error:', error);

    return res.status(500).json({
      message: 'Server error while deleting budget',
    });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
};

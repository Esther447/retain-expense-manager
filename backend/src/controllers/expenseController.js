const pool = require('../config/db');

const createExpense = async (req, res) => {
  try {
    const {
      title,
      amount,
      category_id,
      expense_date,
      payment_method,
      notes,
    } = req.body;

    if (
      !title ||
      !amount ||
      !category_id ||
      !expense_date ||
      !payment_method
    ) {
      return res.status(400).json({
        message:
          'Title, amount, category, expense date, and payment method are required',
      });
    }

    const category = await pool.query(
      'SELECT id FROM categories WHERE id = $1',
      [category_id]
    );

    if (category.rows.length === 0) {
      return res.status(400).json({
        message: 'Category not found',
      });
    }

    const result = await pool.query(
      `INSERT INTO expenses
       (user_id, title, amount, category_id, expense_date, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        req.user.id,
        title,
        amount,
        category_id,
        expense_date,
        payment_method,
        notes || null,
      ]
    );

    return res.status(201).json({
      message: 'Expense created successfully',
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Create expense error:', error);

    return res.status(500).json({
      message: 'Server error while creating expense',
    });
  }
};

const getExpenses = async (req, res) => {
  try {
    const {
      search = '',
      category_id,
      payment_method,
      start_date,
      end_date,
      sort_by = 'expense_date',
      sort_order = 'DESC',
      page = 1,
      limit = 10,
    } = req.query;

    const allowedSortFields = {
      expense_date: 'e.expense_date',
      amount: 'e.amount',
      title: 'e.title',
      created_at: 'e.created_at',
    };

    const sortField =
      allowedSortFields[sort_by] || allowedSortFields.expense_date;

    const sortDirection =
      String(sort_order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(parseInt(limit, 10) || 10, 1),
      100
    );
    const offset = (pageNumber - 1) * limitNumber;

    const conditions = ['e.user_id = $1'];
    const values = [req.user.id];
    let parameterNumber = 2;

    if (search) {
      conditions.push(
        `(e.title ILIKE $${parameterNumber}
          OR e.notes ILIKE $${parameterNumber})`
      );
      values.push(`%${search}%`);
      parameterNumber += 1;
    }

    if (category_id) {
      conditions.push(`e.category_id = $${parameterNumber}`);
      values.push(category_id);
      parameterNumber += 1;
    }

    if (payment_method) {
      conditions.push(`e.payment_method = $${parameterNumber}`);
      values.push(payment_method);
      parameterNumber += 1;
    }

    if (start_date) {
      conditions.push(`e.expense_date >= $${parameterNumber}`);
      values.push(start_date);
      parameterNumber += 1;
    }

    if (end_date) {
      conditions.push(`e.expense_date <= $${parameterNumber}`);
      values.push(end_date);
      parameterNumber += 1;
    }

    const whereClause = conditions.join(' AND ');

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM expenses e
       WHERE ${whereClause}`,
      values
    );

    const totalExpenses = Number(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT
         e.id,
         e.title,
         e.amount,
         e.category_id,
         c.name AS category_name,
         e.expense_date,
         e.payment_method,
         e.notes,
         e.created_at,
         e.updated_at
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE ${whereClause}
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $${parameterNumber}
       OFFSET $${parameterNumber + 1}`,
      [...values, limitNumber, offset]
    );

    return res.json({
      expenses: result.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalExpenses,
        totalPages: Math.ceil(totalExpenses / limitNumber),
      },
    });
  } catch (error) {
    console.error('Get expenses error:', error);

    return res.status(500).json({
      message: 'Server error while fetching expenses',
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         e.id,
         e.title,
         e.amount,
         e.category_id,
         c.name AS category_name,
         e.expense_date,
         e.payment_method,
         e.notes,
         e.created_at,
         e.updated_at
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Expense not found',
      });
    }

    return res.json({
      expense: result.rows[0],
    });
  } catch (error) {
    console.error('Get expense by ID error:', error);

    return res.status(500).json({
      message: 'Server error while fetching expense',
    });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
};

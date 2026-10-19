const pool = require('../config/db');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const VALID_PAYMENT_METHODS = ['cash', 'mobile-money', 'card', 'bank'];

function validateExpenseFields(title, amount, expense_date, payment_method) {
  if (!title || !amount || !expense_date || !payment_method) {
    return 'Title, amount, category, expense date, and payment method are required';
  }
  if (title.trim().length > 255) {
    return 'Title must be 255 characters or fewer';
  }
  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return 'Amount must be a positive number';
  }
  if (!DATE_RE.test(expense_date) || isNaN(Date.parse(expense_date))) {
    return 'Expense date must be a valid date in YYYY-MM-DD format';
  }
  if (!VALID_PAYMENT_METHODS.includes(payment_method)) {
    return 'Invalid payment method';
  }
  return null;
}

const createExpense = async (req, res) => {
  try {
    const { title, amount, category_id, expense_date, payment_method, notes } = req.body;

    const validationError = validateExpenseFields(title, amount, expense_date, payment_method);
    if (validationError) return res.status(400).json({ message: validationError });

    if (!category_id) return res.status(400).json({ message: 'Category is required' });

    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (category.rows.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const result = await pool.query(
      `INSERT INTO expenses (user_id, title, amount, category_id, expense_date, payment_method, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [req.user.id, title.trim(), amount, category_id, expense_date, payment_method, notes || null]
    );

    return res.status(201).json({ message: 'Expense created successfully', expense: result.rows[0] });
  } catch (error) {
    console.error('Create expense error:', error);
    return res.status(500).json({ message: 'Server error while creating expense' });
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

    const ORDER_BY_MAP = {
      'expense_date-DESC': 'ORDER BY e.expense_date DESC',
      'expense_date-ASC':  'ORDER BY e.expense_date ASC',
      'amount-DESC':       'ORDER BY e.amount DESC',
      'amount-ASC':        'ORDER BY e.amount ASC',
      'title-DESC':        'ORDER BY e.title DESC',
      'title-ASC':         'ORDER BY e.title ASC',
      'created_at-DESC':   'ORDER BY e.created_at DESC',
      'created_at-ASC':    'ORDER BY e.created_at ASC',
    };

    const validSortFields = ['expense_date', 'amount', 'title', 'created_at'];
    const safeField = validSortFields.includes(sort_by) ? sort_by : 'expense_date';
    const safeDir = String(sort_order).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    const orderBy = ORDER_BY_MAP[`${safeField}-${safeDir}`];

    const pageNumber = Math.max(parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
    const offset = (pageNumber - 1) * limitNumber;

    const values = [req.user.id];
    let p = 2;
    let searchClause = '';
    let categoryClause = '';
    let paymentClause = '';
    let startClause = '';
    let endClause = '';

    if (search) {
      searchClause = `AND (e.title ILIKE $${p} OR e.notes ILIKE $${p})`;
      values.push(`%${search}%`);
      p += 1;
    }
    if (category_id) {
      categoryClause = `AND e.category_id = $${p}`;
      values.push(category_id);
      p += 1;
    }
    if (payment_method) {
      paymentClause = `AND e.payment_method = $${p}`;
      values.push(payment_method);
      p += 1;
    }
    if (start_date) {
      startClause = `AND e.expense_date >= $${p}`;
      values.push(start_date);
      p += 1;
    }
    if (end_date) {
      endClause = `AND e.expense_date <= $${p}`;
      values.push(end_date);
      p += 1;
    }

    const countResult = await pool.query(
      `SELECT COUNT(*) AS total
       FROM expenses e
       WHERE e.user_id = $1
       ${searchClause} ${categoryClause} ${paymentClause} ${startClause} ${endClause}`,
      values
    );

    const totalExpenses = Number(countResult.rows[0].total);

    const result = await pool.query(
      `SELECT
         e.id, e.title, e.amount, e.category_id,
         c.name AS category_name,
         e.expense_date, e.payment_method, e.notes,
         e.created_at, e.updated_at
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.user_id = $1
       ${searchClause} ${categoryClause} ${paymentClause} ${startClause} ${endClause}
       ${orderBy}
       LIMIT $${p} OFFSET $${p + 1}`,
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
    return res.status(500).json({ message: 'Server error while fetching expenses' });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         e.id, e.title, e.amount, e.category_id,
         c.name AS category_name,
         e.expense_date, e.payment_method, e.notes,
         e.created_at, e.updated_at
       FROM expenses e
       JOIN categories c ON c.id = e.category_id
       WHERE e.id = $1 AND e.user_id = $2`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ expense: result.rows[0] });
  } catch (error) {
    console.error('Get expense by ID error:', error);
    return res.status(500).json({ message: 'Server error while fetching expense' });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, amount, category_id, expense_date, payment_method, notes } = req.body;

    const validationError = validateExpenseFields(title, amount, expense_date, payment_method);
    if (validationError) return res.status(400).json({ message: validationError });

    if (!category_id) return res.status(400).json({ message: 'Category is required' });

    const category = await pool.query('SELECT id FROM categories WHERE id = $1', [category_id]);
    if (category.rows.length === 0) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const result = await pool.query(
      `UPDATE expenses
       SET title = $1, amount = $2, category_id = $3, expense_date = $4,
           payment_method = $5, notes = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 AND user_id = $8
       RETURNING *`,
      [title.trim(), amount, category_id, expense_date, payment_method, notes || null, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ message: 'Expense updated successfully', expense: result.rows[0] });
  } catch (error) {
    console.error('Update expense error:', error);
    return res.status(500).json({ message: 'Server error while updating expense' });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM expenses WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    return res.status(500).json({ message: 'Server error while deleting expense' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};

const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at FROM categories ORDER BY name ASC`
    );
    return res.json({ categories: result.rows });
  } catch (error) {
    console.error('Get categories error:', error);
    return res.status(500).json({ message: 'Server error while fetching categories' });
  }
};

const createCategory = async (req, res) => {
  try {
    const name = (req.body.name ?? '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await pool.query(
      `INSERT INTO categories (name) VALUES ($1) RETURNING id, name, created_at`,
      [name]
    );

    return res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    return res.status(500).json({ message: 'Server error while creating category' });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const name = (req.body.name ?? '').trim();

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const result = await pool.query(
      `UPDATE categories SET name = $1 WHERE id = $2 RETURNING id, name, created_at`,
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Category not found' });
    }

    return res.json({ message: 'Category updated successfully', category: result.rows[0] });
  } catch (error) {
    console.error('Update category error:', error);
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Category already exists' });
    }
    return res.status(500).json({ message: 'Server error while updating category' });
  }
};

const deleteCategory = async (req, res) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    await client.query('BEGIN');

    const existing = await client.query(`SELECT id FROM categories WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Category not found' });
    }

    const fallback = await client.query(
      `INSERT INTO categories (name)
       VALUES ('Uncategorized')
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
       RETURNING id`
    );
    const fallbackId = fallback.rows[0].id;

    if (String(fallbackId) === String(id)) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Cannot delete the Uncategorized fallback category',
      });
    }

    await client.query(
      `UPDATE expenses SET category_id = $1 WHERE category_id = $2`,
      [fallbackId, id]
    );

    await client.query(`DELETE FROM categories WHERE id = $1`, [id]);

    await client.query('COMMIT');

    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete category error:', error);
    return res.status(500).json({ message: 'Server error while deleting category' });
  } finally {
    client.release();
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

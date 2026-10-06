const pool = require('../config/db');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, created_at
       FROM categories
       ORDER BY name ASC`
    );

    return res.json({
      categories: result.rows,
    });
  } catch (error) {
    console.error('Get categories error:', error);

    return res.status(500).json({
      message: 'Server error while fetching categories',
    });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
      });
    }

    const result = await pool.query(
      `INSERT INTO categories (name)
       VALUES ($1)
       RETURNING id, name, created_at`,
      [name]
    );

    return res.status(201).json({
      message: 'Category created successfully',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Create category error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Category already exists',
      });
    }

    return res.status(500).json({
      message: 'Server error while creating category',
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: 'Category name is required',
      });
    }

    const result = await pool.query(
      `UPDATE categories
       SET name = $1
       WHERE id = $2
       RETURNING id, name, created_at`,
      [name, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    return res.json({
      message: 'Category updated successfully',
      category: result.rows[0],
    });
  } catch (error) {
    console.error('Update category error:', error);

    if (error.code === '23505') {
      return res.status(409).json({
        message: 'Category already exists',
      });
    }

    return res.status(500).json({
      message: 'Server error while updating category',
    });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM categories
       WHERE id = $1
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'Category not found',
      });
    }

    return res.json({
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Delete category error:', error);

    if (error.code === '23503') {
      return res.status(409).json({
        message: 'Category cannot be deleted because it is used by an expense',
      });
    }

    return res.status(500).json({
      message: 'Server error while deleting category',
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const pool = require('../config/db');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1d',
    }
  );
};

const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        message: 'Email is already registered',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, created_at`,
      [name, email, passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user);

    return res.status(201).json({
      message: 'Account created successfully',
      user,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);

    return res.status(500).json({
      message: 'Server error during signup',
    });
  }
};

const signin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    return res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
      token,
    });
  } catch (error) {
    console.error('Signin error:', error);

    return res.status(500).json({
      message: 'Server error during signin',
    });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, created_at
       FROM users
       WHERE id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    return res.json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error('Get current user error:', error);

    return res.status(500).json({
      message: 'Server error',
    });
  }
};

module.exports = {
  signup,
  signin,
  getCurrentUser,
};
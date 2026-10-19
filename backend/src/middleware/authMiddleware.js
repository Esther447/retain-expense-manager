const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication token is required',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Re-fetch role from DB so revoked/demoted users are blocked immediately
    const result = await pool.query(
      'SELECT id, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: 'User no longer exists' });
    }

    req.user = { id: result.rows[0].id, role: result.rows[0].role };
    next();
  } catch (error) {
    return res.status(403).json({
      message: 'Invalid or expired authentication token',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Admin access required',
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};

const express = require('express');

const {
  getDashboardInsights,
  getAdminInsights,
} = require('../controllers/dashboardController');

const {
  authenticateToken,
  requireAdmin,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/insights', authenticateToken, getDashboardInsights);
router.get('/admin-insights', authenticateToken, requireAdmin, getAdminInsights);

module.exports = router;

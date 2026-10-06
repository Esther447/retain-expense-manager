const express = require('express');

const {
  getDashboardInsights,
} = require('../controllers/dashboardController');

const {
  authenticateToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/insights', authenticateToken, getDashboardInsights);

module.exports = router;

const express = require('express');

const {
  signup,
  signin,
  getCurrentUser,
} = require('../controllers/authController');

const {
  authenticateToken,
} = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/me', authenticateToken, getCurrentUser);

module.exports = router;
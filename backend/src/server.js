require('dotenv').config();

const express = require('express');
const cors = require('cors');

const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const expenseRoutes = require('./routes/expenseRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/expenses', expenseRoutes);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Retain API',
  });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');

    res.json({
      message: 'Retain API and PostgreSQL are connected',
      databaseTime: result.rows[0].now,
    });
  } catch (error) {
    console.error('Database connection error:', error);

    res.status(500).json({
      message: 'Database connection failed',
    });
  }
});

app.listen(PORT, () => {
  console.log(`Retain API is running on http://localhost:${PORT}`);
});
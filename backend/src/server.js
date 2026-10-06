const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the Retain API',
  });
});

app.listen(PORT, () => {
  console.log(`Retain API is running on http://localhost:${PORT}`);
});
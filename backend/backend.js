const express = require('express');
const app = express();

const PORT = process.env.PORT || 3000;
const SECRET_PASSWORD = process.env.SECRET_PASSWORD || 'default-pass';

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from backend!', secret: SECRET_PASSWORD });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});


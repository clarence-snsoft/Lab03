const express = require('express');
const axios = require('axios');
const app = express();

const PORT = process.env.PORT || 3001;
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';
const GREETING_TEXT = process.env.GREETING_TEXT || 'Welcome to the Frontend';

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/api/data`);
    res.send(`
      <h1>${GREETING_TEXT}</h1>
      <p>Backend says: ${response.data.message}</p>
      <p>Secret is: ${response.data.secret}</p>
    `);
  } catch (error) {
    console.error('Error connecting to backend:', error.message);
    res.status(500).send('Error connecting to backend.');
  }
});

// Delay app startup for 10 seconds
setTimeout(() => {
  app.listen(PORT, () => {
    console.log(`Frontend server running on port ${PORT} (after 10s delay)`);
  });
}, 10000);

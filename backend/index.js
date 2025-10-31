const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'hafees753',
  database: 'signup_db'
});

// Simple health endpoint so we can probe the server
app.get('/', (_req, res) => res.send('OK'));

app.post('/api/users', async (req, res) => {
  const { username, password, fullName, dob, address, country, email, phone } = req.body;

  // Server-side validation
  if (!username || !password || !fullName || !dob || !address || !country || !email || !phone) {
    return res.status(400).json({ message: 'All fields are required.' });
  }
  if (!/^(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[a-zA-Z0-9]).{8,}$/.test(password)) {
    return res.status(400).json({ message: 'Password does not meet criteria.' });
  }

  pool.query(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, email],
    async (err, results) => {
      if (err) return res.status(500).json({ message: 'Server error.' });
      if (results.length > 0) return res.status(409).json({ message: 'Username or Email already exists.' });

      const passwordHash = await bcrypt.hash(password, 10);

      pool.query(
        'INSERT INTO users (username, password_hash, full_name, dob, address, country, email, phone, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [username, passwordHash, fullName, dob, address, country, email, phone],
        (error) => {
          if (error) return res.status(500).json({ message: 'Failed to create user.' });
          return res.status(201).json({ message: 'User registered.' });
        }
      );
    }
  );
});

// Start server and log a helpful message so we can diagnose startup from logs
const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// Graceful logging for unexpected errors — helps debug connection/refused issues
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection at:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  // Optional: exit so a process manager can restart the app
  // process.exit(1);
});

module.exports = server;

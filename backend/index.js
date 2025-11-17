const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// DB Connection Pool
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'hafees753',
    database: 'signup_db'
});

// Health check
app.get('/', (_req, res) => {
    res.send('OK');
});

// Signup API
app.post('/api/users', async (req, res) => {
    try {
        const { username, password, fullName, dob, phone, country, email, address } = req.body;

        // Validate input
        if (!username || !password || !fullName || !dob || !phone || !country || !email || !address) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert Query (addresses table last column in DB)
        const sql = `
            INSERT INTO users 
                (username, password_hash, email, address, phone, full_name, dob, country, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

        const values = [
            username,
            hashedPassword,
            email,
            address,
            phone,
            fullName,
            dob,
            country
        ];

        await pool.query(sql, values);

        res.status(201).json({ message: 'User registered successfully!' });

    } catch (error) {
        console.error('Error inserting user:', error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Start server
app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});

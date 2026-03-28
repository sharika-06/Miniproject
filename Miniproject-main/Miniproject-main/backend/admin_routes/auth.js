const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Login route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];

        // In a real app, use bcrypt to compare hashes
        if (user.password_hash !== password) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // PER USER REQUEST: Restricted to Admin accounts
        // Allowing the specific admin emails
        const allowedAdmins = ['admin@neugraph.com', 'siyaehan@gmail.com'];
        if (!allowedAdmins.includes(user.email)) {
            return res.status(403).json({ message: 'Access Denied: Only authorized admins can login.' });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all admins
router.get('/', async (req, res) => {
    try {
        const [admins] = await db.query('SELECT id, name, email, role, phone, employee_code, branch_name, status, created_at FROM users');
        res.json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Create new admin
router.post('/', async (req, res) => {
    const { name, email, password, role, phone, employeeCode, branchName } = req.body;

    // Generate a random 6-digit verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    try {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role, phone, employee_code, branch_name, verification_code, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, email, password, role || 'admin', phone, employeeCode, branchName, verificationCode, 'pending']
        );

        // In a real app, send the verificationCode via SMS/Email here.
        // For this project, we return it in the response so the superadmin can see/share it.
        res.status(201).json({
            id: result.insertId,
            name,
            email,
            role,
            phone,
            employeeCode,
            branchName,
            verificationCode,
            status: 'pending'
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or Employee Code already exists' });
        }
        console.error('Error creating admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Verify admin code
router.post('/verify', async (req, res) => {
    const { email, code } = req.body;

    try {
        const [users] = await db.query('SELECT * FROM users WHERE email = ? AND verification_code = ?', [email, code]);

        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid verification code' });
        }

        await db.query('UPDATE users SET status = "active", verification_code = NULL WHERE email = ?', [email]);

        res.json({ message: 'Account verified and enabled successfully' });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Delete admin
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Prevent deleting the primary superadmin (id=1)
        if (id === '1') {
            return res.status(403).json({ message: 'The primary superadmin cannot be deleted.' });
        }

        const [result] = await db.query('DELETE FROM users WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;

const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get dashboard stats
router.get('/stats', async (req, res) => {
    try {
        const [totalResult] = await db.query('SELECT COUNT(*) as totalUsers FROM users');
        const [activeResult] = await db.query("SELECT COUNT(*) as activeAdmins FROM users WHERE status = 'active'");
        
        const totalUsers = totalResult[0].totalUsers;
        const activeAdmins = activeResult[0].activeAdmins;

        res.json({
            totalUsers: totalUsers || 0,
            activeSessions: activeAdmins || 0,
            systemStatus: 'Healthy'
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
});

// Get recent activity (Simulated from existing data for now)
router.get('/activity', async (req, res) => {
    try {
        const [users] = await db.query('SELECT name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5');
        const activities = users.map(u => ({
            id: Math.random().toString(36).substr(2, 9),
            type: 'USER_REGISTRATION',
            message: `${u.name} (${u.role}) joined the system`,
            time: u.created_at
        }));
        res.json(activities);
    } catch (error) {
        console.error('Error fetching dashboard activity:', error);
        res.status(500).json([]); // Always return an array to prevent frontend crash
    }
});

module.exports = router;

const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function checkUsers() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: 'admin_portal',
            ssl: { rejectUnauthorized: false }
        });
        
        console.log('Connected to admin_portal!');
        const [rows] = await connection.query('SELECT name, email, role, status FROM users');
        console.log('Current Users in DB:', rows);
        
        await connection.end();
    } catch (err) {
        console.error('Check failed:', err.message);
    }
}

checkUsers();

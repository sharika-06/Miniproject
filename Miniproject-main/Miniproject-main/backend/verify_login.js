const mysql = require('mysql2/promise');
const axios = require('axios');
require('dotenv').config();

async function verify() {
    console.log('Simulating login...');
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', {
            mailId: 'admin@neugraph.com',
            password: 'admin123'
        });
        console.log('Login Response:', response.data);

        if (response.data.success) {
            console.log('Checking miniproject_data.users table...');
            const conn = await mysql.createConnection({
                host: 'localhost',
                user: 'root',
                password: '1234',
                database: 'miniproject_data'
            });
            const [rows] = await conn.query('SELECT * FROM users ORDER BY login_time DESC LIMIT 1');
            console.log('Last Log Entry:', rows[0]);
            await conn.end();
        } else {
            console.error('Login failed simulation.');
        }
    } catch (error) {
        console.error('Verification error:', error.message);
        if (error.response) console.log('Response Error:', error.response.data);
    }
}

verify();

const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: 'localhost',
            user: 'root',
            password: 'sql@123',
            multipleStatements: true
        });

        console.log('--- Checking admin_portal.users ---');
        try {
            const [rows] = await connection.query('SELECT * FROM admin_portal.users');
            console.table(rows.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role })));
        } catch (e) { console.log('Error checking admin_portal:', e.message); }

        console.log('\n--- Checking miniproject_data.users ---');
        try {
            const [rows] = await connection.query('SELECT * FROM miniproject_data.users');
            console.table(rows);
        } catch (e) { console.log('Error checking miniproject_data:', e.message); }

        console.log('\n--- Checking miniproject_main.users (if exists) ---');
        try {
            const [rows] = await connection.query('SELECT * FROM miniproject_main.users');
            console.table(rows);
        } catch (e) { console.log('Table/DB miniproject_main.users might not exist'); }

        await connection.end();
    } catch (error) {
        console.error('Connection failed:', error);
    }
}

checkDB();

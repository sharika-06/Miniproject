const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function initDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true
        });

        console.log('Connected to MySQL server.');

        const schemaPath = path.join(__dirname, '../database/schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await connection.query(schema);
        console.log('Database schema initialized.');

        await connection.end();
    } catch (error) {
        console.error('Database initialization failed:', error.message);
    }
}

initDB();

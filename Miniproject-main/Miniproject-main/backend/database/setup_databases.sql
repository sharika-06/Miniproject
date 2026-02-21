
-- Create miniproject_data database and users table for tracking
CREATE DATABASE IF NOT EXISTS miniproject_data;
USE miniproject_data;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    mail_id VARCHAR(255),
    employee_code VARCHAR(50),
    role VARCHAR(50),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

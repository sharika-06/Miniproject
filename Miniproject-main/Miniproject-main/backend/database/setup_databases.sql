
-- Create miniproject_main database and Login_user table for tracking
CREATE DATABASE IF NOT EXISTS miniproject_main;
USE miniproject_main;

CREATE TABLE IF NOT EXISTS Login_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    mail_id VARCHAR(255),
    employee_code VARCHAR(50),
    role VARCHAR(50),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

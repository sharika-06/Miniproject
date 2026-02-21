CREATE DATABASE IF NOT EXISTS miniproject_main;
USE miniproject_main;

-- Table for tracking login history
CREATE TABLE IF NOT EXISTS Login_user (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_name VARCHAR(255),
    mail_id VARCHAR(255),
    employee_code VARCHAR(50),
    role VARCHAR(50),
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for account details
CREATE TABLE IF NOT EXISTS ACCOUNT (
    id VARCHAR(50) PRIMARY KEY,
    account_no VARCHAR(50),
    account_holder_name VARCHAR(255),
    risk_score INT,
    account_type VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);




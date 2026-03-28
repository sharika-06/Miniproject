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
    admin_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for storing uploaded transactions
CREATE TABLE IF NOT EXISTS TRANSACTION (
    transaction_id VARCHAR(50) PRIMARY KEY,
    account_id VARCHAR(50),
    account_holder VARCHAR(255),
    transaction_type VARCHAR(100),
    transaction_date DATE,
    transaction_time TIME,
    amount DECIMAL(15, 2),
    account_balance DECIMAL(15, 2),
    merchant_id VARCHAR(50),
    location VARCHAR(255),
    sender_name VARCHAR(255),
    sender_id VARCHAR(50),
    sender_account_no VARCHAR(50),
    admin_id VARCHAR(255),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES ACCOUNT(id) ON DELETE SET NULL
);

-- Table for storing top 3 high risk persons
CREATE TABLE IF NOT EXISTS Risks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(255),
    person_name VARCHAR(255),
    account_no VARCHAR(50),
    risk_score INT,
    risk_level VARCHAR(50),
    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Audit Logs
CREATE TABLE IF NOT EXISTS Audit_Logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    action VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Notifications
CREATE TABLE IF NOT EXISTS Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    title VARCHAR(255),
    message TEXT,
    type VARCHAR(50) DEFAULT 'info',
    status ENUM('read', 'unread') DEFAULT 'unread',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for Help Requests
CREATE TABLE IF NOT EXISTS Help_Requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(255),
    subject VARCHAR(255),
    message TEXT,
    status ENUM('pending', 'in-progress', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for User Settings
CREATE TABLE IF NOT EXISTS User_Settings (
    user_email VARCHAR(255) PRIMARY KEY,
    theme VARCHAR(50) DEFAULT 'dark',
    email_notifications BOOLEAN DEFAULT TRUE,
    two_factor_enabled BOOLEAN DEFAULT FALSE
);

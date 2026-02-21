CREATE DATABASE IF NOT EXISTS admin_portal;
USE admin_portal;

DROP TABLE IF EXISTS settings;
DROP TABLE IF EXISTS users;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    employee_code VARCHAR(50) UNIQUE,
    branch_name VARCHAR(100),
    verification_code VARCHAR(6),
    status ENUM('pending', 'active') DEFAULT 'pending',
    role ENUM('user', 'admin', 'superadmin') DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
    setting_key VARCHAR(255) PRIMARY KEY,
    setting_value TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO settings (setting_key, setting_value) VALUES 
('platform_name', 'NeuGraph'),
('timezone', 'UTC+1'),
('email_prefix', 'false'),
('two_factor_auth', 'false');

INSERT INTO users (name, email, password_hash, role, status) VALUES 
('Admin', 'admin@neugraph.com', 'admin123', 'superadmin', 'active'),
('User', 'user@neugraph.com', 'user123', 'user', 'active');

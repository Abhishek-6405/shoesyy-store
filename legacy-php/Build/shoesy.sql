-- Create database
CREATE DATABASE IF NOT EXISTS shoesy;
USE shoesy;

-- Create table for users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO Users (id, username, password, email) VALUES
(1, 'john_doe', 'password123', 'john@example.com'),
(2, 'jane_doe', 'password456', 'jane@example.com'),
(3, 'alice_smith', 'password789', 'alice@example.com');

-- Create table login_attempts
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50) NOT NULL UNIQUE,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Create table for products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO products (id, name, price, image, description, category) VALUES
(1, 'Nike Air Jordan 1', 9999.00, 'images/shoe1.jpg', 'High-top sneaker with iconic Air Jordan design', 'Nike'),
(2, 'NIKE Air Jordan 1 MID SE', 10000.00, 'images/shoe2.jpg', 'Mid-top sneaker with premium materials and classic Jordan look', 'Nike'),
(3, 'NIKE Air Force 1', 9999.00, 'images/shoe3.jpg', 'Classic low-top sneaker with Air cushioning', 'Nike'),
(4, 'NIKE Court Vision', 5999.00, 'images/shoe4.jpg', 'Retro basketball-inspired sneaker', 'Nike'),
(5, 'NIKE Air Jorden Low Bred', 7999.00, 'images/shoe5.jpg', 'Low-top sneaker with Bred colorway', 'Nike'),
(6, 'ADIDAS Grand Court', 3999.00, 'images/shoe6.jpg', 'Tennis-inspired sneaker with a sleek design', 'Adidas'),
(7, 'ADIDAS Daily 3.0', 4599.00, 'images/shoe7.jpg', 'Casual sneaker with a minimalist look', 'Adidas'),
(8, 'ADIDAS Campus OOs', 3599.00, 'images/shoe8.jpg', 'Classic suede sneaker with a street-style look', 'Adidas'),
(9, 'ADIDAS Forum Low CL', 10000.00, 'images/shoe9.jpg', 'Low-top sneaker with a retro basketball design', 'Adidas'),
(10, 'ADIDAS HOOPS 2.0', 8549.00, 'images/shoe10.jpg', 'Basketball-inspired sneaker with modern updates', 'Adidas'),
(11, 'PUMA Club 5V5', 5999.00, 'images/shoe11.jpg', 'Soccer-inspired sneaker with bold design', 'Puma'),
(12, 'PUMA Carina Slim', 2999.00, 'images/shoe12.jpg', 'Slim profile sneaker with classic Puma styling', 'Puma'),
(13, 'PUMA BIktop Rider', 8999.00, 'images/shoe13.jpg', 'Chunky sneaker with retro vibes', 'Puma'),
(14, 'PUMA RBD Game', 6999.00, 'images/shoe14.jpg', 'Sporty sneaker with a modern twist', 'Puma'),
(15, 'PUMA Rebound v6', 4999.00, 'images/shoe15.jpg', 'High-top sneaker with classic basketball look', 'Puma'),
(16, 'ASICS Gel-Game 8', 5599.00, 'images/shoe16.jpg', 'Tennis shoe with GEL technology for comfort', 'Asics'),
(17, 'ASICS Gel-Resolution 9', 9549.00, 'images/shoe17.jpg', 'High-performance tennis shoe with superior support', 'Asics'),
(18, 'ASICS Gel-Game 9', 7899.00, 'images/shoe18.jpg', 'Tennis shoe with improved stability and cushioning', 'Asics'),
(19, 'ASICS Gel-Resolution 8', 8799.00, 'images/shoe19.jpg', 'Durable tennis shoe with exceptional support', 'Asics'),
(20, 'ASICS Gel-Dedicate 7', 9999.00, 'images/shoe20.jpg', 'Tennis shoe with advanced technology for dedicated players', 'Asics');


-- Create table for orders
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    product_price DECIMAL(10, 2),
    product_size VARCHAR(10),
    quantity INT,
    total_price DECIMAL(10, 2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Assuming the orders are made by user_id = 1, with quantities of 1 each.

INSERT INTO Orders (id, user_id, order_date, total, status) VALUES
(1, 1, NOW(), 9999, 'Pending'),  -- Nike Air Jordan 1
(2, 2, NOW(), 10000, 'Pending'), -- NIKE Air Jordan 1 MID SE
(3, 3, NOW(), 9999, 'Pending'),  -- NIKE Air Force 1
(4, 4, NOW(), 5999, 'Pending'),  -- NIKE Court Vision
(5, 5, NOW(), 7999, 'Pending'),  -- NIKE Air Jordan Low Bred
(6, 6, NOW(), 3999, 'Pending'),  -- ADIDAS Grand Court
(7, 7, NOW(), 4599, 'Pending'),  -- ADIDAS Daily 3.0
(8, 8, NOW(), 3599, 'Pending'),  -- ADIDAS Campus OOs
(9, 9, NOW(), 10000, 'Pending'), -- ADIDAS Forum Low CL
(10, 10, NOW(), 8549, 'Pending'),  -- ADIDAS HOOPS 2.0
(11, 11, NOW(), 5999, 'Pending'),  -- PUMA Club 5V5
(12, 12, NOW(), 2999, 'Pending'),  -- PUMA Carina Slim
(13, 13, NOW(), 8999, 'Pending'),  -- PUMA BIktop Rider
(14, 14, NOW(), 6999, 'Pending'),  -- PUMA RBD Game
(15, 15, NOW(), 4999, 'Pending'),  -- PUMA Rebound v6
(16, 16, NOW(), 5599, 'Pending'),  -- ASICS Gel-Game 8
(17, 17, NOW(), 9549, 'Pending'),  -- ASICS Gel-Resolution 9
(18, 18, NOW(), 7899, 'Pending'),  -- ASICS Gel-Game 9
(19, 19, NOW(), 8799, 'Pending'),  -- ASICS Gel-Resolution 8
(20, 20, NOW(), 9999, 'Pending');  -- ASICS Gel-Dedicate 7

-- Create table for admin users
CREATE TABLE adminusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO AdminUsers (id, username, password, email) VALUES
(1, 'admin1', 'password_hash_1', 'admin1@example.com'),
(2, 'admin2', 'password_hash_2', 'admin2@example.com'),


-- Create the cart table
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_size VARCHAR(50) NOT NULL,
    product_quantity INT NOT NULL,
    product_image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

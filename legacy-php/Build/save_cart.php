<?php
// save_cart.php

// Database connection
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "shoesy"; // Replace with your actual database name

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Get POST data
$data = file_get_contents('php://input');
$cartItems = json_decode($data, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['status' => 'error', 'message' => 'Invalid JSON data']);
    exit();
}

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO cart (product_name, product_price, product_size, product_quantity, product_image) VALUES (?, ?, ?, ?, ?)");

if (!$stmt) {
    echo json_encode(['status' => 'error', 'message' => 'Failed to prepare statement']);
    exit();
}

// Loop through each item in the cart and insert into the database
foreach ($cartItems as $item) {
    $product_name = $item['name'];
    $product_price = $item['price'];
    $product_size = $item['size'];
    $product_quantity = $item['quantity'];
    $product_image = $item['image'];

    // Bind parameters
    $stmt->bind_param("sssis", $product_name, $product_price, $product_size, $product_quantity, $product_image);

    // Execute the statement
    if (!$stmt->execute()) {
        echo json_encode(['status' => 'error', 'message' => 'Failed to insert data: ' . $stmt->error]);
        exit();
    }
}

// Close the statement and connection
$stmt->close();
$conn->close();

// Return success response
echo json_encode(['status' => 'success', 'message' => 'Cart data saved successfully']);
?>

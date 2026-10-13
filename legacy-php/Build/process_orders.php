<?php
include 'db_connect.php'; // Include your database connection file

// Initialize response array
$response = array();

// Get data from the AJAX request
$size = $_POST['size'] ?? '';
$quantity = $_POST['quantity'] ?? 0;
$name = $_POST['name'] ?? '';
$price = $_POST['price'] ?? 0;
$image = $_POST['image'] ?? '';
$total_amount = $_POST['total_amount'] ?? '';

// Assuming a customer ID is available (e.g., from a session)
$customer_id = 1; // Replace with actual customer ID
$status = 'Pending'; // Initial status

// Prepare and execute the insert query
$query = "INSERT INTO orders (customer_id, product_name, product_price, quantity, size, total_amount, image, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
$stmt = $conn->prepare($query);

if ($stmt === false) {
    $response['success'] = false;
    $response['error'] = 'Failed to prepare statement: ' . $conn->error;
    echo json_encode($response);
    exit();
}

$stmt->bind_param('isdiisss', $customer_id, $name, $price, $quantity, $size, $total_amount, $image, $status);

if ($stmt->execute()) {
    $response['success'] = true;
} else {
    $response['success'] = false;
    $response['error'] = 'Error executing query: ' . $stmt->error;
}

$stmt->close();
$conn->close();

// Send JSON response
header('Content-Type: application/json');
echo json_encode($response);
?>

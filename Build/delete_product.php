<?php
// Database connection details
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "shoesy";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve product ID from query string
$product_id = intval($_GET['id']);

// Prepare and bind
$stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
$stmt->bind_param("i", $product_id);

// Execute the statement
if ($stmt->execute()) {
    header("Location: admin.php"); // Redirect to admin page after deletion
} else {
    echo "Error: " . $stmt->error;
}

// Close connections
$stmt->close();
$conn->close();
?>

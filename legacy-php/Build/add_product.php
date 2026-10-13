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

// Retrieve POST data
$product_name = $_POST['product-name'];
$product_price = $_POST['product-price'];
$product_image = $_FILES['product-file']['name'];

// Define the upload directory and move the uploaded file
$target_dir = "uploads/";
$target_file = $target_dir . basename($_FILES["product-file"]["name"]);
move_uploaded_file($_FILES["product-file"]["tmp_name"], $target_file);

// Prepare and bind
$stmt = $conn->prepare("INSERT INTO products (name, price, image) VALUES (?, ?, ?)");
$stmt->bind_param("sss", $product_name, $product_price, $product_image);

// Execute the statement
if ($stmt->execute()) {
    header("Location: admin.php"); // Redirect to admin page to show the updated product list
} else {
    echo "Error: " . $stmt->error;
}

// Close connections
$stmt->close();
$conn->close();
?>

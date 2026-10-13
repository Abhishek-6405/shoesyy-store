<?php
// Start the session to access session variables
session_start();

// Database connection
$servername = "localhost";
$username = "root"; // Replace with your database username
$password = ""; // Replace with your database password
$dbname = "shoesy"; // Replace with your database name

// Create a connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Check if user is logged in
if (!isset($_SESSION['username'])) {
    die("User not logged in.");
}

// Check if form is submitted
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $order_date = $_POST['order_date'];
    $status = $_POST['status'];
    $total_price = $_POST['total_price'];
    
    // Get the logged-in user's username
    $customer_name = $_SESSION['username'];

    // Prepare the SQL query to insert order details
    $sql = "INSERT INTO orders (customer_name, order_date, status, total_price) 
            VALUES ('$customer_name', '$order_date', '$status', '$total_price')";

    if ($conn->query($sql) === TRUE) {
        echo "Order placed successfully!";
        // Optionally redirect to a confirmation page
        header("Location: order-confirmation.php");
        exit();
    } else {
        echo "Error: " . $sql . "<br>" . $conn->error;
    }

    // Close the database connection
    $conn->close();
}
?>

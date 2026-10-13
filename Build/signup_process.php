<?php
session_start(); // Start the session

// Database connection
$servername = "localhost";
$username = "root"; // replace with your database username
$password = ""; // replace with your database password
$dbname = "shoesy"; // replace with your database name

$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Retrieve form data
$user = $_POST['username'];
$email = $_POST['email'];
$pass = $_POST['password'];

// Sanitize user input
$user = $conn->real_escape_string($user);
$email = $conn->real_escape_string($email);
$pass = $conn->real_escape_string($pass);

// Hash the password
$hashed_password = password_hash($pass, PASSWORD_DEFAULT);

// Insert user data into the database
$sql = "INSERT INTO users (username, email, password) VALUES ('$user', '$email', '$hashed_password')";
if ($conn->query($sql) === TRUE) {
   // echo "New record created successfully";
   header("Location: login.php");
} else {
    echo "Error: " . $sql . "<br>" . $conn->error;
}

$conn->close();
?>

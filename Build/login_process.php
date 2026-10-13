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
$pass = $_POST['password'];

// Sanitize user input
$user = $conn->real_escape_string($user);
$pass = $conn->real_escape_string($pass);

// Check if user exists and verify password
$sql = "SELECT id, password FROM users WHERE username='$user'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    // User found, now verify the password
    $row = $result->fetch_assoc();
    $stored_hashed_password = $row['password'];

    if (password_verify($pass, $stored_hashed_password)) {
        // Password is correct, log the login attempt
        $user_id = $row['id'];
        $login_sql = "INSERT INTO login_attempts (user_id) VALUES ('$user_id')";
        if ($conn->query($login_sql) === TRUE) {
            // Start a session, store the username, and redirect to the homepage
            $_SESSION['username'] = $user; // Store the username in the session
            header("Location: index.php");
        } else {
            echo "Error logging login attempt: " . $conn->error;
        }
    } else {
        echo "Invalid password.";
    }
} else {
    echo "No such user found.";
}

$conn->close();
?>

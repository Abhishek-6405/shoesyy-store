<?php
// Database connection
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

// Fixed admin username and password
$fixed_username = "admin";
$fixed_password = "admin123"; // Example password

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the form data
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirm_password = $_POST['confirm_password'] ?? '';

    // Check if passwords match
    if ($password !== $confirm_password) {
        die("Passwords do not match.");
    }

    // Verify if the entered username and password match the fixed values
    if ($username === $fixed_username && $password === $fixed_password) {
        // Hash the password
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Prepare and bind
        $stmt = $conn->prepare("INSERT INTO admins (username, password) VALUES (?, ?)");
        
        if (!$stmt) {
            die("Prepare failed: " . $conn->error);
        }

        $stmt->bind_param("ss", $username, $hashed_password);

        if ($stmt->execute()) {
            // Redirect to login page after successful signup
            header("Location: admin_login.php");
            exit();
        } else {
            echo "<script>alert('Error: " . $stmt->error . "'); window.location.href='admin_signup.php';</script>";
        }

        // Close statement
        $stmt->close();
    } else {
        die("Invalid username or password.");
    }
}

// Close connection
$conn->close();
?>

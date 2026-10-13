<?php
session_start();

// Fixed admin username and password
$fixed_username = "admin";
$fixed_password = "admin123"; // Example password

// Check if the form is submitted
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get the form data
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    // Check if entered credentials match the fixed values
    if ($username === $fixed_username && $password === $fixed_password) {
        // Set session to keep track of logged-in admin
        $_SESSION['admin'] = $username;

        // Redirect to the admin page
        header("Location: admin.php");
        exit(); // Exit to ensure no further code runs after redirection
    } else {
        // Display alert if credentials are invalid
        echo "<script>alert('Invalid username or password.'); window.location.href='admin_login.php';</script>";
    }
}
?>

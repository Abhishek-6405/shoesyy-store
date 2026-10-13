<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Signup - SHOESY</title>
    <link rel="stylesheet" href="admin_signup.css">
</head>
<body>
    <div class="admin-container">
        <header class="admin-header">
            <h1>SHOESY Admin Signup</h1>
        </header>
        
        <main class="admin-main">
            <section id="admin-signup">
                <h2>Sign Up</h2>
                <form action="admin_signup_process.php" method="POST">
                    <label for="username">Username:</label>
                    <input type="text" id="username" name="username" required>
                    
                    <label for="password">Password:</label>
                    <input type="password" id="password" name="password" required>
                    
                    <label for="confirm_password">Confirm Password:</label>
                    <input type="password" id="confirm_password" name="confirm_password" required>
                    
                    <button type="submit">Sign Up</button>
                </form>
                <p>Already have an account? <a href="admin_login.php">Login here</a></p>
            </section>
        </main>
        
        <footer class="admin-footer">
            <p>&copy; 2024 SHOESY. All Rights Reserved.</p>
        </footer>
    </div>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        /* Add background image to the entire page */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-image: url('images/background-login.jpg'); /* Replace with the path to your background image */
            background-size: cover; /* Cover the entire viewport */
            background-position: center; /* Center the background image */
            background-repeat: no-repeat; /* Do not repeat the background image */
        }

        /* Ensure that the header is visible above the background */
        header {
            position: relative;
            z-index: 1;
            background-color: rgba(27, 38, 59, 0.8); /* Optional: semi-transparent background for readability */
            padding: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 60px;
        }

        header .logo {
            color: #ffffff;
            font-size: 24px;
            text-align: center;
        }

        header nav ul {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
        }

        header nav li {
            margin: 0 15px;
        }

        header nav a {
            color: #ffffff;
            text-decoration: none;
        }

        /* Add styles for the login page */
        .login-container {
            width: 100%;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: rgba(255, 255, 255, 0.9); /* Optional: semi-transparent background for readability */
        }

        .login-container h2 {
            margin-bottom: 20px;
            text-align: center;
            color: #1b263b; /* Change text color for better contrast */
        }

        .login-container input[type="text"],
        .login-container input[type="password"],
        .login-container input[type="submit"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .login-container input[type="submit"] {
            background-color: #1b263b;
            color: #fff;
            border: none;
            cursor: pointer;
        }

        .login-container input[type="submit"]:hover {
            background-color: #415a77;
        }

        .login-container .message {
            text-align: center;
            margin-top: 20px;
        }

        .login-container .message a {
            color: #1b263b; /* Change text color for better contrast */
            text-decoration: none;
        }

        .login-container .message a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
        <nav>
            <ul>
                <li><a href="index.php">Home</a></li>
                <li><a href="signup.php">Sign Up</a></li>
            </ul>
        </nav>
    </header>

    <div class="login-container">
        <h2>Login</h2>
        <form action="login_process.php" method="post">
            <input type="text" name="username" placeholder="Username" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="submit" value="Login">
        </form>
        <div class="message">
            <p>Don't have an account? <a href="signup.php">Sign up here</a></p>
        </div>
    </div>
</body>
</html>

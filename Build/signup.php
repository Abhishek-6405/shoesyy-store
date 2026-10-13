<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        /* Add background image to the entire page */
        body {
            margin: 0;
            padding: 0;
            font-family: 'Roboto', sans-serif;
            background-image: url('images/background-signup.jpg'); /* Replace with the path to your background image */
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

        /* Add styles for the sign-up page */
        .signup-container {
            width: 100%;
            max-width: 400px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: rgba(255, 255, 255, 0.9); /* Optional: semi-transparent background for readability */
        }

        .signup-container h2 {
            margin-bottom: 20px;
            text-align: center;
            color: #1b263b; /* Change text color for better contrast */
        }

        .signup-container input[type="text"],
        .signup-container input[type="email"],
        .signup-container input[type="password"],
        .signup-container input[type="submit"] {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .signup-container input[type="submit"] {
            background-color: #1b263b;
            color: #fff;
            border: none;
            cursor: pointer;
        }

        .signup-container input[type="submit"]:hover {
            background-color: #415a77;
        }

        .signup-container .message {
            text-align: center;
            margin-top: 20px;
        }

        .signup-container .message a {
            color: #1b263b; /* Change text color for better contrast */
            text-decoration: none;
        }

        .signup-container .message a:hover {
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
                <li><a href="login.php">Login</a></li>
            </ul>
        </nav>
    </header>

    <div class="signup-container">
        <h2>Sign Up</h2>
        <form action="signup_process.php" method="post">
            <input type="text" name="username" placeholder="Username" required>
            <input type="email" name="email" placeholder="Email" required>
            <input type="password" name="password" placeholder="Password" required>
            <input type="submit" value="Sign Up">
        </form>
        <div class="message">
            <p>Already have an account? <a href="login.php">Login here</a></p>
        </div>
    </div>
</body>
</html>
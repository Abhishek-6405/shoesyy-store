<?php
session_start(); // Start the session at the beginning of the file

// Check if the user is logged in
$isLoggedIn = isset($_SESSION['username']);
$username = $isLoggedIn ? $_SESSION['username'] : '';
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SHOESY - Your Favorite Shoe Store</title>
    <link rel="stylesheet" href="style.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
</head>
<body>
<header>
    <div class="logo">
        <h1>SHOESY</h1>
    </div>

    <nav>
        <ul>
            <?php if ($isLoggedIn): ?>
                <li class="welcome-center">Welcome, <?php echo htmlspecialchars($username); ?></li>
            <?php else: ?>
                <li><a href="#home">Home</a></li>
                <li><a href="login.php" class="auth-link">Login</a></li>
                <li><a href="signup.php" class="auth-link">Sign Up</a></li>
            <?php endif; ?>
        </ul>
    </nav>

    <div class="cart-logout">
        <div class="cart-icons">
            <a href="payment.php" class="cart-icon">
                <i class='bx bx-shopping-bag' id="cart-icon" data-quantity="0"></i>
            </a>
            <a href="cart.php" class="cart-icon">
                <i class='bx bx-cart' id="cart-icon" data-quantity="0"></i>
            </a>
            <a href="wishlist.php" class="cart-icon">
                <i class='bx bx-heart' id="cart-icon" data-quantity="0"></i>
            </a>
        </div>

        <?php if ($isLoggedIn): ?>
            <a href="logout.php" class="logout-link">Logout</a>
        <?php endif; ?>
    </div>
</header>






    <section id="home">
        <video class="background-video" autoplay muted loop>
            <source src="videos/background-video.mp4" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        <div class="home-content">
            <h2>Welcome to SHOESY</h2>
            <p>Your one-stop shop for the latest and greatest in shoe fashion.</p>
            <a href="product.php" class="btn">Shop Now</a>
        </div>
    </section>

    <section id="brands">
        <h2>Our Brands</h2>
        <div class="brand-container">
            <div class="brand-item">
                <img src="images/nike.jpg" alt="Nike">
                <div class="brand-description">
                </div>
            </div>
            <div class="brand-item reverse">
                <img src="images/adidas.jpg" alt="Adidas">
                <div class="brand-description">
                </div>
            </div>
            <div class="brand-item">
                <img src="images/puma.jpg" alt="Puma">
                <div class="brand-description">
                    
                </div>
            </div>
            <div class="brand-item reverse">
                <img src="images/asics.jpg" alt="Asics">
                <div class="brand-description">
                </div>
            </div>
        </div>
    </section>

    <!-- Review Section -->
    <section id="reviews">
        <h2>Customer Reviews</h2>
        <div class="review-container">
            <div class="review-item">
                <img src="images/reviewer1.jpg" alt="Reviewer 1" class="reviewer-image">
                <div class="review-content">
                    <h3>Chetan Bhati</h3>
                    <p>"Amazing quality! These shoes are so comfortable and stylish. Will definitely buy again."</p>
                </div>
            </div>
            <div class="review-item">
                <img src="images/reviewer2.jpg" alt="Reviewer 2" class="reviewer-image">
                <div class="review-content">
                    <h3>Gaurav Gauda</h3>
                    <p>"Great selection of brands. I found exactly what I was looking for. Highly recommended!"</p>
                </div>
            </div>
            <div class="review-item">
                <img src="images/reviewer3.jpg" alt="Reviewer 3" class="reviewer-image">
                <div class="review-content">
                    <h3>Shubham Bhandarkar</h3>
                    <p>"Fast delivery and the shoes fit perfectly. Customer service was very helpful."</p>
                </div>
            </div>
            <div class="review-item">
                <img src="images/reviewer4.jpg" alt="Reviewer 4" class="reviewer-image">
                <div class="review-content">
                    <h3>Ved Wadekar</h3>
                    <p>"I love my new sneakers! The design is unique and they are very comfortable for daily wear."</p>
                </div>
            </div>
        </div>
    </section>

    <footer>
        <div class="footer-content">
            <div class="footer-section about">
                <h3>About Us</h3>
                <p>SHOESY offers the latest trends in footwear with an extensive collection of brands and styles. Our mission is to bring style and comfort to our customers with every step.</p>
            </div>
            <div class="footer-section links">
                <h3>Help</h3>
                <ul>
                    <li><a href="faq.php">FAQs</a></li>
                    <li><a href="contact.php">Contact Us</a></li>
                </ul>
            </div>
            <div class="footer-section social-media">
                <h3>Social</h3>
                <div class="social-icons">
                    <a href="#"><i class="fab fa-facebook-f"></i></a>
                    <a href="#"><i class="fab fa-twitter"></i></a>
                    <a href="#"><i class="fab fa-instagram"></i></a>
                    <a href="#"><i class="fab fa-linkedin-in"></i></a>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2024 SHOESY. All rights reserved. | Designed by SHOESY Team</p>
        </div>
    </footer>
    
    <script src="main.js"></script>
</body>
</html>

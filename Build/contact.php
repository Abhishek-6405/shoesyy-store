<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Us - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link href='https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css' rel='stylesheet'/>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        .contact-container {
            width: 90%;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: #f8f9fa;
        }

        .contact-container h2 {
            margin-bottom: 20px;
            color: #1b263b;
            text-align: center;
        }

        .contact-form {
            display: flex;
            flex-wrap: wrap;
            gap: 20px;
        }

        .contact-form input, .contact-form textarea {
            width: 100%;
            padding: 10px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .contact-form input[type="submit"] {
            background-color: #1b263b;
            color: #fff;
            border: none;
            cursor: pointer;
            width: auto;
            align-self: center;
        }

        .contact-form input[type="submit"]:hover {
            background-color: #415a77;
        }

        .contact-info {
            margin-top: 30px;
            text-align: center;
        }

        .contact-info p {
            color: #1b263b;
            margin: 10px 0;
        }

        .contact-info a {
            color: #1b263b;
            text-decoration: none;
        }

        .contact-info a:hover {
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
    </header>

    <div class="contact-container">
        <h2>Contact Us</h2>
        <form class="contact-form">
            <input type="text" name="name" placeholder="Your Name" required>
            <input type="email" name="email" placeholder="Your Email" required>
            <textarea name="message" rows="5" placeholder="Your Message" required></textarea>
            <input type="submit" value="Send Message">
        </form>

        <div class="contact-info">
            <p>Email: <a href="mailto:info@shoesy.com">info@shoesy.com</a></p>
            <p>Phone: <a href="tel:1234567890">123-456-7890</a></p>
            <p>Address: 123 Shoe Street, Footwear City, FS 56789</p>
        </div>
    </div>

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
    
</body>
</html>

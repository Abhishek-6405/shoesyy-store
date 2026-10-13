<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FAQs - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .faq-container {
            width: 90%;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            background-color: #f9f9f9;
        }

        .faq-container h2 {
            margin-bottom: 20px;
            color: #1b263b;
        }

        .faq-item {
            margin-bottom: 15px;
        }

        .faq-item h3 {
            cursor: pointer;
            color: #1b263b;
            margin-bottom: 5px;
        }

        .faq-item p {
            display: none;
            color: #415a77;
            padding-left: 20px;
        }

        .faq-item h3:hover {
            color: #415a77;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
    </header>

    <div class="faq-container">
        <h2>Frequently Asked Questions</h2>

        <div class="faq-item">
            <h3>1. What is SHOESY?</h3>
            <p>SHOESY is an online store offering a wide range of shoes from top brands.</p>
        </div>

        <div class="faq-item">
            <h3>2. How do I place an order?</h3>
            <p>Select the product you like, choose the size, and click 'Buy Now'. Follow the prompts to complete the purchase.</p>
        </div>

        <div class="faq-item">
            <h3>3. What payment methods do you accept?</h3>
            <p>We accept Cash on Delivery and Online Payments.</p>
        </div>

        <div class="faq-item">
            <h3>4. How can I track my order?</h3>
            <p>You can track your order status in the 'My Orders' section of your account.</p>
        </div>

        <div class="faq-item">
            <h3>5. Can I return or exchange a product?</h3>
            <p>Yes, we have a return/exchange policy within 30 days of purchase.</p>
        </div>

        <div class="faq-item">
            <h3>6. How do I contact customer service?</h3>
            <p>You can contact our customer service through the 'Contact Us' page or call us at the provided number.</p>
        </div>

        <div class="faq-item">
            <h3>7. Are there any shipping charges?</h3>
            <p>Shipping is free for all orders above $50. For orders below $50, a standard shipping charge applies.</p>
        </div>

        <div class="faq-item">
            <h3>8. Do you ship internationally?</h3>
            <p>Currently, we only ship within the country.</p>
        </div>

        <div class="faq-item">
            <h3>9. How do I cancel an order?</h3>
            <p>You can cancel an order before it is shipped by going to the 'My Orders' section.</p>
        </div>

        <div class="faq-item">
            <h3>10. What if I receive a defective product?</h3>
            <p>If you receive a defective product, please contact our customer service immediately for a replacement or refund.</p>
        </div>
    </div>

    <script>
        // Toggle the visibility of FAQ answers
        document.querySelectorAll('.faq-item h3').forEach((item) => {
            item.addEventListener('click', () => {
                const answer = item.nextElementSibling;
                answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
            });
        });
    </script>
</body>
</html>

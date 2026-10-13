<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product Details - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="product.html">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        .product-detail {
            padding: 20px;
            max-width: 800px;
            margin: auto;
        }

        .product-detail img {
            width: 100%;
            height: auto;
        }

        .product-info {
            margin-top: 20px;
        }

        .product-info h3 {
            color: #1b263b;
        }

        .product-info p {
            color: #1b263b;
        }

        .product-info select, .product-info input {
            margin: 10px 0;
            padding: 10px;
            width: 100%;
            max-width: 200px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .product-info button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin: 5px;
        }

        .product-info button:hover {
            background-color: #415a77;
        }

        .reviews {
            margin-top: 20px;
        }

        .review {
            border-bottom: 1px solid #ddd;
            padding: 10px 0;
        }

        .review h4 {
            color: #1b263b;
            margin-bottom: 5px;
        }

        .review p {
            color: #1b263b;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
    </header>

    <main class="product-detail">
        <img id="productImage" src="images/shoe1.jpg" alt="Product Image">
        <div class="product-info">
            <h3 id="productName">Brand A</h3>
            <p id="productPrice">$99.99</p>
            <label for="size">Size:</label>
            <select id="size">
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
            </select>
            <label for="quantity">Quantity:</label>
            <input type="number" id="quantity" value="1" min="1">
            <button onclick="buyNow()">Buy Now</button>
            <button onclick="addToCart()">Add to Cart</button>
        </div>
        <div class="reviews">
            <h3>Reviews</h3>
            <div id="reviewsContainer">
                <!-- Reviews will be dynamically inserted here -->
            </div>
        </div>
    </main>

    <script>
        // Dummy product data
        const products = {
            1: {
                name: "Brand A",
                price: 99.99,
                image: "images/shoe1.jpg",
                reviews: [
                    { reviewer: "John Doe", comment: "Great shoes! Very comfortable and stylish." },
                    { reviewer: "Jane Smith", comment: "Good quality, but runs a bit small." }
                ]
            },
            // Add more products with reviews here
        };

        // Function to get URL parameter
        function getParameterByName(name) {
            const url = new URL(window.location.href);
            return url.searchParams.get(name);
        }

        // Load product details and reviews based on ID
        document.addEventListener("DOMContentLoaded", () => {
            const productId = getParameterByName('id');
            const product = products[productId];

            if (product) {
                document.getElementById('productImage').src = product.image;
                document.getElementById('productName').textContent = product.name;
                document.getElementById('productPrice').textContent = `$${product.price}`;

                const reviewsContainer = document.getElementById('reviewsContainer');
                product.reviews.forEach(review => {
                    const reviewDiv = document.createElement('div');
                    reviewDiv.classList.add('review');
                    reviewDiv.innerHTML = `<h4>${review.reviewer}</h4><p>${review.comment}</p>`;
                    reviewsContainer.appendChild(reviewDiv);
                });
            } else {
                alert('Product not found');
            }
        });

        function buyNow() {
            const productId = getParameterByName('id');
            const product = products[productId];

            const size = document.getElementById('size').value;
            const quantity = document.getElementById('quantity').value;

            if (product) {
                window.location.href = `payment.html?productId=${productId}&name=${encodeURIComponent(product.name)}&price=${product.price}&size=${size}&quantity=${quantity}`;
            } else {
                alert('Product not found');
            }
        }

        function addToCart() {
            alert('Added to cart!');
        }
    </script>
</body>
</html>

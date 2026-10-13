<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Product List - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        /* Add your styles here */

        .product-list {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            padding: 20px;
        }

        .product {
            width: 200px;
            margin: 15px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
            background-color: #1b263b;
        }

        .product img {
            width: 100%;
            height: auto;
            border-bottom: 1px solid #ddd;
            margin-bottom: 15px;
        }

        .product h3, .product p {
            margin: 10px 0;
            color: #e0e1dd;
        }

        .product button {
            background-color: #415a77;
            color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin: 5px;
        }

        .product button:hover {
            background-color: #1b263b;
        }

        .wishlist i, .add-to-cart i {
            margin-right: 5px;
        }

        .product-detail {
            padding: 20px;
            max-width: 800px;
            margin: auto;
            background-color: #1b263b;
            color: #e0e1dd;
        }

        .product-detail img {
            width: 100%;
            height: auto;
        }

        .product-info {
            margin-top: 20px;
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
            background-color: #415a77;
            color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin: 5px;
        }

        .product-info button:hover {
            background-color: #1b263b;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
    </header>

    <div class="product-list" id="product-list">
        <?php
            include 'db_connect.php'; // Include your database connection file

            // Fetch products from the database
            $query = "SELECT * FROM products";
            $result = mysqli_query($conn, $query);

            if ($result) {
                while($row = mysqli_fetch_assoc($result)) {
                    // Sanitize data to avoid issues
                    $productId = htmlspecialchars($row['id']);
                    $productName = htmlspecialchars($row['name']);
                    $productPrice = htmlspecialchars($row['price']);
                    $productImage = htmlspecialchars($row['image']);

                    // Ensure the image path is correct
                    // Assuming images are stored in the 'uploads' folder in the root directory
                    $imageUrl = 'uploads/' . $productImage;

                    // Check if image exists (optional, for debugging)
                    if (!file_exists($imageUrl)) {
                        $imageUrl = 'uploads/default-image.jpg'; // Fallback image if the specified image is not found
                    }

                    echo "
                    <div class='product' data-id='$productId' data-name='$productName' data-price='$productPrice'>
                        <img src='$imageUrl' alt='$productName'>
                        <h3>$productName</h3>
                        <p>₹$productPrice</p>
                        <button class='wishlist' onclick='addToWishlist(this)'><i class='far fa-heart'></i></button>
                        <button class='add-to-cart' onclick='viewDetails(this)'><i class='fas fa-shopping-cart'></i></button>
                    </div>";
                }
            } else {
                echo "Error fetching products: " . mysqli_error($conn);
            }

            mysqli_close($conn);
        ?>
    </div>

    <div class="product-detail" id="product-detail" style="display: none;">
        <img id="product-image" src="" alt="Product Image">
        <div class="product-info">
            <h3 id="product-name"></h3>
            <p id="product-price"></p>
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
    </div>




            

    <script>
        function addToWishlist(button) {
            const product = button.closest('.product');
            const id = product.dataset.id;
            const name = product.dataset.name;
            const price = product.dataset.price;
            const imageSrc = product.querySelector('img').src;

            const wishlistItem = {
                id: id,
                name: name,
                price: parseFloat(price),
                image: imageSrc
            };

            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            wishlist.push(wishlistItem);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));

            window.location.href = 'wishlist.php';
        }

        function viewDetails(button) {
            const product = button.closest('.product');
            const id = product.dataset.id;
            const name = product.dataset.name;
            const price = product.dataset.price;
            const imageSrc = product.querySelector('img').src;

            document.getElementById('product-list').style.display = 'none';
            document.getElementById('product-detail').style.display = 'block';

            document.getElementById('product-image').src = imageSrc;
            document.getElementById('product-name').textContent = name;
            document.getElementById('product-price').textContent = `₹${price}`;

        }

        function buyNow() {
        const size = document.getElementById('size').value;
        const quantity = document.getElementById('quantity').value;

        const product = {
            name: document.getElementById('product-name').textContent,
            price: parseFloat(document.getElementById('product-price').textContent.replace('₹', '')),
            size: size,
            quantity: quantity,
            image: document.getElementById('product-image').src
        };

        let cart = JSON.parse(localStorage.getItem('cartItems')) || [];
        cart.push(product);
        localStorage.setItem('cartItems', JSON.stringify(cart));
        window.location.href = `payment.php`;
    }
        function addToCart() {
            const size = document.getElementById('size').value;
            const quantity = document.getElementById('quantity').value;
            const name = document.getElementById('product-name').textContent;
            const price = parseFloat(document.getElementById('product-price').textContent.replace('₹', ''));
            const image = document.getElementById('product-image').src;

            const cartItem = {
                name: name,
                price: price,
                quantity: quantity,
                size: size,
                image: image
            };

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.push(cartItem);
            localStorage.setItem('cart', JSON.stringify(cart));

            window.location.href = 'cart.php';
        }
    </script>
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wishlist - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        .wishlist {
            padding: 20px;
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
        }

        .wishlist-item {
            width: 200px;
            margin: 15px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            text-align: center;
        }

        .wishlist-item img {
            width: 100%;
            height: auto;
            border-bottom: 1px solid #ddd;
            margin-bottom: 15px;
        }

        .wishlist-item h3, .wishlist-item p {
            color: #ffffff;
        }

        .wishlist-item button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin: 5px;
        }

        .wishlist-item button:hover {
            background-color: #415a77;
        }
    </style>
</head>
<body>
    <header>
        <div class="logo">
            <h1>SHOESY</h1>
        </div>
    </header>

    <div class="wishlist" id="wishlist">
        <!-- Wishlist items will be populated here -->
    </div>

    <script>
        function displayWishlist() {
            const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            const wishlistContainer = document.getElementById('wishlist');

            if (wishlist.length === 0) {
                wishlistContainer.innerHTML = '<p>Your wishlist is empty.</p>';
                return;
            }

            wishlist.forEach(product => {
                const itemDiv = document.createElement('div');
                itemDiv.className = 'wishlist-item';
                
                itemDiv.innerHTML = `
                    <img src="${product.image}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p>₹${product.price.toFixed(2)}</p>
                    <button onclick="removeFromWishlist('${product.name}')">Remove</button>
                `;
                
                wishlistContainer.appendChild(itemDiv);
            });
        }

        function removeFromWishlist(productName) {
            let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
            wishlist = wishlist.filter(item => item.name !== productName);
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
            window.location.reload(); // Reload to update the wishlist view
        }

        document.addEventListener('DOMContentLoaded', displayWishlist);
    </script>
</body>
</html>

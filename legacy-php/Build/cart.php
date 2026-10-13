<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cart - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        .cart {
            padding: 20px;
            max-width: 800px;
            margin: auto;
        }

        .cart h2 {
            color: #ffffff;
            margin-bottom: 20px;
        }

        .cart-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #ddd;
        }

        .cart-item img {
            width: 100px;
            height: auto;
        }

        .cart-item-details {
            flex: 1;
            margin-left: 20px;
        }

        .cart-item-details h3, .cart-item-details p {
            color: #ffffff;
            margin: 5px 0;
        }

        .cart-total {
            text-align: right;
            margin-top: 20px;
            color: #ffffff;
        }

        .checkout-button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin-top: 20px;
            text-align: center;
        }

        .checkout-button:hover {
            background-color: #415a77;
        }

        .quantity-control {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .quantity-control button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 5px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
        }

        .quantity-control button:hover {
            background-color: #415a77;
        }

        .remove-item {
            color: #e63946;
            cursor: pointer;
            margin-left: 10px;
        }

        .remove-item:hover {
            color: #e63946;
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

    <main class="cart">
        <h2>Shopping Cart</h2>
        <div id="cart-items">
            <!-- Cart items will be injected here by JavaScript -->
        </div>
        <div class="cart-total">
            <h3 id="total-amount">Total: ₹0.00</h3>
        </div>
        <button class="checkout-button" onclick="proceedToCheckout()">Proceed to Checkout</button>
    </main>

    <script>
        function loadCart() {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            const cartItemsContainer = document.getElementById('cart-items');
            const totalAmountElement = document.getElementById('total-amount');
            let total = 0;

            cartItemsContainer.innerHTML = ''; // Clear existing items

            cart.forEach((item, index) => {
                const cartItem = document.createElement('div');
                cartItem.className = 'cart-item';
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h3>${item.name}</h3>
                        <p>Size: ${item.size}</p>
                        <div class="quantity-control">
                            <button onclick="decreaseQuantity(${index})">-</button>
                            <p>Quantity: ${item.quantity}</p>
                            <button onclick="increaseQuantity(${index})">+</button>
                        </div>
                        <span class="remove-item" onclick="removeItem(${index})">Remove</span>
                    </div>
                    <p>₹${(item.price * item.quantity).toFixed(2)}</p>
                `;
                cartItemsContainer.appendChild(cartItem);
                total += item.price * item.quantity;
            });

            totalAmountElement.textContent = `Total: ₹${total.toFixed(2)}`;
        }

        function updateCart(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
            loadCart();
        }

        function increaseQuantity(index) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart[index].quantity += 1;
            updateCart(cart);
        }

        function decreaseQuantity(index) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                updateCart(cart);
            } else {
                removeItem(index);
            }
        }

        function removeItem(index) {
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.splice(index, 1);
            updateCart(cart);
        }

        function proceedToCheckout() {
            const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
            window.location.href = 'payment.php';


    // Send the cart data to the server
    fetch('save_cart.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartItems)
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            window.location.href = 'payment.php';
        } else {
            alert(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

        }

        

        // Load cart items when the page loads
        window.onload = loadCart;
    </script>
</body>
</html>

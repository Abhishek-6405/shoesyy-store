<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <style>
        .confirmation-container {
            width: 90%;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            text-align: center;
            background-color: #f7f7f7;
        }

        .confirmation-container h2 {
            color: #1b263b;
            margin-bottom: 20px;
        }

        .order-details {
            margin: 20px 0;
            text-align: left;
        }

        .order-details table {
            width: 100%;
            border-collapse: collapse;
        }

        .order-details th, .order-details td {
            border: 1px solid #1b263b;
            padding: 10px;
            text-align: center;
        }

        .order-details th {
            background-color: #1b263b;
            color: #e0e1dd;
        }

        .home-button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
            margin-top: 20px;
        }

        .home-button:hover {
            background-color: #415a77;
        }
    </style>
</head>
<body>
    <div class="confirmation-container">
        <h2>Your Order is Confirmed!</h2>
        <div class="order-details">
            <h3>Order Details:</h3>
            <table>
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody id="order-details-body">
                    <!-- Order details will be dynamically inserted here -->
                </tbody>
            </table>
        </div>
        <button class="home-button" onclick="goHome()">Back to Home</button>
    </div>

    <script>
        // Load order details from localStorage and display them
        window.onload = function() {
            const cartItems = JSON.parse(localStorage.getItem('cartItems'));
            if (!cartItems) {
                alert('No order details available.');
                return;
            }

            const orderDetailsBody = document.getElementById('order-details-body');
            let total = 0;

            cartItems.forEach(item => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                `;
                orderDetailsBody.appendChild(row);
                total += item.price * item.quantity;
            });

            const totalRow = document.createElement('tr');
            totalRow.innerHTML = `
                <td colspan="3"><strong>Total</strong></td>
                <td><strong>₹${total.toFixed(2)}</strong></td>
            `;
            orderDetailsBody.appendChild(totalRow);

            // Clear cart after confirming the order
            localStorage.removeItem('cartItems');
        };

        function goHome() {
            window.location.href = 'index.php';
        }
    </script>
</body>
</html>

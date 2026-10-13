<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Details - SHOESY</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
    <style>
        .payment-container {
            width: 90%;
            max-width: 1000px;
            margin: 50px auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .payment-container h2 {
            margin-bottom: 20px;
            color: #ffffff;
        }

        .cart-items {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .cart-items th, .cart-items td {
            border: 1px solid #1b263b;
            padding: 10px;
            text-align: center;
        }

        .cart-items th {
            background-color: #1b263b;
            color: #e0e1dd;
        }

        .cart-items input[type="number"] {
            width: 50px;
            text-align: center;
        }

        .total-price {
            font-size: 18px;
            margin-bottom: 20px;
        }

        .payment-methods {
            margin-bottom: 20px;
        }

        .payment-methods label {
            display: block;
            margin: 10px 0;
        }

        .bank-details {
            display: none;
            margin-bottom: 20px;
        }

        .bank-details input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .address-section {
            margin-bottom: 20px;
        }

        .address-section input, .address-section textarea {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
        }

        .checkout-button {
            background-color: #1b263b;
            color: #fff;
            border: none;
            padding: 10px 20px;
            cursor: pointer;
            font-size: 16px;
            border-radius: 4px;
        }

        .checkout-button:hover {
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

    <div class="payment-container">
        <h2>Payment Details</h2>
        <table class="cart-items">
            <thead>
                <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                    <th>Action</th> <!-- New column for Remove button -->
                </tr>
            </thead>
            
            <tbody id="cart-items-body">
                <!-- Cart items will be dynamically inserted here -->
            </tbody>
        </table>
        <div class="total-price" id="total-price">Total Price: ₹0.00</div>
        
        <div class="address-section">
            <h3>Shipping Address</h3>
            <input type="text" id="customer_name" name="customer_name" placeholder="Full Name" required>
            <input type="text" placeholder="Phone Number" required>
            <textarea placeholder="Address" rows="4" required></textarea>
            <input type="text" placeholder="City" required>
            <input type="text" placeholder="State" required>
            <input type="text" placeholder="Postal Code" required>
            <input type="text" placeholder="Country" required>
        </div>

        <div class="payment-methods">
            <label><input type="radio" name="payment-method" value="cash" checked> Cash on Delivery</label>
            <label><input type="radio" name="payment-method" value="online"> Online Payment</label>
        </div>
        
        <div class="bank-details" id="bank-details">
            <h3>Enter Bank Details</h3>
            <input type="text" placeholder="Account Number" required>
            <input type="text" placeholder="Account Name" required>
            <input type="text" placeholder="Bank Name" required>
            <input type="text" placeholder="IFSC Code" required>
        </div>
        
        <form method="POST" action="add_order.php" onsubmit="return validateForm();">
    <input type="hidden" id="order_date" name="order_date">
    <input type="hidden" id="total_price_input" name="total_price">
    <input type="hidden" id="status" name="status" value="Pending">

    <input type="submit" class="checkout-button" value="Place Order">
</form>

    </div>

    <script>
window.onload = function() {
    loadCartItems();
    setOrderDate(); // Set order date when the page loads
    
    // Add event listeners to payment method radio buttons
    const paymentMethods = document.querySelectorAll('input[name="payment-method"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', toggleBankDetails);
    });
};
        
        function loadCartItems() {
            const cartItems = JSON.parse(localStorage.getItem('cartItems'));
            if (!cartItems) {
                alert('Your cart is empty!');
                return;
            }
        
            const cartItemsBody = document.getElementById('cart-items-body');
            cartItemsBody.innerHTML = ''; // Clear existing items
            let total = 0;
        
            cartItems.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td class="item-total">₹${(item.price * item.quantity).toFixed(2)}</td>
                    <td><button onclick="removeItem(${index})">Remove</button></td> <!-- Remove button -->
                `;
                cartItemsBody.appendChild(row);
                total += item.price * item.quantity;
            });
        
            document.getElementById('total-price').textContent = `Total Price: ₹${total.toFixed(2)}`;
            document.getElementById('total_price_input').value = total.toFixed(2);
        }
        
        function removeItem(index) {
            let cartItems = JSON.parse(localStorage.getItem('cartItems'));
        
            // Remove the item from the cart array
            cartItems.splice(index, 1);
        
            // Update localStorage with the new cart array
            localStorage.setItem('cartItems', JSON.stringify(cartItems));
        
            // Reload the cart items to update the table
            loadCartItems();
        
            // If the cart is empty, show an alert and reset the page
            if (cartItems.length === 0) {
                alert('Your cart is now empty.');
                localStorage.removeItem('cartItems'); // Clear cart from localStorage
                window.location.href = 'index.php'; // Redirect to home page or other page
            }
        }
        
        // Function to show or hide bank details
        function toggleBankDetails() {
            const bankDetails = document.getElementById('bank-details');
            if (document.querySelector('input[name="payment-method"]:checked').value === 'online') {
                bankDetails.style.display = 'block';
            } else {
                bankDetails.style.display = 'none';
            }
        }

        // Function to set the order date automatically
        function setOrderDate() {
    const now = new Date();
    const formattedDate = now.toISOString().slice(0, 19).replace('T', ' '); // Format as "YYYY-MM-DD HH:MM:SS"
    document.getElementById('order_date').value = formattedDate;
}

function validateForm() {
    // Get all the required fields
    const customerName = document.getElementById('customer_name').value;
    const phoneNumber = document.querySelector('input[placeholder="Phone Number"]').value;
    const address = document.querySelector('textarea[placeholder="Address"]').value;
    const city = document.querySelector('input[placeholder="City"]').value;
    const state = document.querySelector('input[placeholder="State"]').value;
    const postalCode = document.querySelector('input[placeholder="Postal Code"]').value;
    const country = document.querySelector('input[placeholder="Country"]').value;

    // Check if any of the required fields are empty
    if (!customerName || !phoneNumber || !address || !city || !state || !postalCode || !country) {
        alert('Please fill out all required fields.');
        return false; // Prevent form submission
    }

    // Check if a payment method is selected
    const paymentMethodSelected = document.querySelector('input[name="payment-method"]:checked');
    if (!paymentMethodSelected) {
        alert('Please select a payment method.');
        return false; // Prevent form submission
    }

    // If all checks pass, allow form submission
    return true;
}

    </script>
        
</body>
</html>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Manage Products - SHOESY</title>
    <link rel="stylesheet" href="manage_products.css">
</head>
<body>
    <div class="manage-products-container">
        <header class="manage-products-header">
            <h1>Manage Products - SHOESY</h1>
            <nav class="manage-products-nav">
                <a href="admin.php">Admin Dashboard</a>
                <a href="#manage-products">Manage Products</a>
                <a href="admin_login.php" class="logout">Logout</a>
            </nav>
        </header>
        
        <main class="manage-products-main">
            <section id="manage-products" class="manage-products-section">
                <h2>Manage Products</h2>
                <button onclick="openAddProductForm()" class="btn-add-product">Add New Product</button>
                <table class="manage-products-table" id="product-table">
                    <thead>
                        <tr>
                            <th>Product Name</th>
                            <th>Price</th>
                            <th>Image</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php
                        include 'db_connect.php'; // Include your database connection file

                        // Fetch products from the database
                        $sql = "SELECT id, name, price, image FROM products";
                        $result = mysqli_query($conn, $sql);

                        if ($result->num_rows > 0) {
                            // Output data of each row
                            while ($row = mysqli_fetch_assoc($result)) {
                                echo "<tr>";
                                echo "<td>" . htmlspecialchars($row["name"]) . "</td>";
                                echo "<td>₹" . htmlspecialchars($row["price"]) . "</td>";
                                echo "<td><img src='uploads/" . htmlspecialchars($row["image"]) . "' alt='Product Image' style='width:50px;height:50px;'></td>";
                                echo "<td><button onclick='editProduct(" . $row["id"] . ")'>Edit</button></td>";
                                echo "<td><button onclick='deleteProduct(" . $row["id"] . ")'>Delete</button></td>";
                                echo "</tr>";
                            }
                        } else {
                            echo "<tr><td colspan='5'>No products available</td></tr>";
                        }

                        mysqli_close($conn);
                        ?>
                    </tbody>
                </table>
            </section>

            <section id="add-product-form" style="display:none;">
                <h3>Add New Product</h3>
                <form id="product-form" action="add_product.php" method="post" enctype="multipart/form-data">
                    <label for="product-name">Product Name:</label>
                    <input type="text" id="product-name" name="product-name" required>
                    
                    <label for="product-price">Price:</label>
                    <input type="number" id="product-price" name="product-price" required>
                    
                    <label for="product-file">Choose File:</label>
                    <input type="file" id="product-file" name="product-file" required>
                    
                    <button type="button" class="btn-add" onclick="submitProductForm()">Add Product</button>
                    <button type="button" class="btn-cancel" onclick="closeAddProductForm()">Cancel</button>
                </form>
            </section>
        </main>
        
        <footer class="manage-products-footer">
            <p>&copy; 2024 SHOESY. All Rights Reserved.</p>
        </footer>
    </div>

    <script>
        function openAddProductForm() {
            document.getElementById('add-product-form').style.display = 'block';
        }

        function closeAddProductForm() {
            document.getElementById('add-product-form').style.display = 'none';
        }

        function editProduct(productId) {
            // Implement the function to edit the product
            alert('Edit product with ID: ' + productId);
        }

        function deleteProduct(productId) {
            if (confirm('Are you sure you want to delete this product?')) {
                window.location.href = 'delete_product.php?id=' + productId;
            }
        }

        function submitProductForm() {
            document.getElementById('product-form').submit();
        }
    </script>
</body>
</html>

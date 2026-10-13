<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard - SHOESY</title>
    <link rel="stylesheet" href="admin.css">
</head>
<body>
    <div class="admin-container">
        <header class="admin-header">
            <h1>SHOESY Admin Dashboard</h1>
            <nav class="admin-nav">
    <a href="index.php">Home</a>
    <a href="#dashboard">Dashboard</a>
    <a href="manage_products.php">Manage Products</a> <!-- Updated Link -->
    <a href="#orders">View Orders</a>
    <a href="#customers">Customers</a>
    <a href="#reports">Reports</a>
    <a href="#settings">Settings</a>
    <a href="admin_login.php" class="logout">Logout</a>
</nav>

        </header>
        
        <main class="admin-main">
        <section id="dashboard" class="admin-section">
        <h2>Dashboard</h2>
<div class="stats">
    <div class="stat">
        <h3>Total Sales</h3>
        <p>
            <?php
                include 'db_connect.php'; // Include your database connection file

                // Fetch total sales
                $query = "SELECT SUM(total_price) AS total_sales FROM orders";
                $result = mysqli_query($conn, $query);

                if ($result) {
                    $row = mysqli_fetch_assoc($result);
                    $totalSales = $row['total_sales'] ? '₹' . number_format($row['total_sales'], 2) : '₹0';
                    echo $totalSales;
                } else {
                    echo "Error fetching total sales: " . mysqli_error($conn);
                }

                mysqli_close($conn);
            ?>
        </p>
    </div>
    <div class="stat">
        <h3>Orders</h3>
        <p>
            <?php
                include 'db_connect.php'; // Include your database connection file

                // Fetch total orders
                $query = "SELECT COUNT(*) AS total_orders FROM orders";
                $result = mysqli_query($conn, $query);

                if ($result) {
                    $row = mysqli_fetch_assoc($result);
                    $totalOrders = $row['total_orders'];
                    echo $totalOrders;
                } else {
                    echo "Error fetching total orders: " . mysqli_error($conn);
                }

                mysqli_close($conn);
            ?>
        </p>
    </div>
    <div class="stat">
        <h3>Customers</h3>
        <p>
            <?php
                include 'db_connect.php'; // Include your database connection file

                // Fetch total customers
                $query = "SELECT COUNT(*) AS total_customers FROM users";
                $result = mysqli_query($conn, $query);

                if ($result) {
                    $row = mysqli_fetch_assoc($result);
                    $totalCustomers = $row['total_customers'];
                    echo $totalCustomers;
                } else {
                    echo "Error fetching total customers: " . mysqli_error($conn);
                }

                mysqli_close($conn);
            ?>
        </p>
    </div>
    <div class="stat">
            <h3>Products</h3>
            <p>
                <?php
                    include 'db_connect.php'; // Include your database connection file

                    // Fetch total products
                    $query = "SELECT COUNT(*) AS total_products FROM products";
                    $result = mysqli_query($conn, $query);

                    if ($result) {
                        $row = mysqli_fetch_assoc($result);
                        $totalProducts = $row['total_products'];
                        echo $totalProducts;
                    } else {
                        echo "Error fetching total products: " . mysqli_error($conn);
                    }

                    mysqli_close($conn);
                ?>
            </p>
        </div>
</div>
</section>

        </main>
        
        <section id="orders" class="admin-section">
    <h2>View Orders</h2>

    <?php
    // Database connection details
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "shoesy";

    // Create connection
    $conn = new mysqli($servername, $username, $password, $dbname);

    // Check connection
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    }

    // Fetch orders from the database
    $sql = "SELECT customer_name, order_date, status, total_price FROM orders";
    $result = $conn->query($sql);

    // Check if the query was successful
    if ($result === false) {
        echo "<p>Error fetching orders: " . $conn->error . "</p>";
    } else {
    ?>

    <section class="admin-orders">
        <h2>Order List</h2>
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Customer Name</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                </tr>
            </thead>
            <tbody>
                <?php
                if ($result->num_rows > 0) {
                    // Output data of each row
                    while ($row = $result->fetch_assoc()) {
                        echo "<tr>";
                        echo "<td>" . htmlspecialchars($row["customer_name"]) . "</td>";
                        echo "<td>" . htmlspecialchars(date('Y-m-d H:i:s', strtotime($row["order_date"]))) . "</td>";
                        echo "<td>" . htmlspecialchars($row["status"]) . "</td>";
                        echo "<td>₹" . htmlspecialchars(number_format($row["total_price"], 2)) . "</td>";
                        echo "</tr>";
                    }
                } else {
                    echo "<tr><td colspan='4'>No orders found</td></tr>";
                }
                ?>
            </tbody>
        </table>
    </section>

    <?php
    }
    $conn->close();
    ?>
</section>

        
        <section id="customers" class="admin-section">
    <h2>Customers</h2>
    <table class="admin-table">
        <thead>
            <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Email</th>
            </tr>
        </thead>
        <tbody>
            <?php
                include 'db_connect.php'; // Include your database connection file

                // Fetch customers from the database
                $query = "SELECT id, username AS name, email FROM users";
                $result = mysqli_query($conn, $query);

                if ($result) {
                    while ($row = mysqli_fetch_assoc($result)) {
                        // Sanitize data to avoid issues
                        $customerId = htmlspecialchars($row['id']);
                        $customerName = htmlspecialchars($row['name']);
                        $customerEmail = htmlspecialchars($row['email']);

                        echo "
                        <tr>
                            <td>$customerId</td>
                            <td>$customerName</td>
                            <td>$customerEmail</td>
                        </tr>";
                    }
                } else {
                    echo "<tr><td colspan='3'>Error fetching customers: " . mysqli_error($conn) . "</td></tr>";
                }

                mysqli_close($conn);
            ?>
        </tbody>
    </table>
</section>
    
    <footer class="admin-footer">
        <p>&copy; 2024 SHOESY. All Rights Reserved.</p>
    </footer>
</div>



</body>
</html>

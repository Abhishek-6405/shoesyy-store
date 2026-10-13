# SHOESY Store: PHP to Next.js Migration Plan & Codebase Audit

**Date:** October 13, 2026  
**Status:** Step 0 Audit Complete — Awaiting Client Approval  
**Source Stack:** PHP (Vanilla), MySQL (mysqli), jQuery / Vanilla JS, CSS3  
**Target Stack:** Next.js 14+ (App Router), React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Zustand, Prisma ORM, Neon PostgreSQL, NextAuth.js (Auth.js), Razorpay (Test Mode) + COD  

---

## 1. Executive Summary & Repository Assessment

The current repository represents a prototype e-commerce shoe store (`SHOESY`) built with procedural PHP and MySQL (`mysqli`). The application contains fundamental building blocks for an online footwear store, including a landing page with video background, product catalog with inline detail views, local-storage cart and wishlist, checkout with payment method selection, customer auth, and an admin dashboard with inventory and order tracking.

However, the existing codebase displays significant architectural fragmentation, incomplete feature implementations, schema drift between the SQL dump and PHP queries, and critical security vulnerabilities (including unrestricted file upload, unauthenticated admin dashboards, raw SQL string concatenation, and hardcoded administrative credentials).

This document serves as the exhaustive audit of the existing repository and establishes the comprehensive migration plan into a production-grade, Vercel-ready Next.js web application.

---

## 2. Inventory of PHP Pages / Routes & Functional Analysis

### 2.1 Storefront Routes

| Page / File | Method / Type | Functional Purpose | Current Implementation & Deficiencies |
| :--- | :--- | :--- | :--- |
| `index.php` | GET / View | Storefront Homepage | Features a background looping video (`videos/background-video.mp4`), brand showcase grid (Nike, Adidas, Puma, Asics), customer testimonials/reviews, and sticky navigation bar with session-dependent greeting (`$_SESSION['username']`), cart, and wishlist links. |
| `product.php` | GET / View & Action | Product Catalog & Dynamic Quick View | Queries `SELECT * FROM products` via `mysqli`. Renders product cards (image, name, price) with "Add to Wishlist" and "View Details". Toggles an inline detail view (`#product-detail`) using vanilla JavaScript without a page reload. Manipulates browser `localStorage` (`cart`, `cartItems`, `wishlist`). |
| `product-details.php` | GET / View | Standalone Product Detail Page (Mock) | Contains a hardcoded JavaScript dictionary of dummy products (`products = { 1: { ... } }`) reading `?id=` from query params. Features size dropdown (sizes 6–10), quantity input, static customer reviews, and a "Buy Now" button directing to `payment.html`. Not integrated with MySQL. |
| `cart.php` | GET / View | Shopping Cart View | Renders items stored in browser `localStorage.getItem('cart')`. Provides controls to increase/decrease quantity, calculate subtotal and total, remove items, and trigger "Proceed to Checkout". The checkout action serializes cart items into JSON and POSTs them to `save_cart.php` before redirecting to `payment.php`. |
| `save_cart.php` | POST / API Endpoint | Server-Side Cart Persistence | Receives raw JSON payload from `cart.php` via `php://input`. Prepares and executes an `INSERT INTO cart` statement for each item (`product_name`, `product_price`, `product_size`, `product_quantity`, `product_image`). The table lacks `user_id` or session keys, creating unassociated orphan records. |
| `payment.php` | GET / View & Form | Checkout & Payment Selection | Loads `cartItems` from `localStorage`, renders the line-item summary, collects shipping address fields (Name, Phone, Address, City, State, Postal Code, Country), and lets the user choose between "Cash on Delivery" or "Online Payment" (which dynamically exposes bank account inputs). Submits via POST to `add_order.php`. |
| `add_order.php` | POST / Action | Order Placement Handler | Requires active `$_SESSION['username']`. Reads `order_date`, `status`, and `total_price` from POST data, and creates an order record in `orders` table. Employs raw SQL interpolation without sanitization or parameter binding. Redirects to `order-confirmation.php`. |
| `process_orders.php` | POST / API Endpoint | Alternative AJAX Order Endpoint | Standalone legacy endpoint accepting `size`, `quantity`, `name`, `price`, `image`, and `total_amount`. Hardcodes `$customer_id = 1` and inserts into `orders` via prepared statement. Appears to be an older unreferenced API handler. |
| `order-confirmation.php` | GET / View | Order Success / Receipt | Displays an order confirmed confirmation screen reading `cartItems` from `localStorage`, renders order summary table, and immediately clears `localStorage.removeItem('cartItems')`. Provides a button to navigate back to `index.php`. |
| `wishlist.php` | GET / View | Customer Wishlist | Renders products saved in `localStorage.getItem('wishlist')`. Provides a "Remove" button that filters the localStorage array and reloads the page. Completely client-side; no backend database synchronization. |
| `login.php` | GET / View | Customer Login Form | Standard HTML form prompting for `username` and `password`, posting to `login_process.php`. Links to `signup.php`. |
| `login_process.php` | POST / Auth Action | Customer Authentication | Escapes `username` with `real_escape_string`, queries `users` table for matching username, verifies password using PHP's `password_verify()`. If valid, logs entry in `login_attempts` (`user_id`), sets `$_SESSION['username'] = $user`, and redirects to `index.php`. Fails to set `$_SESSION['user_id']`. |
| `signup.php` | GET / View | Customer Registration Form | Standard HTML form with inputs for `username`, `email`, and `password`, submitting to `signup_process.php`. |
| `signup_process.php` | POST / Auth Action | Customer Registration | Escapes inputs, generates a Bcrypt hash using `password_hash($pass, PASSWORD_DEFAULT)`, and inserts user into `users` (`username`, `email`, `password`). On success, redirects to `login.php`. |
| `logout.php` | GET / Action | Session Termination | Calls `session_unset()`, `session_destroy()`, and redirects user to `index.php`. |
| `user-details.php` | GET / View | Customer Profile View | Verifies `$_SESSION['user_id']` (which is never populated by `login_process.php`, locking the user in a redirect loop). Queries `username, email, first_name, last_name FROM users` (columns `first_name` and `last_name` do not exist in the DB schema). Links to non-existent `edit-user.php`. |
| `contact.php` | GET / View | Contact Us & Company Info | Static contact form with name, email, and message inputs. Has no backend action or processing script. Lists company email, phone number, and physical address. |
| `faq.php` | GET / View | Interactive FAQs Accordion | Accordion FAQ page with vanilla JavaScript toggle logic addressing 10 common e-commerce questions (shipping, returns, defects, payment options). |

---

### 2.2 Admin Panel Routes

| Page / File | Method / Type | Functional Purpose | Current Implementation & Deficiencies |
| :--- | :--- | :--- | :--- |
| `admin_login.php` | GET / View | Admin Login Form | Form prompting for admin credentials, posting to `admin_login_process.php`. Contains a link to `admin_signup.php`. |
| `admin_login_process.php` | POST / Auth Action | Admin Login Verification | Bypasses database authentication entirely! Validates against hardcoded constants `$fixed_username = "admin"` and `$fixed_password = "admin123"`. Sets `$_SESSION['admin'] = $username` on match and redirects to `admin.php`. |
| `admin_signup.php` | GET / View | Admin Registration Form | Registration form prompting for username, password, and confirm password, posting to `admin_signup_process.php`. |
| `admin_signup_process.php` | POST / Auth Action | Admin Registration Verification | Enforces that the submitted credentials match the hardcoded values `"admin"` and `"admin123"`. Hashes the password with `PASSWORD_DEFAULT` and inserts into table `admins` (which conflicts with `adminusers` in `shoesy.sql`). |
| `admin.php` | GET / View | Admin Central Dashboard | **CRITICAL:** Has NO session verification or access guard. Anyone can access this page directly. Computes metric cards: Total Sales (`SUM(total_price) FROM orders`), Total Orders (`COUNT(*) FROM orders`), Total Customers (`COUNT(*) FROM users`), and Total Products (`COUNT(*) FROM products`). Renders recent orders table (`customer_name`, `order_date`, `status`, `total_price`) and registered customers table (`id`, `username`, `email`). |
| `manage_products.php` | GET / View | Product Catalog Management | Also completely unauthenticated. Renders table of all products with thumbnail image (`uploads/$image`), price, an Edit button (triggers a dummy JS alert), and a Delete button linking to `delete_product.php?id=...`. Includes a hidden modal form to create products posting to `add_product.php`. |
| `add_product.php` | POST / Action | Create Product Action | Accepts `product-name`, `product-price`, and `product-file`. Executes unvalidated file upload to `uploads/` directory on local disk via `move_uploaded_file()`. Inserts record into `products` table via prepared statement. Redirects to `admin.php`. |
| `delete_product.php` | GET / Action | Delete Product Action | Unauthenticated GET endpoint accepting `?id=X`. Casts ID to int and executes `DELETE FROM products WHERE id = ?`. Completely unprotected against unauthorized invocation or CSRF. Redirects to `admin.php`. |

---

## 3. Database Audit & Schema Drift Analysis

### 3.1 Existing Tables & Columns (as defined in `shoesy.sql`)

```sql
-- 1. users
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. login_attempts
CREATE TABLE login_attempts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    username VARCHAR(50) NOT NULL UNIQUE,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 3. products
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. orders (Schema in shoesy.sql)
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255),
    product_price DECIMAL(10, 2),
    product_size VARCHAR(10),
    quantity INT,
    total_price DECIMAL(10, 2),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. adminusers (Schema in shoesy.sql)
CREATE TABLE adminusers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. cart
CREATE TABLE cart (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    product_size VARCHAR(50) NOT NULL,
    product_quantity INT NOT NULL,
    product_image VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.2 Schema Drift & Inconsistencies Discovered in PHP Code

1. **`orders` Table Drift:**
   - In `shoesy.sql`: Table defines `(order_id, product_name, product_price, product_size, quantity, total_price, order_date)`.
   - In `shoesy.sql` INSERT seed: Statements insert `(id, user_id, order_date, total, status)` — fields that do not exist in the table definition.
   - In `add_order.php` and `admin.php`: The code expects and inserts `(customer_name, order_date, status, total_price)`.
   - In `process_orders.php`: The code expects `(customer_id, product_name, product_price, quantity, size, total_amount, image, status)`.
   - *Resolution:* Replace this fractured design with relational tables: an `Order` header (user, address, total, status, paymentMethod, paymentStatus) and relational `OrderItem` line items (product, price, size, quantity).

2. **`adminusers` vs `admins` Table Drift:**
   - In `shoesy.sql`: Defined as `adminusers`, but dummy data insert includes an unmodeled `email` column: `INSERT INTO AdminUsers (id, username, password, email)...`.
   - In `admin_signup_process.php`: Table queried and inserted is `admins` (`INSERT INTO admins (username, password)...`).
   - *Resolution:* Consolidate admin accounts into the unified `User` model with an `enum Role { USER, ADMIN }`.

3. **`users` Missing Columns:**
   - `user-details.php` queries `first_name` and `last_name`, which do not exist in the schema or registration forms.
   - *Resolution:* Add `name` (or `firstName`, `lastName`) to the `User` Prisma model.

4. **`login_attempts` Schema Constraint Failure:**
   - In `shoesy.sql`, `username` is declared `NOT NULL UNIQUE`.
   - In `login_process.php`, the query executes `INSERT INTO login_attempts (user_id) VALUES ('$user_id')`, which fails MySQL strict mode because `username` is omitted.

5. **`cart` Table Disconnection:**
   - The `cart` table in `shoesy.sql` and `save_cart.php` has no `user_id` or session token. It acts as an unbounded global dump of cart items.
   - *Resolution:* Manage client-side cart via persisted Zustand store (with local storage hydration), and convert directly to `Order` on checkout.

---

## 4. Auth, Session Logic & Asset Handling Audit

### 4.1 Authentication & Session Architecture
- **State Mechanism:** Built entirely on standard PHP sessions (`session_start()`).
- **Session Identification:**
  - On user login (`login_process.php`): Only `$_SESSION['username']` is populated. `$_SESSION['user_id']` is never written.
  - On admin login (`admin_login_process.php`): Only `$_SESSION['admin']` is populated.
- **Session Verification Breakdown:**
  - `admin.php` and `manage_products.php` contain zero session checks. The entire admin interface is completely accessible to unauthenticated public visitors.
  - `user-details.php` redirects to `login.php` if `$_SESSION['user_id']` is missing; since `login_process.php` never writes this key, logged-in users cannot access their profile.

### 4.2 Password Hashing
- **Registration:** Uses `password_hash($pass, PASSWORD_DEFAULT)` which generates standard Bcrypt hashes (`$2y$...`).
- **Login:** Uses `password_verify($pass, $stored_hashed_password)`.
- **SQL Dump Flaw:** In `shoesy.sql`, dummy user records (`john_doe`, `jane_doe`, `alice_smith`) contain plain text passwords (`password123`, `password456`, `password789`), making them impossible to authenticate through `login_process.php`.

### 4.3 Image & File Upload Handling
- **Mechanism:** Implemented in `add_product.php` using standard `$_FILES['product-file']`.
- **Storage Location:** Direct filesystem writes to a local relative directory: `uploads/` via `move_uploaded_file()`.
- **Validation:** **Zero validation** is performed. There is no check on file size, MIME type, file extension, or file magic bytes.
- **Vercel Incompatibility:** Vercel functions run in an ephemeral, read-only serverless environment. Local filesystem writes with `move_uploaded_file` fail immediately on Vercel. In Next.js, images will be handled via seed assets located in `/public/products` and admin URLs (or external image host / Vercel Blob).

---

## 5. Security Vulnerabilities Found

| Severity | Category | Affected File(s) | Description & Threat Vector |
| :---: | :--- | :--- | :--- |
| 🔴 **CRITICAL** | **Remote Code Execution (RCE) via Unrestricted File Upload** | `add_product.php` | `add_product.php` accepts any uploaded file via `$_FILES['product-file']` and saves it directly to `uploads/` without extension validation. An attacker can upload a malicious `.php` script (e.g., web shell) and execute arbitrary code on the server. |
| 🔴 **CRITICAL** | **Broken Authentication & Missing Access Control** | `admin.php`, `manage_products.php`, `delete_product.php` | The admin dashboard, product management interface, and product deletion endpoint do not verify administrative session state. Any unauthenticated user can view customer records, order revenue, add inventory, or delete products. |
| 🔴 **CRITICAL** | **SQL Injection (SQLi)** | `add_order.php` | Variables `$customer_name`, `$order_date`, `$status`, and `$total_price` are interpolated directly into the SQL string without parameterized binding or escaping: `INSERT INTO orders VALUES ('$customer_name', '$order_date', ...)` allowing complete database takeover or extraction. |
| 🔴 **CRITICAL** | **Hardcoded Administrative Credentials** | `admin_login_process.php`, `admin_signup_process.php` | Plaintext credentials (`admin` / `admin123`) are hardcoded directly into source files. Any attacker with repository access or through decompilation immediately acquires full admin rights. |
| 🟠 **HIGH** | **Insecure Direct Object Reference (IDOR) & CSRF on Delete** | `delete_product.php` | Accepts product ID via HTTP `GET` (`delete_product.php?id=1`) with no authentication, authorization check, or anti-CSRF token. A simple image tag or cross-site link can delete arbitrary products. |
| 🟠 **HIGH** | **Committed Database Credentials** | `db_connect.php`, `login_process.php`, `signup_process.php`, `add_product.php`, etc. | Hardcoded database connection parameters (`root` with blank password on `localhost`) are committed in multiple application files. |
| 🟡 **MEDIUM** | **Cross-Site Scripting (XSS)** | `product.php`, `payment.php`, `cart.php`, `order-confirmation.php` | LocalStorage item attributes and unescaped database fields are injected directly into HTML strings (`innerHTML`) without DOM sanitization, exposing the app to DOM-based and Reflected XSS. |
| 🟡 **MEDIUM** | **Plaintext Passwords in Database Dumps** | `shoesy.sql` | User accounts seeded in the SQL dump contain raw plaintext passwords, violating secure credential storage standards. |

---

## 6. Target Architecture & Next.js Modernization Strategy

### 6.1 Architectural Overview
The target solution will be a modern, serverless-ready Next.js 14+ application using the App Router, located in `/web`, fully compatible with Vercel deployment and Neon Serverless PostgreSQL.

```
SHOESY-STORE-main/
├── Build/                  --> (Moved to /legacy-php during Phase 1 for preservation)
├── legacy-php/             --> Preserved original PHP files and assets
├── web/                    --> Next.js 14+ Full-Stack Application
│   ├── app/
│   │   ├── (storefront)/   --> Storefront routes (home, shop, product, cart, checkout, orders)
│   │   ├── (auth)/         --> Login, register, profile
│   │   ├── admin/          --> Protected Admin Dashboard, Product CRUD, Categories, Orders
│   │   └── api/            --> Route Handlers (auth, checkout, razorpay, webhooks)
│   ├── components/         --> Reusable UI, Framer Motion animations, shadcn/ui components
│   ├── lib/                --> Prisma singleton, auth options, Razorpay helper, utils
│   ├── prisma/             --> schema.prisma & seed.ts (20+ realistic shoes, admin, demo user)
│   ├── public/             --> Seed product images (/public/products), brand logos, video
│   └── store/              --> Persisted Zustand cart and wishlist stores
├── .gitignore              --> Root gitignore excluding .env, node_modules, .next, etc.
└── MIGRATION_PLAN.md       --> This migration document
```

### 6.2 Key Stack Components & Libraries
- **Framework:** Next.js 14+ (App Router) with React 18 and TypeScript (Strict Mode).
- **ORM & Database:** Prisma ORM connected to Neon PostgreSQL using connection pooling (`DATABASE_URL`) and direct URL (`DIRECT_URL`).
- **Authentication:** Auth.js (NextAuth.js v4/v5 compatible) with Credentials Provider, Bcrypt password hashing, JWT strategy, and role-based route middleware protecting `/admin/*`.
- **UI & Styling:** Tailwind CSS + shadcn/ui (Radix UI primitives) with dark/light theme support.
- **Animations:** Framer Motion for hero parallax, stagger animations, card hover zoom, animated cart drawer, and modal transitions (respecting `prefers-reduced-motion`).
- **State Management:** Zustand with `persist` middleware for seamless client-side cart and wishlist state.
- **Form Handling & Validation:** React Hook Form with Zod schemas for all frontend inputs and server-side validation.
- **Payments:** Razorpay Checkout in Test Mode with server-side order generation and signature verification, plus Cash on Delivery (COD).

---

## 7. Proposed Unified Prisma Schema (`schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum Role {
  USER
  ADMIN
}

enum OrderStatus {
  PENDING
  PROCESSING
  SHIPPED
  DELIVERED
  CANCELLED
}

enum PaymentMethod {
  COD
  RAZORPAY
}

enum PaymentStatus {
  PENDING
  COMPLETED
  FAILED
  REFUNDED
}

model User {
  id            String    @id @default(cuid())
  name          String?
  username      String    @unique
  email         String    @unique
  password      String
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  orders        Order[]
  reviews       Review[]
  wishlistItems Wishlist[]
}

model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  image       String?
  products    Product[]
  createdAt   DateTime  @default(now())
}

model Product {
  id          String      @id @default(cuid())
  name        String
  slug        String      @unique
  description String
  price       Decimal     @db.Decimal(10, 2)
  brand       String
  category    Category    @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  categoryId  String
  images      String[]    // URLs or /products/... paths
  sizes       Int[]       // Available sizes e.g. [6, 7, 8, 9, 10, 11]
  colors      String[]    // Color options
  stock       Int         @default(10)
  featured    Boolean     @default(false)
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  orderItems  OrderItem[]
  reviews     Review[]
  wishlists   Wishlist[]

  @@index([brand])
  @@index([categoryId])
}

model Order {
  id              String        @id @default(cuid())
  orderNumber     String        @unique
  user            User          @relation(fields: [userId], references: [id])
  userId          String
  customerName    String
  customerEmail   String
  customerPhone   String
  shippingAddress Json          // street, city, state, postalCode, country
  totalAmount     Decimal       @db.Decimal(10, 2)
  status          OrderStatus   @default(PENDING)
  paymentMethod   PaymentMethod @default(COD)
  paymentStatus   PaymentStatus @default(PENDING)
  razorpayOrderId String?
  razorpayPaymentId String?
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  items           OrderItem[]
}

model OrderItem {
  id          String   @id @default(cuid())
  order       Order    @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderId     String
  product     Product  @relation(fields: [productId], references: [id])
  productId   String
  name        String
  price       Decimal  @db.Decimal(10, 2)
  size        Int
  quantity    Int
  image       String
}

model Review {
  id        String   @id @default(cuid())
  rating    Int      @default(5)
  comment   String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  createdAt DateTime @default(now())
}

model Wishlist {
  id        String   @id @default(cuid())
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId    String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  productId String
  createdAt DateTime @default(now())

  @@unique([userId, productId])
}
```

---

## 8. Phased Execution Roadmap

### Phase 1: Workspace Scaffolding & Legacy Code Relocation
- Move existing PHP files, SQL dump, and assets from `Build/` into a preserved `/legacy-php` directory (ensuring nothing is deleted).
- Relocate untracked `.env` into `/web/.env` without logging or printing its contents.
- Verify and enforce `.gitignore` rules in both root and `/web/.gitignore` to ignore `.env`, `.env.local`, `.env*.local`, `node_modules`, `.next`, `.vercel`.
- Create `/web/.env.example` with placeholders for all necessary configuration variables.
- Initialize Next.js 14+ project in `/web` with TypeScript, Tailwind CSS, ESLint, Lucide icons, and shadcn/ui.
- Verify local compilation with `npm run build`. Commit Phase 1.

### Phase 2: Prisma ORM, Neon PostgreSQL Migration & Realistic Seeding
- Configure `prisma/schema.prisma` with Neon connection string (`DATABASE_URL` and `DIRECT_URL`).
- Implement the Prisma client singleton in `/web/lib/prisma.ts`.
- Run first migration (`npx prisma migrate dev --name init`) to verify live Neon PostgreSQL connectivity.
- Develop realistic database seed script (`prisma/seed.ts`):
  - Categories: Running, Basketball, Casual, Tennis, Lifestyle.
  - 20+ realistic shoes across Nike, Adidas, Puma, Asics with real sneaker names, descriptions, prices in INR, sizes (6–11), color tags, and stock counts.
  - Seed product images placed in `/web/public/products`.
  - Demo Admin account (`admin@shoesy.com` / `admin123`) and Demo User account (`user@shoesy.com` / `user123`) with Bcrypt hashed passwords.
  - Guard logic: Demo Admin account cannot be deleted or demoted.
  - Initial customer reviews for popular models.
- Add package scripts: `"postinstall": "prisma generate"`, `"db:migrate": "prisma migrate dev"`, `"db:deploy": "prisma migrate deploy"`, `"db:seed": "prisma db seed"`, `"db:studio": "prisma studio"`. Commit Phase 2.

### Phase 3: Backend API, Authentication & Server Actions
- Configure NextAuth.js with Credentials Provider, Bcrypt comparison, and session callbacks injecting `role` and `id`.
- Implement Next.js Edge Middleware protecting `/admin/*` routes (enforcing `role === 'ADMIN'`) and `/checkout`, `/orders` (enforcing authentication).
- Implement Server Actions / Route Handlers with Zod validation:
  - Auth: Register, Login, Demo Quick-Login.
  - Products: Search, filter, pagination, details, inventory checks.
  - Orders: Create order (COD or Razorpay order generation), Razorpay signature verification webhook/handler, order history.
  - Admin Actions: Product CRUD, category management, order status updates, customer viewer.
- Validate types, error states, and build output. Commit Phase 3.

### Phase 4: Storefront Implementation
- **Navbar & Navigation:** Glassmorphic sticky header with logo, dynamic search bar, brand navigation, cart drawer badge, wishlist count, theme toggle, and user profile / login button.
- **Home Page:** Hero section with sneaker video/media, brand showcase carousel (Nike, Adidas, Puma, Asics), featured drops, customer testimonials, and value props.
- **Shop / Catalog Page:** Advanced filtering by brand, size, color, price range, categories, search term, and sorting (price low/high, newest, popular).
- **Product Detail Page:** Multi-image gallery, interactive size selector, live stock indicator, color variants, quantity selector, customer reviews list with star rating, and "Add to Cart" / "Buy Now" buttons.
- **Cart & Wishlist:** Persisted Zustand cart drawer and full cart page; wishlist toggle with heart animation.
- **Checkout Flow:** Multi-step or streamlined one-page checkout collecting shipping address, Razorpay checkout modal (Test Mode) + Cash on Delivery option.
- **Order Confirmation & Orders History:** Order receipt with order number, tracking status, item breakdown, and user order history list.
- **Authentication Pages:** Polished Login and Sign-up pages with pre-filled clickable "Demo User" and "Demo Admin" quick-fill buttons. Commit Phase 4.

### Phase 5: Admin Panel Implementation
- **Dashboard:** Overview stats with Total Revenue, Total Orders, Active Customers, and Inventory Count. Interactive Recharts charts (Monthly Revenue, Sales by Brand/Category).
- **Product Management:** Searchable, sortable, paginated table of products with image preview, stock level, price, and category. Modal for creating and editing products (using image URL fields for Vercel read-only safety).
- **Category Management:** Create and edit shoe categories.
- **Order Management:** Filterable order table with status badge update dropdown (Pending -> Processing -> Shipped -> Delivered -> Cancelled).
- **Customer List:** Customer details view showing order count and total spend.
- **Low-Stock Alerts:** Alert banner highlighting items with stock < 5.
- Enforce immutable demo admin safety guard. Commit Phase 5.

### Phase 6: Brand Identity, Styling & Framer Motion Animations
- **Design Language:** High-end bold sneaker boutique aesthetic (e.g., Kith / Goat / SNKRS vibe) with deep charcoal/slate dark theme, crisp clean typography, and a signature vibrant accent color (electric orange or infrared).
- **Animations:**
  - Hero parallax scroll effects.
  - Product card hover lift with smooth image zoom.
  - Animated cart drawer opening from right with stagger item entrance.
  - Micro-interactions: Add-to-cart button loading and checkmark feedback, wishlist heart bounce.
  - Polished skeleton loaders for products and tables.
  - Dark / Light mode toggle with seamless transition.
  - Strict support for `prefers-reduced-motion: reduce`. Commit Phase 6.

### Phase 7: Production Optimization & Hardening
- Metadata and OpenGraph tags for social sharing.
- `next/image` optimization with blur placeholders.
- Dedicated `not-found.tsx`, `error.tsx`, and `loading.tsx` boundary handlers.
- Secure HTTP headers (CSP, X-Frame-Options, X-Content-Type-Options) in `next.config.js`.
- Rate limiting on authentication and checkout route handlers.
- Final full compilation check with `npm run build` and `npm run lint`. Commit Phase 7.

### Phase 8: Documentation & Vercel Deployment Guide
- Comprehensive `README.md` containing:
  - Architecture overview, live demo URL placeholder, and UI screenshots section.
  - Complete list of environment variables.
  - Demo user and admin credentials.
  - Step-by-step local setup instructions.
  - Full Vercel + Neon deployment guide (including executing `prisma migrate deploy` and `prisma db seed` in production). Commit Phase 8.

---

## 9. Environment Variables Configuration

The following variables will be defined in `/web/.env.example`:

```env
# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.region.neon.tech/shoesy?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://user:password@ep-sample.region.neon.tech/shoesy?sslmode=require"

# NextAuth / Auth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Razorpay Payments (Test Mode)
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_placeholder"
RAZORPAY_KEY_SECRET="placeholder_secret"

# Public App URL (Used for metadata/OG tags)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

*Note:* When migrating to `/web/.env`, you will keep your existing `DATABASE_URL` and `DIRECT_URL`. You will only need to add `NEXTAUTH_SECRET` (generate using `openssl rand -base64 32` or any secret string), `NEXTAUTH_URL`, and Razorpay test credentials.

---

## 10. Audit Verification Summary

- **Total PHP files audited:** 24
- **Total SQL scripts audited:** 1 (`shoesy.sql`)
- **Key security vulnerabilities cataloged:** 8 major issues (RCE, unauthenticated admin, SQLi, hardcoded credentials, CSRF, IDOR, XSS, exposed DB credentials)
- **Database drift identified and documented:** Yes (`orders`, `admins`/`adminusers`, `users`, `cart`)
- **Status:** Complete. No code has been modified or generated yet.

---

*Awaiting user approval before proceeding to Phase 1.*

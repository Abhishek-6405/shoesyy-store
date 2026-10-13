# SHOESY — Modern Footwear Store & Admin Platform

A high-performance footwear e-commerce application migrated from legacy PHP/MySQL to **Next.js 14 (App Router)**, **TypeScript**, **PostgreSQL on Neon**, and **Prisma ORM**.

---

## 🔑 Demo Credentials

| Role | Email | Password | Access / Privileges |
| :--- | :--- | :--- | :--- |
| **Demo Admin** | `admin@shoesy.demo` | `admin123` | Full access to `/admin` dashboard, inventory CRUD, orders & customer records |
| **Demo Customer** | `user@shoesy.demo` | `user123` | Customer storefront, wishlist, checkout & order history |

---

## 🛠 Tech Stack

- **Framework:** Next.js 14+ (App Router, Server Actions, Route Handlers)
- **Database:** PostgreSQL on Neon Serverless with connection pooling & direct migration URL
- **ORM:** Prisma ORM 5.22.0
- **Authentication:** Auth.js (NextAuth.js) with bcrypt credential hashing & role-based middleware
- **State Management:** Zustand (persisted client cart)
- **Styling & UI:** Tailwind CSS, shadcn/ui, Lucide React
- **Animations:** Framer Motion (parallax, stagger, micro-interactions)
- **Payments:** Razorpay (Test Mode) + Cash on Delivery (COD)

---

## 🚀 Quick Start (Local Setup)

```powershell
# Navigate to web application
cd web

# Install dependencies
npm install

# Run database migrations against Neon
npm run db:migrate

# Seed database with 26 realistic shoes & demo users
npm run db:seed

# Inspect database visually with Prisma Studio
npm run db:studio

# Start Next.js development server
npm run dev
```

The app will be running at [http://localhost:3000](http://localhost:3000).


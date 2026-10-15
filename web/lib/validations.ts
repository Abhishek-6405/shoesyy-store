import { z } from "zod";
import { OrderStatus, PaymentMethod } from "@prisma/client";

// Zod's optional JIT uses eval; use the same validation rules without it under CSP.
if (typeof window !== "undefined") z.config({ jitless: true });

// Auth
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50).optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username cannot exceed 30 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, underscores and hyphens"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Products
export const productSchema = z.object({
  name: z.string().min(2, "Product name is required").max(100),
  slug: z.string().min(2).max(120).optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  brand: z.string().min(2, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  images: z.array(z.string().url("Must be a valid image URL")).min(1, "At least one image is required"),
  sizes: z.array(z.coerce.number().int().positive()).min(1, "At least one size must be selected"),
  colors: z.array(z.string()).min(1, "At least one color is required"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative").default(10),
  featured: z.boolean().default(false),
  isActive: z.boolean().default(true).optional(),
});

// Partial updates must not inherit create-time defaults (otherwise `{ isActive: true }`
// would silently reset stock to 10 and featured to false).
export const productUpdateSchema = productSchema
  .extend({
    stock: z.coerce.number().int().min(0, "Stock cannot be negative").optional(),
    featured: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .partial();
export type ProductInput = z.infer<typeof productSchema>;

// Categories
export const categorySchema = z.object({
  name: z.string().min(2, "Category name is required").max(50),
  slug: z.string().min(2).max(60).optional(),
  image: z.string().url("Must be a valid image URL").optional().nullable(),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Reviews
export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  rating: z.coerce.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(3, "Review comment must be at least 3 characters").max(1000),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

// Shipping Address
export const shippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  street: z.string().min(5, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  postalCode: z.string().min(4, "Postal code is required"),
  country: z.string().default("India"),
});

// Order items for client submission
export const orderItemInputSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  size: z.coerce.number().int().positive("Size is required"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(10, "Max quantity per item is 10"),
});

// Orders
export const createOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "Cart cannot be empty"),
  shippingAddress: shippingAddressSchema,
  paymentMethod: z.nativeEnum(PaymentMethod).default(PaymentMethod.COD),
  razorpayOrderId: z.string().optional().nullable(),
  razorpayPaymentId: z.string().optional().nullable(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

// Order Status Update (Admin)
export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

// Razorpay
export const createRazorpayOrderSchema = z.object({
  items: z.array(orderItemInputSchema).min(1, "Cart cannot be empty"),
});

export const verifyRazorpayPaymentSchema = z.object({
  razorpayOrderId: z.string().min(1, "Razorpay order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay signature is required"),
  orderData: createOrderSchema,
});

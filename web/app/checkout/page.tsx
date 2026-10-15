"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { shippingAddressSchema } from "@/lib/validations";
import { z } from "zod";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/store/cart";
import { useCartDetails } from "@/lib/hooks/use-cart-details";
import { useToast } from "@/components/ui/toast";
import { formatPrice } from "@/lib/utils";
import {
  CreditCard,
  Banknote,
  ShieldCheck,
  Truck,
  ArrowRight,
  Lock,
} from "lucide-react";

type ShippingAddressFormValues = z.input<typeof shippingAddressSchema>;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay?: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { success, error: toastError } = useToast();

  const clearCart = useCartStore((state) => state.clearCart);
  const { items, rawItems, subtotal, shipping, grandTotal, isLoading } =
    useCartDetails();

  const [paymentMethod, setPaymentMethod] = useState<"COD" | "RAZORPAY">("COD");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const [razorpayKeyId, setRazorpayKeyId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      street: "",
      city: "",
      state: "",
      postalCode: "",
      country: "India",
    },
  });

  // Pre-fill user details if logged in
  useEffect(() => {
    if (session?.user?.name) {
      setValue("fullName", session.user.name);
    }
  }, [session, setValue]);

  // Check Razorpay readiness
  useEffect(() => {
    async function checkRazorpay() {
      try {
        const res = await fetch("/api/payments/razorpay/config");
        const json = await res.json();
        if (json.success && json.data?.enabled) {
          setRazorpayReady(true);
          setRazorpayKeyId(json.data.keyId);
        }
      } catch {
        setRazorpayReady(false);
      }
    }
    checkRazorpay();
  }, []);

  // Auth Guard
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [status, router]);

  if (status === "loading" || isLoading) {
    return (
      <div className="py-20 text-center">
        <Container className="max-w-2xl space-y-4 animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded-xl w-48 mx-auto" />
          <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded-3xl" />
        </Container>
      </div>
    );
  }

  if (rawItems.length === 0) {
    return (
      <div className="py-20 text-center">
        <Container className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Your bag is empty</h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Please add items to your cart before proceeding to checkout.
          </p>
          <Button asChild>
            <Link href="/shop">Browse Store</Link>
          </Button>
        </Container>
      </div>
    );
  }

  const handleCheckoutSubmit = async (data: ShippingAddressFormValues) => {
    setIsSubmitting(true);

    try {
      const orderItems = rawItems.map((item) => ({
        productId: item.productId,
        size: item.size,
        quantity: item.quantity,
      }));

      // CASE 1: Cash on Delivery
      if (paymentMethod === "COD") {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: orderItems,
            shippingAddress: data,
            paymentMethod: "COD",
          }),
        });

        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.error || "Failed to create order");
        }

        clearCart();
        success("Order placed successfully! Redirecting to confirmation...");
        router.push(`/orders/${json.data.id}?success=true`);
        return;
      }

      // CASE 2: Razorpay Test Mode
      if (paymentMethod === "RAZORPAY") {
        if (!razorpayReady || !razorpayKeyId) {
          throw new Error(
            "Razorpay test keys are not configured on this server. Please choose Cash on Delivery (COD) to test checkout."
          );
        }

        if (typeof window.Razorpay === "undefined") {
          throw new Error("Razorpay gateway is still loading. Please try again in a few seconds.");
        }

        // 1. Create order on server
        const rzpOrderRes = await fetch("/api/payments/razorpay/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: orderItems }),
        });

        const rzpOrderJson = await rzpOrderRes.json();
        if (!rzpOrderRes.ok) {
          throw new Error(rzpOrderJson.error || "Failed to initiate Razorpay payment");
        }

        const { orderId, amount, currency } = rzpOrderJson.data;

        // 2. Open Razorpay Checkout modal
        const rzp = new window.Razorpay({
          key: razorpayKeyId,
          amount,
          currency,
          name: "SHOESY Store",
          description: "Sneaker Drop Order (Test Mode)",
          order_id: orderId,
          prefill: {
            name: data.fullName,
            email: session?.user?.email || "customer@shoesy.demo",
            contact: data.phone,
          },
          theme: {
            color: "#ff4d15",
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          handler: async (response: any) => {
            try {
              // 3. Verify signature and create order
              const verifyRes = await fetch("/api/payments/razorpay/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                  orderData: {
                    items: orderItems,
                    shippingAddress: data,
                  },
                }),
              });

              const verifyJson = await verifyRes.json();
              if (!verifyRes.ok) {
                throw new Error(verifyJson.error || "Payment signature verification failed");
              }

              clearCart();
              success("Payment verified! Your sneakers are reserved.");
              router.push(`/orders/${verifyJson.data.id}?success=true`);
            } catch (vErr: unknown) {
              const msg = vErr instanceof Error ? vErr.message : "Payment verification failed";
              toastError(msg);
              setIsSubmitting(false);
            }
          },
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          modal: {
            ondismiss: () => {
              setIsSubmitting(false);
              toastError("Payment was cancelled. Your bag items have been retained.");
            },
          },
        });

        rzp.open();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during checkout";
      toastError(msg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-8 sm:py-14">
      {/* Load Razorpay script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <Container>
        <div className="pb-6 mb-8 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 mb-1">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-bit Encrypted Checkout</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
            Finalize Your Order
          </h1>
        </div>

        <form onSubmit={handleSubmit(handleCheckoutSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left: Shipping Address & Payment Selection */}
            <div className="lg:col-span-7 space-y-8">
              {/* Shipping Address */}
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <Truck className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                  <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-white">
                    1. Delivery Address
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Full Name *
                    </label>
                    <Input aria-label="Full name"
                      placeholder="e.g. Rahul Sharma"
                      {...register("fullName")}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Phone Number *
                    </label>
                    <Input aria-label="Phone number"
                      placeholder="10-digit mobile number"
                      {...register("phone")}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Street Address / House / Flat No. *
                    </label>
                    <Input aria-label="Street address"
                      placeholder="Flat 402, Highline Residency, Bandra West"
                      {...register("street")}
                    />
                    {errors.street && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.street.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      City *
                    </label>
                    <Input aria-label="City" placeholder="Mumbai" {...register("city")} />
                    {errors.city && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      State *
                    </label>
                    <Input aria-label="State" placeholder="Maharashtra" {...register("state")} />
                    {errors.state && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Postal Code *
                    </label>
                    <Input aria-label="Postal code" placeholder="400050" {...register("postalCode")} />
                    {errors.postalCode && (
                      <p className="text-[11px] text-rose-500 mt-1 font-semibold">
                        {errors.postalCode.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
                      Country
                    </label>
                    <Input aria-label="Country" disabled value="India" {...register("country")} />
                  </div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm space-y-4">
                <div className="flex items-center gap-2.5 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CreditCard className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                  <h2 className="text-base font-bold uppercase text-zinc-900 dark:text-white">
                    2. Payment Method
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* COD */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={paymentMethod === "COD"}
                    aria-label="Cash on Delivery"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => setPaymentMethod("COD")}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === "COD"
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-5 h-5 text-emerald-600" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          Cash on Delivery
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "COD"
                            ? "border-brand-500 bg-brand-500"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {paymentMethod === "COD" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      Pay with cash or UPI upon delivery at your doorstep. 100% verified.
                    </p>
                  </div>

                  {/* Razorpay */}
                  <div
                    role="button"
                    tabIndex={0}
                    aria-pressed={paymentMethod === "RAZORPAY"}
                    aria-label="Razorpay test mode"
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.currentTarget.click();
                      }
                    }}
                    onClick={() => {
                      if (!razorpayReady) {
                        toastError(
                          "Razorpay test keys are not configured in .env. Keeping COD selected."
                        );
                        return;
                      }
                      setPaymentMethod("RAZORPAY");
                    }}
                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                      paymentMethod === "RAZORPAY"
                        ? "border-brand-500 bg-brand-50/20 dark:bg-brand-950/20 shadow-sm"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-5 h-5 text-brand-700 dark:text-brand-400" />
                        <span className="text-sm font-bold text-zinc-900 dark:text-white">
                          Razorpay (Test Mode)
                        </span>
                      </div>
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          paymentMethod === "RAZORPAY"
                            ? "border-brand-500 bg-brand-500"
                            : "border-zinc-300 dark:border-zinc-700"
                        }`}
                      >
                        {paymentMethod === "RAZORPAY" && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
                      Cards, UPI, NetBanking, Wallets.
                      {!razorpayReady && (
                        <span className="block text-amber-600 font-semibold mt-1">
                          (Keys not configured in .env; use COD)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Order Review & Placement */}
            <div className="lg:col-span-5 space-y-6">
              <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-6 sticky top-28">
                <h3 className="text-base font-bold uppercase tracking-tight text-zinc-900 dark:text-white">
                  Order Items ({items.length})
                </h3>

                {/* Items preview */}
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
                    >
                      <div className="relative w-14 h-14 rounded-xl bg-zinc-100 dark:bg-zinc-800 overflow-hidden shrink-0">
                        <Image
                          src={
                            item.product?.images?.[0] ||
                            "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80"
                          }
                          alt={item.product?.name || "Shoe"}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                          {item.product?.name || "Loading..."}
                        </p>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                          UK {item.size} • Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-xs font-black text-zinc-900 dark:text-white">
                        {formatPrice(item.itemTotal)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-xs">
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Subtotal</span>
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                    <span>Shipping</span>
                    <span>
                      {shipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        formatPrice(shipping)
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-black text-zinc-900 dark:text-white pt-2 border-t border-zinc-100 dark:border-zinc-800">
                    <span>Total Due</span>
                    <span className="text-2xl text-brand-600">
                      {formatPrice(grandTotal)}
                    </span>
                  </div>
                </div>

                {/* Place Order CTA */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full h-14 text-base font-bold shadow-xl shadow-brand-500/20"
                >
                  {isSubmitting ? (
                    "Processing Your Order..."
                  ) : paymentMethod === "COD" ? (
                    <span className="flex items-center gap-2">
                      Place Order with Cash on Delivery
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Proceed to Razorpay Payment
                      <ArrowRight className="w-5 h-5" />
                    </span>
                  )}
                </Button>

                <div className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400 justify-center">
                  <ShieldCheck className="w-4 h-4 text-brand-700 dark:text-brand-400 shrink-0" />
                  <span>Prices re-validated directly against database</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      </Container>
    </div>
  );
}

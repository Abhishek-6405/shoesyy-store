"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Mail, ShieldCheck, Truck, RotateCcw, ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState("");
  const { success } = useToast();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success("Welcome to the Sneaker Club! Check your inbox for 10% off.");
      setEmail("");
    }
  };

  return (
    <footer className="bg-zinc-950 text-zinc-300 border-t border-zinc-900 mt-20">
      {/* Brand values banner */}
      <div className="border-b border-zinc-900 py-10 bg-zinc-900/40">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 border border-brand-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  Free Express Delivery
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Complimentary shipping on orders over ₹2,000
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 border border-brand-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  100% Verified Authentic
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Direct from verified manufacturers and distributors
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center shrink-0 border border-brand-500/20">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-white">
                  30-Day Hassle-Free Returns
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Instant pickup & easy exchange on all footwear
                </p>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Main footer navigation & newsletter */}
      <div className="py-16">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-4">
              <Link href="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center text-white">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <span className="font-display text-2xl font-black italic tracking-wider text-white">
                  SHOESY<span className="text-brand-500">.</span>
                </span>
              </Link>
              <p className="text-sm text-zinc-400 max-w-sm leading-relaxed">
                India&apos;s premium sneaker destination. Bringing you the most hyped kicks,
                iconic heritage retro releases, and next-generation performance running shoes.
              </p>
              <div className="pt-2">
                <span className="text-xs uppercase font-bold text-zinc-400 tracking-wider block mb-2">
                  Accepted Payments
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {["Cash on Delivery", "Razorpay", "UPI", "RuPay", "Visa", "Mastercard"].map(
                    (method) => (
                      <span
                        key={method}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-zinc-900 text-zinc-300 border border-zinc-800"
                      >
                        {method}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Shop Kicks
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <Link href="/shop" className="hover:text-brand-400 transition-colors">
                    All Sneakers
                  </Link>
                </li>
                <li>
                  <Link href="/shop?brand=Nike" className="hover:text-brand-400 transition-colors">
                    Nike
                  </Link>
                </li>
                <li>
                  <Link href="/shop?brand=Adidas" className="hover:text-brand-400 transition-colors">
                    Adidas Originals
                  </Link>
                </li>
                <li>
                  <Link href="/shop?brand=Puma" className="hover:text-brand-400 transition-colors">
                    Puma
                  </Link>
                </li>
                <li>
                  <Link href="/shop?brand=Asics" className="hover:text-brand-400 transition-colors">
                    Asics Running
                  </Link>
                </li>
                <li>
                  <Link href="/shop?featured=true" className="hover:text-brand-400 transition-colors">
                    Featured Drops
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Support */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Support
              </h4>
              <ul className="space-y-2.5 text-xs font-medium">
                <li>
                  <Link href="/orders" className="hover:text-brand-400 transition-colors">
                    Track Your Order
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="hover:text-brand-400 transition-colors">
                    Saved Wishlist
                  </Link>
                </li>
                <li>
                  <span className="text-zinc-500 cursor-not-allowed">
                    Size Guide (UK / US / EU)
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 cursor-not-allowed">
                    Return Policy
                  </span>
                </li>
                <li>
                  <span className="text-zinc-500 cursor-not-allowed">
                    Contact: support@shoesy.demo
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-white mb-4">
                Sneaker Club
              </h4>
              <p className="text-xs text-zinc-400 mb-3 leading-relaxed">
                Get early drop access, exclusive restock alerts, and 10% off your first order.
              </p>
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded-xl bg-zinc-900 border border-zinc-800 focus:border-brand-500 focus:outline-none text-white placeholder:text-zinc-500"
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute right-3 top-3.5" />
                </div>
                <Button type="submit" size="sm" className="w-full font-bold text-xs h-9">
                  Join Club
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </form>
            </div>
          </div>
        </Container>
      </div>

      {/* Copyright */}
      <div className="border-t border-zinc-900 py-6 text-center text-xs text-zinc-500">
        <Container>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <p suppressHydrationWarning>© {new Date().getFullYear()} SHOESY Inc. Built with Next.js 14, Prisma, PostgreSQL & Tailwind CSS.</p>
            <p className="text-zinc-400 font-medium">Demo Portfolio Project for Vercel Deployment</p>
          </div>
        </Container>
      </div>
    </footer>
  );
}

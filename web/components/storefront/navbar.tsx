"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  Heart,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  ShieldAlert,
  Flame,
  Sun,
  Moon,
} from "lucide-react";
import { useCartStore } from "@/lib/store/cart";
import { useWishlist } from "@/lib/hooks/use-wishlist";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { useFocusTrap } from "@/lib/hooks/use-focus-trap";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const { theme, toggleTheme } = useTheme();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const mobileRef = useFocusTrap(isMobileMenuOpen, () => setIsMobileMenuOpen(false), "(max-width: 767px)");
  const accountRef = useFocusTrap(isUserMenuOpen, () => setIsUserMenuOpen(false));

  useEffect(() => {
    const closeSearch = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsSearchOpen(false);
    };
    document.addEventListener("keydown", closeSearch);
    return () => document.removeEventListener("keydown", closeSearch);
  }, []);

  const cartItemCount = useCartStore((state) => state.getTotalItems());
  const openCart = useCartStore((state) => state.openCart);
  const { wishlistCount } = useWishlist();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Do not render storefront navbar inside admin portal
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setIsMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop All", href: "/shop" },
    { label: "Trending", href: "/shop?sort=rating" },
    { label: "Featured", href: "/shop?featured=true" },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? "bg-white/85 dark:bg-zinc-950/85 backdrop-blur-md shadow-sm border-b border-zinc-200/80 dark:border-zinc-800/80 py-1"
          : "bg-white/70 dark:bg-zinc-950/70 backdrop-blur-sm border-b border-zinc-200/40 dark:border-zinc-800/40 py-2.5"
      }`}
    >
      <Container>
        <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
          {/* Mobile menu trigger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 rounded-lg"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 12, scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-9 h-9 rounded-xl bg-brand-700 flex items-center justify-center text-white shadow-md shadow-brand-500/30"
            >
              <Flame className="w-5 h-5 fill-current" />
            </motion.div>
            <div className="flex flex-col">
              <span className="font-display text-2xl sm:text-3xl font-black italic tracking-wider text-zinc-900 dark:text-white leading-none">
                SHOESY<span className="text-brand-700 dark:text-brand-400">.</span>
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 dark:text-zinc-400 font-semibold leading-tight">
                Store
              </span>
            </div>
          </Link>

          {/* Desktop Nav Links with Sliding Active Underline */}
          <nav className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname === link.href ||
                    (link.href !== "/" && pathname.startsWith(link.href.split("?")[0]));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors py-1 ${
                    isActive
                      ? "text-brand-600 dark:text-brand-400"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNavIndicator"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden lg:flex items-center relative max-w-xs w-full"
          >
            <input
              aria-label="Search products"
              type="text"
              placeholder="Search kicks, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-4 text-xs font-medium rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 border border-transparent focus:border-brand-500 focus:bg-white dark:focus:bg-zinc-950 focus:outline-none transition-all placeholder:text-zinc-400"
            />
            <Search className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Action Icons */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* Search Icon (Mobile / Tablet) */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="lg:hidden p-2 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Dark/Light Mode Toggle with Smooth Icon Morph */}
            <button
              onClick={toggleTheme}
              className="p-2 text-zinc-600 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Toggle dark/light theme"
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={theme}
                  initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                  animate={{ rotate: 0, scale: 1, opacity: 1 }}
                  exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Moon className="w-4 h-4 text-zinc-700" />
                  )}
                </motion.div>
              </AnimatePresence>
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="View Wishlist"
            >
              <Heart className="w-4 h-4" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-black bg-rose-500 text-white rounded-full px-1 shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Bag Icon with Animated Bounce Badge */}
            <button
              onClick={openCart}
              className="relative p-2 text-zinc-600 dark:text-zinc-300 hover:text-brand-500 dark:hover:text-brand-400 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
              aria-label="Open Shopping Bag"
            >
              <ShoppingBag className="w-4 h-4" />
              {mounted && cartItemCount > 0 && (
                <AnimatePresence mode="popLayout">
                  <motion.span
                    key={cartItemCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [1, 1.35, 1], opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut", times: [0, 0.5, 1] }}
                    className="absolute top-1 right-1 min-w-[16px] h-[16px] flex items-center justify-center text-[9px] font-black bg-brand-700 text-white rounded-full px-1 shadow-sm"
                  >
                    {cartItemCount}
                  </motion.span>
                </AnimatePresence>
              )}
            </button>

            {/* Admin Badge for Admin Users */}
            {mounted && session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-black uppercase tracking-wider text-brand-600 bg-brand-50 hover:bg-brand-100 dark:text-brand-400 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 rounded-lg border border-brand-200 dark:border-brand-800 transition-colors"
                title="Go to Admin Dashboard"
              >
                <ShieldAlert className="w-3 h-3" />
                Admin
              </Link>
            )}

            {/* User Account / Auth */}
            <div className="relative">
              {status === "authenticated" && session?.user ? (
                <div>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                    aria-label="User menu"
                  >
                    <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20">
                      {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase() || "U"}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isUserMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        data-focus-backdrop
                        onClick={() => setIsUserMenuOpen(false)}
                      />
                      <motion.div
                        ref={accountRef}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Account"
                        tabIndex={-1}
                        initial={{ opacity: 0, scale: 0.95, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-zinc-900 shadow-xl border border-zinc-200 dark:border-zinc-800 p-2 z-50"
                      >
                        <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                          <p className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {session.user.name || "Customer"}
                          </p>
                          <p className="text-[11px] text-zinc-600 dark:text-zinc-400 truncate">
                            {session.user.email}
                          </p>
                          {session.user.role === "ADMIN" && (
                            <span className="inline-block mt-1 text-[10px] font-extrabold uppercase bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300 px-2 py-0.5 rounded-full">
                              Admin
                            </span>
                          )}
                        </div>

                        <div className="py-1">
                          <Link
                            href="/orders"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Package className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            My Orders
                          </Link>
                          <Link
                            href="/wishlist"
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Heart className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                            Saved Items
                          </Link>
                          {session.user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setIsUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-brand-600 dark:text-brand-400 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800">
                          <button
                            onClick={() => {
                              setIsUserMenuOpen(false);
                              signOut({ callbackUrl: "/" });
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </div>
              ) : (
                <Button size="sm" asChild className="hidden sm:inline-flex h-8 text-xs font-bold">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Search Overlay */}
        {isSearchOpen && (
          <div className="lg:hidden pb-3 pt-1 animate-in slide-in-from-top-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                aria-label="Search products"
                type="text"
                placeholder="Search kicks, brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full h-10 pl-10 pr-4 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:border-brand-500 transition-all"
              />
              <Search className="w-4 h-4 text-zinc-600 dark:text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
            </form>
          </div>
        )}

        {/* Animated Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              ref={mobileRef}
              role="dialog"
              aria-modal="true"
              aria-label="Store navigation"
              tabIndex={-1}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden overflow-hidden border-t border-zinc-200 dark:border-zinc-800"
            >
              <div className="py-4 flex flex-col gap-1.5">
                <button onClick={() => setIsMobileMenuOpen(false)} className="self-end p-2" aria-label="Close navigation"><X className="w-5 h-5" /></button>
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                <div className="pt-3 mt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-1 px-2">
                  {status === "authenticated" ? (
                    <>
                      <Link
                        href="/orders"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200 flex items-center gap-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
                      >
                        <Package className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        My Orders
                      </Link>
                      {session?.user?.role === "ADMIN" && (
                        <Link
                          href="/admin"
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="px-3 py-2 text-xs font-semibold text-brand-600 flex items-center gap-2 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-950/40"
                        >
                          <ShieldAlert className="w-4 h-4 text-brand-700 dark:text-brand-400" />
                          Admin Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="text-left px-3 py-2 text-xs font-semibold text-rose-600 flex items-center gap-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <Button asChild size="sm" onClick={() => setIsMobileMenuOpen(false)} className="w-full">
                      <Link href="/login">Sign In &rarr;</Link>
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Container>
    </header>
  );
}

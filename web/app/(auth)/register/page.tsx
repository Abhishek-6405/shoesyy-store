"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Flame, UserPlus } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

// useSearchParams() needs a Suspense boundary for static prerendering.
export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12" aria-busy="true">
          <Skeleton className="h-[640px] w-full max-w-md rounded-3xl" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toastError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      toastError("Password must be at least 6 characters");
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim() || undefined,
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to create account");
      }

      success("Account created successfully! Signing you in...");

      // Automatically sign in
      const signInRes = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInRes?.error) {
        router.push(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed";
      toastError(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-md">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-700 dark:text-brand-400 mb-2">
            <Flame className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
            Join Shoesy
          </h1>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Create an account for personalized drops, wishlist sync, and order tracking.
          </p>
        </div>

        <form
          onSubmit={handleRegister}
          className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-4"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Full Name
            </label>
            <Input aria-label="e.g. Vikram Malhotra"
              type="text"
              placeholder="e.g. Vikram Malhotra"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Username *
            </label>
            <Input aria-label="e.g. vikram_sneakers"
              type="text"
              placeholder="e.g. vikram_sneakers"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Email Address *
            </label>
            <Input aria-label="vikram@example.com"
              type="email"
              placeholder="vikram@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Password (min. 6 chars) *
            </label>
            <Input aria-label="••••••••"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Confirm Password *
            </label>
            <Input aria-label="••••••••"
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-12 text-sm font-bold shadow-xl shadow-brand-500/20 mt-2"
          >
            {isLoading ? (
              "Creating Your Account..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <UserPlus className="w-4 h-4" />
                Register Account
              </span>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Already have an account?{" "}
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-brand-700 dark:text-brand-400 hover:underline"
              >
                Sign In
              </Link>
            </p>
          </div>
        </form>
      </Container>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Flame, ShieldCheck, UserCheck, ArrowRight, Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error: toastError } = useToast();

  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleFillDemo = (type: "user" | "admin") => {
    if (type === "user") {
      setIdentifier("user@shoesy.demo");
      setPassword("user123");
    } else {
      setIdentifier("admin@shoesy.demo");
      setPassword("admin123");
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier || !password) {
      toastError("Please enter your email/username and password");
      return;
    }

    try {
      setIsLoading(true);
      const res = await signIn("credentials", {
        email: identifier,
        password,
        redirect: false,
      });

      if (res?.error) {
        toastError(res.error);
        setIsLoading(false);
        return;
      }

      success("Signed in successfully! Welcome back.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      toastError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-20">
      <Container className="max-w-md">
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 text-brand-500 mb-2">
            <Flame className="w-8 h-8" />
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-black italic uppercase tracking-tight text-zinc-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Sign in to access your orders, saved kicks, and express checkout.
          </p>
        </div>

        {/* Demo Credentials Quick Fill Banner */}
        <div className="p-4 rounded-2xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/50 dark:bg-brand-950/20 mb-6 space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-500" />
            <span className="text-xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">
              Live Demo Quick-Access
            </span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
            Click either button to autofill verified portfolio credentials:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillDemo("user")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-brand-500 transition-colors shadow-sm"
            >
              <UserCheck className="w-3.5 h-3.5 text-brand-500" />
              Use Demo User
            </button>
            <button
              type="button"
              onClick={() => handleFillDemo("admin")}
              className="flex items-center justify-center gap-1.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-brand-200 dark:border-brand-800 text-xs font-bold text-zinc-800 dark:text-zinc-200 hover:border-brand-500 transition-colors shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-brand-500" />
              Use Demo Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-md space-y-4"
        >
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="user@shoesy.demo"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <Mail className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 block mb-1.5">
              Password
            </label>
            <div className="relative">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <Lock className="w-4 h-4 text-zinc-400 absolute right-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            size="lg"
            className="w-full h-12 text-sm font-bold shadow-xl shadow-brand-500/20 mt-2"
          >
            {isLoading ? (
              "Signing In..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In to Shoesy
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>

          <div className="text-center pt-2">
            <p className="text-xs text-zinc-500">
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`}
                className="font-bold text-brand-500 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </form>
      </Container>
    </div>
  );
}

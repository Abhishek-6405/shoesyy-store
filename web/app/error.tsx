"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Runtime error caught:", error);
  }, [error]);

  return (
    <div className="py-24 sm:py-32 flex items-center justify-center">
      <Container className="text-center max-w-lg">
        <div className="inline-flex p-4 rounded-3xl bg-rose-500/10 text-rose-500 mb-6">
          <AlertCircle className="w-12 h-12" />
        </div>
        <h1 className="text-3xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
          Something went wrong
        </h1>
        <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
          An unexpected error occurred while loading this page. Please try again or return to the home page.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={() => reset()} className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Try Again
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

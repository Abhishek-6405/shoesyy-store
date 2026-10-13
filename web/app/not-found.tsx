import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Flame, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="py-24 sm:py-32 flex items-center justify-center">
      <Container className="text-center max-w-lg">
        <div className="inline-flex p-4 rounded-3xl bg-brand-500/10 text-brand-500 mb-6">
          <Flame className="w-12 h-12" />
        </div>
        <h1 className="text-7xl sm:text-8xl font-black italic tracking-tighter text-zinc-900 dark:text-white">
          404
        </h1>
        <h2 className="text-2xl font-black uppercase tracking-tight mt-2 text-zinc-900 dark:text-white">
          Kicks Not Found
        </h2>
        <p className="text-sm text-zinc-500 mt-3 leading-relaxed">
          The sneaker or page you&apos;re looking for has already dropped out of stock or doesn&apos;t exist.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild>
            <Link href="/shop">Browse All Sneakers</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </Container>
    </div>
  );
}

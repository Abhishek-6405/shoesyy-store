import React from "react";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
          Add New Sneaker
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Create a new catalog item with images, sizing variants, colorways, and inventory.
        </p>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}

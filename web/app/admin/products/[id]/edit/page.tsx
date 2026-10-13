import React from "react";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const dynamic = "force-dynamic";

interface EditProductPageProps {
  params: {
    id: string;
  };
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: { category: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  if (!product) {
    notFound();
  }

  const formattedProduct = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: Number(product.price),
    brand: product.brand,
    categoryId: product.categoryId,
    images: product.images,
    sizes: product.sizes,
    colors: product.colors,
    stock: product.stock,
    featured: product.featured,
    isActive: product.isActive,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
          Edit Sneaker: {product.name}
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Update price, imagery, inventory counts, or catalog visibility.
        </p>
      </div>

      <ProductForm
        initialData={formattedProduct}
        categories={categories}
        isEdit={true}
      />
    </div>
  );
}

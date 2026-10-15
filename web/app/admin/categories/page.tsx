import React from "react";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Manage categories", "SHOESY category management.", undefined, true);
import prisma from "@/lib/prisma";
import { CategoriesManager, CategoryItem } from "@/components/admin/categories-manager";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  const categoriesRaw = await prisma.category.findMany({
    include: {
      _count: {
        select: { products: true },
      },
    },
    orderBy: { name: "asc" },
  });

  const categories: CategoryItem[] = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    image: c.image,
    productCount: c._count.products,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CategoriesManager initialCategories={categories} />;
}

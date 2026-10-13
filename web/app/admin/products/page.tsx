import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { ProductsTable } from "@/components/admin/products-table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

interface AdminProductsPageProps {
  searchParams: {
    page?: string;
    search?: string;
    brand?: string;
    category?: string;
    status?: string;
    sort?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const page = Math.max(1, Number(searchParams.page) || 1);
  const limit = 10;
  const skip = (page - 1) * limit;

  const search = searchParams.search?.trim();
  const brand = searchParams.brand?.trim();
  const category = searchParams.category?.trim();
  const status = searchParams.status?.trim() || "all";
  const sort = searchParams.sort || "newest";

  const where: Prisma.ProductWhereInput = {};

  if (status === "active") {
    where.isActive = true;
  } else if (status === "inactive") {
    where.isActive = false;
  }

  if (brand && brand !== "all") {
    where.brand = { equals: brand, mode: "insensitive" };
  }

  if (category && category !== "all") {
    where.OR = [
      { categoryId: category },
      { category: { slug: category } },
    ];
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { brand: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      },
    ];
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };
  else if (sort === "price-asc") orderBy = { price: "asc" };
  else if (sort === "price-desc") orderBy = { price: "desc" };
  else if (sort === "stock-asc") orderBy = { stock: "asc" };
  else if (sort === "stock-desc") orderBy = { stock: "desc" };
  else if (sort === "name-asc") orderBy = { name: "asc" };

  const [total, productsRaw, allBrandsRaw, categories] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.findMany({
      select: { brand: true },
      distinct: ["brand"],
    }),
    prisma.category.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const products = productsRaw.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    price: Number(p.price),
    stock: p.stock,
    images: p.images,
    featured: p.featured,
    isActive: p.isActive,
    category: p.category,
    createdAt: p.createdAt.toISOString(),
  }));

  const brands = allBrandsRaw.map((b) => b.brand).sort();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-zinc-900 dark:text-white">
            Sneaker Products
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Manage your entire footwear inventory, prices, sizing, and storefront visibility.
          </p>
        </div>

        <Button asChild variant="brand" size="sm">
          <Link href="/admin/products/new">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Sneaker
          </Link>
        </Button>
      </div>

      {/* Interactive Products Table */}
      <ProductsTable
        products={products}
        pagination={{
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }}
        brands={brands}
        categories={categories}
        currentFilters={{
          search: search || "",
          brand: brand || "all",
          category: category || "all",
          status,
          sort,
        }}
      />
    </div>
  );
}

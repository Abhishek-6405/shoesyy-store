import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });

    return successResponse(
      categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        image: c.image,
        productCount: c._count.products,
        createdAt: c.createdAt,
      }))
    );
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const body = await req.json();
    const validated = categorySchema.parse(body);

    const slug = validated.slug ? slugify(validated.slug) : slugify(validated.name);

    const existing = await prisma.category.findFirst({
      where: {
        OR: [{ name: validated.name }, { slug }],
      },
    });

    if (existing) {
      return errorResponse("A category with this name or slug already exists", 409);
    }

    const category = await prisma.category.create({
      data: {
        name: validated.name,
        slug,
        image: validated.image ?? null,
      },
    });

    return successResponse(category, 201);
  } catch (err) {
    return handleApiError(err);
  }
}

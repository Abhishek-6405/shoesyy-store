import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { productUpdateSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { slugify } from "@/lib/utils";

interface Params {
  params: {
    id: string;
  };
}

export async function PUT(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;
    const body = await req.json();
    const validated = productUpdateSchema.parse(body);

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return errorResponse("Product not found", 404);
    }

    // Handle slug change if provided
    let newSlug = existingProduct.slug;
    if (validated.slug && validated.slug !== existingProduct.slug) {
      newSlug = slugify(validated.slug);
      const slugClash = await prisma.product.findFirst({
        where: { slug: newSlug, NOT: { id } },
      });
      if (slugClash) {
        newSlug = `${newSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    // Verify category if changed
    if (validated.categoryId) {
      const categoryExists = await prisma.category.findUnique({
        where: { id: validated.categoryId },
      });
      if (!categoryExists) {
        return errorResponse("Category not found", 404);
      }
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(validated.name && { name: validated.name }),
        slug: newSlug,
        ...(validated.description && { description: validated.description }),
        ...(validated.price !== undefined && { price: validated.price }),
        ...(validated.brand && { brand: validated.brand }),
        ...(validated.categoryId && { categoryId: validated.categoryId }),
        ...(validated.images && { images: validated.images }),
        ...(validated.sizes && { sizes: validated.sizes }),
        ...(validated.colors && { colors: validated.colors }),
        ...(validated.stock !== undefined && { stock: validated.stock }),
        ...(validated.featured !== undefined && { featured: validated.featured }),
      },
      include: {
        category: true,
      },
    });

    return successResponse({
      ...updated,
      price: Number(updated.price),
    });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;

    const existing = await prisma.product.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Product not found", 404);
    }

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get("permanent") === "true";

    if (permanent) {
      await prisma.product.delete({
        where: { id },
      });
    } else {
      // Soft-delete: mark inactive so historical orders remain intact
      await prisma.product.update({
        where: { id },
        data: { isActive: false },
      });
    }

    return successResponse({
      message: `Product "${existing.name}" ${permanent ? "permanently deleted" : "deactivated / soft-deleted"} successfully`,
      deletedId: id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

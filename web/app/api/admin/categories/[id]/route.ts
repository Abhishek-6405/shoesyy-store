import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { categorySchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { revalidateCatalog } from "@/lib/catalog";
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
    const validated = categorySchema.parse(body);

    const existing = await prisma.category.findUnique({
      where: { id },
    });

    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    const slug = validated.slug ? slugify(validated.slug) : slugify(validated.name);

    const slugConflict = await prisma.category.findFirst({
      where: {
        slug,
        NOT: { id },
      },
    });

    if (slugConflict) {
      return errorResponse("Another category already uses this name or slug", 409);
    }

    const updated = await prisma.category.update({
      where: { id },
      data: {
        name: validated.name,
        slug,
        image: validated.image !== undefined ? validated.image : existing.image,
      },
    });

    revalidateCatalog();
    return successResponse(updated);
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

    const existing = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!existing) {
      return errorResponse("Category not found", 404);
    }

    if (existing._count.products > 0) {
      return errorResponse(
        `Cannot delete category "${existing.name}" because it still contains ${existing._count.products} products. Reassign or delete those products first.`,
        400
      );
    }

    await prisma.category.delete({
      where: { id },
    });

    revalidateCatalog();
    return successResponse({
      message: `Category "${existing.name}" deleted successfully`,
      deletedId: id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

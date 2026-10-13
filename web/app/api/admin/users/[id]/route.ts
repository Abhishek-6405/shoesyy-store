import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { isDemoAccount } from "@/lib/constants";
import { Role } from "@prisma/client";
import { z } from "zod";

interface Params {
  params: {
    id: string;
  };
}

const updateUserRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { user, error, status } = await requireAdmin();
    if (error || !user) {
      return errorResponse(error || "Unauthorized", status);
    }

    const { id } = params;
    const body = await req.json();
    const validated = updateUserRoleSchema.parse(body);

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return errorResponse("User not found", 404);
    }

    // Demo Protection Guard: Cannot demote or change demo accounts
    if (isDemoAccount(targetUser.email)) {
      return errorResponse(
        "Demo accounts (admin@shoesy.demo, user@shoesy.demo) are protected and cannot be modified or demoted.",
        403
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { role: validated.role },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

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

    const targetUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return errorResponse("User not found", 404);
    }

    // Demo Protection Guard: Cannot delete demo accounts
    if (isDemoAccount(targetUser.email)) {
      return errorResponse(
        "Demo accounts (admin@shoesy.demo, user@shoesy.demo) are protected and cannot be deleted.",
        403
      );
    }

    // Prevent admin from deleting their own current account
    if (targetUser.id === user.id) {
      return errorResponse("You cannot delete your own administrative account.", 400);
    }

    await prisma.user.delete({
      where: { id },
    });

    return successResponse({
      message: `User ${targetUser.email} was deleted successfully`,
      deletedId: id,
    });
  } catch (err) {
    return handleApiError(err);
  }
}

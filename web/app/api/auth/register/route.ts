import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import prisma from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-response";
import { Role } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limit = rateLimit("register", req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown");
  if (!limit.allowed) {
    const response = errorResponse("Too many registration attempts. Try again in 15 minutes.", 429);
    response.headers.set("Retry-After", String(limit.retryAfter));
    return response;
  }
  try {
    const body = await req.json();
    const validated = registerSchema.parse(body);

    const existingEmail = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });

    if (existingEmail) {
      return errorResponse("An account with this email already exists", 409);
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: validated.username.toLowerCase() },
    });

    if (existingUsername) {
      return errorResponse("Username is already taken. Please choose another.", 409);
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        username: validated.username.toLowerCase(),
        name: validated.name?.trim() || validated.username,
        password: hashedPassword,
        role: Role.USER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return successResponse(newUser, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

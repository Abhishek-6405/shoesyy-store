import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400, details?: unknown) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      ...(details ? { details } : {}),
    },
    { status }
  );
}

export class ApiError extends Error {
  constructor(message: string, public status = 400) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(err: unknown) {
  if (err instanceof ApiError) {
    return errorResponse(err.message, err.status);
  }

  if (err instanceof ZodError) {
    const issues = err.issues || [];
    const formatted = issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return errorResponse("Validation error", 422, formatted);
  }

  if (err instanceof SyntaxError) {
    return errorResponse("Invalid JSON request body", 400);
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") return errorResponse("A record with this value already exists", 409);
    if (err.code === "P2025") return errorResponse("Record not found", 404);
  }

  console.error("API Route Error:", err);
  // Internal error details (DB messages, stack traces) are logged, never returned.
  return errorResponse("An unexpected server error occurred", 500);
}

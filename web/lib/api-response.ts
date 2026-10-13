import { NextResponse } from "next/server";
import { ZodError } from "zod";

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

export function handleApiError(err: unknown) {
  console.error("API Route Error:", err);

  if (err instanceof ZodError) {
    const issues = err.issues || [];
    const formatted = issues.map((e) => ({
      field: e.path.join("."),
      message: e.message,
    }));
    return errorResponse("Validation error", 422, formatted);
  }

  if (err instanceof Error) {
    return errorResponse(err.message, 500);
  }

  return errorResponse("An unexpected server error occurred", 500);
}

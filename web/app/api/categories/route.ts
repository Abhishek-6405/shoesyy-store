import { successResponse, handleApiError } from "@/lib/api-response";
import { getCategoriesWithCounts } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return successResponse(await getCategoriesWithCounts());
  } catch (err) {
    return handleApiError(err);
  }
}

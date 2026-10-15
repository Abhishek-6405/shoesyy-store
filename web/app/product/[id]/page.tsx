import { redirect } from "next/navigation";
import { pageMetadata } from "@/lib/seo";
export const metadata = pageMetadata("Product", "Explore premium footwear at SHOESY.", undefined, true);

export default function ProductRedirect({ params }: { params: { id: string } }) {
  redirect(`/products/${params.id}`);
}

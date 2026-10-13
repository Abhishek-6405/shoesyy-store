import { redirect } from "next/navigation";

export default function ProductRedirect({ params }: { params: { id: string } }) {
  redirect(`/products/${params.id}`);
}

import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminLayoutClient } from "@/components/admin/admin-layout-client";

export const metadata = {
  title: "SHOESY Admin | Management Portal",
  description: "E-Commerce administration panel for SHOESY.",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user?.role !== "ADMIN") {
    redirect("/login?callbackUrl=/admin");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}

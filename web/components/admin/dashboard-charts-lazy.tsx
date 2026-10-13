"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardChartsProps } from "@/components/admin/dashboard-charts";

function ChartsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading charts">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[360px] lg:col-span-2" />
        <Skeleton className="h-[360px]" />
      </div>
      <Skeleton className="h-[320px]" />
    </div>
  );
}

// Recharts is large; load it in a separate chunk after the dashboard shell renders.
const DashboardChartsInner = dynamic(
  () => import("@/components/admin/dashboard-charts").then((m) => m.DashboardCharts),
  { ssr: false, loading: ChartsSkeleton }
);

export function DashboardChartsLazy(props: DashboardChartsProps) {
  return <DashboardChartsInner {...props} />;
}

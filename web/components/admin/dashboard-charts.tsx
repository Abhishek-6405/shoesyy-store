"use client";

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { TrendingUp, PieChart as PieIcon, Trophy } from "lucide-react";

interface TimelineItem {
  date: string;
  label: string;
  revenue: number;
  orders: number;
}

interface StatusItem {
  status: string;
  count: number;
  label: string;
  color: string;
}

interface TopProductItem {
  productId: string;
  name: string;
  brand: string;
  image: string;
  unitsSold: number;
  revenue: number;
}

export interface DashboardChartsProps {
  timeline: TimelineItem[];
  ordersByStatus: StatusItem[];
  topSellingProducts: TopProductItem[];
}

export function DashboardCharts({
  timeline,
  ordersByStatus,
  topSellingProducts,
}: DashboardChartsProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 h-80 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
        <div className="h-80 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: Revenue Trend (2 cols) & Orders by Status (1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue 30-Day Timeline Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-500" />
                <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                  30-Day Revenue Trend
                </h3>
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Daily settled revenue across all storefront sales
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800 font-mono">
              Last 30 Days
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff4d15" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#ff4d15" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="label"
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val >= 1000 ? (val / 1000).toFixed(0) + "k" : val}`}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload as TimelineItem;
                      return (
                        <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-800 text-xs">
                          <div className="font-bold text-zinc-300">{label}</div>
                          <div className="text-brand-400 font-black text-sm mt-1">
                            {formatPrice(data.revenue)}
                          </div>
                          <div className="text-zinc-400 text-[11px] mt-0.5">
                            {data.orders} order{data.orders === 1 ? "" : "s"}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ff4d15"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGradient)"
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders by Status Donut Chart */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-brand-500" />
              <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
                Orders by Status
              </h3>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-2">
            Distribution across order lifecycle
          </p>

          <div className="h-56 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="label"
                  isAnimationActive={true}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: unknown, name: unknown) => [`${val ?? 0} orders`, String(name ?? "")]}
                  contentStyle={{
                    backgroundColor: "#18181b",
                    borderColor: "#27272a",
                    borderRadius: "0.75rem",
                    color: "#ffffff",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs">
            {ordersByStatus.map((s) => (
              <div key={s.status} className="flex items-center justify-between px-2 py-1 rounded-lg bg-zinc-50 dark:bg-zinc-800/50">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-zinc-600 dark:text-zinc-400 truncate">{s.label}</span>
                </div>
                <span className="font-bold text-zinc-900 dark:text-white ml-2">{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Chart: Top 5 Selling Products */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <h3 className="font-display font-bold text-lg text-zinc-900 dark:text-white uppercase tracking-wider">
              Top 5 Selling Products
            </h3>
          </div>
          <span className="text-xs text-zinc-500">By total volume sold</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topSellingProducts}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <XAxis type="number" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#888888"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={140}
                tickFormatter={(val) => (val.length > 18 ? val.substring(0, 18) + "..." : val)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TopProductItem;
                    return (
                      <div className="bg-zinc-900 text-white p-3 rounded-xl shadow-xl border border-zinc-800 text-xs">
                        <div className="font-bold text-zinc-200">{data.name}</div>
                        <div className="text-zinc-400 text-[11px]">{data.brand}</div>
                        <div className="mt-1 flex items-center justify-between gap-4">
                          <span className="text-zinc-400">Units Sold:</span>
                          <span className="font-black text-brand-400">{data.unitsSold} pairs</span>
                        </div>
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-zinc-400">Total Revenue:</span>
                          <span className="font-bold text-emerald-400">{formatPrice(data.revenue)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="unitsSold"
                fill="#ff4d15"
                radius={[0, 8, 8, 0]}
                barSize={20}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

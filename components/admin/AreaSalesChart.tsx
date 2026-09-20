"use client";

import * as React from "react";
import * as Recharts from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

type Point = { label: string; sales: number; orders?: number };

export default function AreaSalesChart({ data }: { data: Point[] }) {
  return (
    <ChartContainer id="consultation-area" config={{ sales: { label: 'درخواست مشاوره', color: '#d97706' } }} className="w-full">
      {/* AreaChart will be rendered inside the ResponsiveContainer provided by ChartContainer */}
      <Recharts.AreaChart data={data} margin={{ top: 10, right: 12, left: 0, bottom: 36 }}>
        <defs>
          <linearGradient id="gradSales" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#d97706" stopOpacity={0.85} />
            <stop offset="100%" stopColor="#d97706" stopOpacity={0.06} />
          </linearGradient>
        </defs>

        <Recharts.CartesianGrid horizontal={true} vertical={false} stroke="#f3f4f6" />
        <Recharts.XAxis dataKey="label" tickLine={false} axisLine={false} padding={{ left: 8, right: 8 }} tick={{ fontSize: 12 }} />
        <Recharts.YAxis tickLine={false} axisLine={false} tickFormatter={(v) => Number(v).toLocaleString()} />

  <ChartTooltip content={<ChartTooltipContent />} />

        <Recharts.Area
          type="monotone"
          dataKey="sales"
          stroke="#d97706"
          strokeWidth={2.4}
          fill="url(#gradSales)"
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </Recharts.AreaChart>
    </ChartContainer>
  );
}

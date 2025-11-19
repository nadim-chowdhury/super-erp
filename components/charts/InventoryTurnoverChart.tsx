"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Package } from "lucide-react";

interface InventoryTurnoverChartProps {
  data: { category: string; turnover: number; stock: number }[];
}

export function InventoryTurnoverChart({ data }: InventoryTurnoverChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Inventory Turnover
        </CardTitle>
        <CardDescription>Stock turnover by category</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="category"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--background)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                color: "var(--foreground)",
              }}
              itemStyle={{
                color: "var(--foreground)",
              }}
              labelStyle={{
                color: "var(--foreground)",
              }}
              cursor={{ fill: "transparent" }}
            />
            <Legend />
            <Bar
              dataKey="turnover"
              fill="var(--primary)"
              name="Turnover Rate"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="stock"
              fill="hsl(142, 76%, 36%)"
              name="Stock Level"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

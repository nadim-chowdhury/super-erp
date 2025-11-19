"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users } from "lucide-react";

interface CustomerAcquisitionFunnelProps {
  data: { stage: string; count: number; percentage: number }[];
}

export function CustomerAcquisitionFunnel({
  data,
}: CustomerAcquisitionFunnelProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Customer Acquisition Funnel
        </CardTitle>
        <CardDescription>
          Customer journey through acquisition stages
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              type="number"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
            />
            <YAxis
              dataKey="stage"
              type="category"
              className="text-xs"
              tick={{ fill: "var(--muted-foreground)" }}
              width={70}
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
            <Bar
              dataKey="count"
              fill="var(--primary)"
              radius={[0, 4, 4, 0]}
              fillOpacity={0.8}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

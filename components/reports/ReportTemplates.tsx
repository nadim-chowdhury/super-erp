"use client";

import { useState } from "react";
import { FileText, TrendingUp, Package, DollarSign, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReportConfig } from "./ReportBuilder";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  type: "sales" | "inventory" | "finance" | "customers";
  config: Omit<ReportConfig, "format">;
}

const templates: ReportTemplate[] = [
  {
    id: "sales-summary",
    name: "Sales Summary",
    description: "Monthly sales overview with revenue and order statistics",
    icon: TrendingUp,
    type: "sales",
    config: {
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      },
      filters: {},
      grouping: {
        enabled: true,
        by: "day",
      },
    },
  },
  {
    id: "inventory-report",
    name: "Inventory Report",
    description: "Current stock levels and inventory status by category",
    icon: Package,
    type: "inventory",
    config: {
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      },
      filters: {},
      grouping: {
        enabled: true,
        by: "category",
      },
    },
  },
  {
    id: "profit-loss",
    name: "Profit & Loss",
    description: "Financial P&L statement with income and expenses",
    icon: DollarSign,
    type: "finance",
    config: {
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
        end: new Date(),
      },
      filters: {},
      grouping: {
        enabled: true,
        by: "month",
      },
    },
  },
  {
    id: "customer-analysis",
    name: "Customer Analysis",
    description: "Customer acquisition and retention metrics",
    icon: Users,
    type: "customers",
    config: {
      dateRange: {
        start: new Date(new Date().setMonth(new Date().getMonth() - 3)),
        end: new Date(),
      },
      filters: {},
      grouping: {
        enabled: true,
        by: "month",
      },
    },
  },
];

interface ReportTemplatesProps {
  onSelectTemplate: (template: ReportTemplate) => void;
  currentType: "sales" | "inventory" | "finance" | "customers";
}

export function ReportTemplates({
  onSelectTemplate,
  currentType,
}: ReportTemplatesProps) {
  const filteredTemplates = templates.filter((t) => t.type === currentType);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {filteredTemplates.map((template) => {
        const Icon = template.icon;
        return (
          <Card
            key={template.id}
            className="cursor-pointer hover:border-primary transition-colors"
            onClick={() => onSelectTemplate(template)}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Icon className="h-5 w-5" />
                  {template.name}
                </CardTitle>
                <Badge variant="outline">Template</Badge>
              </div>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                Use Template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}



"use client";

import { useState } from "react";
import { Calendar, Filter, Group, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface ReportBuilderProps {
  onGenerate: (config: ReportConfig) => void;
  reportType: "sales" | "inventory" | "finance" | "customers";
}

export interface ReportConfig {
  dateRange: {
    start: Date;
    end: Date;
  };
  filters: {
    status?: string;
    category?: string;
    type?: string;
  };
  grouping: {
    enabled: boolean;
    by: "day" | "week" | "month" | "category" | "status" | "none";
  };
  format: "pdf" | "excel" | "csv";
}

export function ReportBuilder({ onGenerate, reportType }: ReportBuilderProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfig>({
    dateRange: {
      start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      end: new Date(),
    },
    filters: {},
    grouping: {
      enabled: false,
      by: "none",
    },
    format: "pdf",
  });

  const handleGenerate = () => {
    onGenerate(config);
    setOpen(false);
  };

  const updateDateRange = (field: "start" | "end", value: string) => {
    setConfig((prev) => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [field]: new Date(value),
      },
    }));
  };

  const updateFilter = (key: string, value: string) => {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [key]: value === "all" ? undefined : value,
      },
    }));
  };

  const updateGrouping = (enabled: boolean, by?: ReportConfig["grouping"]["by"]) => {
    setConfig((prev) => ({
      ...prev,
      grouping: {
        enabled,
        by: by || prev.grouping.by,
      },
    }));
  };

  const getGroupingOptions = () => {
    const base = ["none", "day", "week", "month"];
    if (reportType === "sales" || reportType === "inventory") {
      return [...base, "category", "status"];
    }
    return base;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Filter className="mr-2 h-4 w-4" />
          Build Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report Builder</DialogTitle>
          <DialogDescription>
            Customize your report with date ranges, filters, and grouping options
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Date Range */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={format(config.dateRange.start, "yyyy-MM-dd")}
                    onChange={(e) => updateDateRange("start", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={format(config.dateRange.end, "yyyy-MM-dd")}
                    onChange={(e) => updateDateRange("end", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Filter className="h-4 w-4" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportType === "sales" && (
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <Select
                    value={config.filters.status || "all"}
                    onValueChange={(value) => updateFilter("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="shipped">Shipped</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {reportType === "inventory" && (
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={config.filters.category || "all"}
                    onValueChange={(value) => updateFilter("category", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Clothing">Clothing</SelectItem>
                      <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                      <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {reportType === "finance" && (
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select
                    value={config.filters.type || "all"}
                    onValueChange={(value) => updateFilter("type", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="income">Income</SelectItem>
                      <SelectItem value="expense">Expense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Grouping */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Group className="h-4 w-4" />
                Grouping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Group By</Label>
                <Select
                  value={config.grouping.by}
                  onValueChange={(value) =>
                    updateGrouping(
                      value !== "none",
                      value as ReportConfig["grouping"]["by"]
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {getGroupingOptions().map((option) => (
                      <SelectItem key={option} value={option}>
                        {option === "none"
                          ? "No Grouping"
                          : option.charAt(0).toUpperCase() + option.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Export Format */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Download className="h-4 w-4" />
                Export Format
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={config.format}
                onValueChange={(value) =>
                  setConfig((prev) => ({
                    ...prev,
                    format: value as "pdf" | "excel" | "csv",
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>Generate Report</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}



"use client";

import { useState, useEffect } from "react";
import { useAppSelector } from "@/lib/store/hooks";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Download,
  FileText,
  BarChart3,
  PieChart,
  TrendingUp,
  Printer,
} from "lucide-react";
import { ReportBuilder, ReportConfig } from "@/components/reports/ReportBuilder";
import { ReportTemplates } from "@/components/reports/ReportTemplates";
import { ScheduledReports } from "@/components/reports/ScheduledReports";
import {
  generateSalesReport,
  generateInventoryReport,
  generateFinanceReport,
  generateCustomerReport,
} from "@/lib/utils/reportGenerator";
import { exportToCSV, exportToExcel } from "@/lib/utils/exportUtils";
import { exportToPDF } from "@/components/reports/PDFExport";
import { format } from "date-fns";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<
    "sales" | "inventory" | "finance" | "customers"
  >("sales");
  const [selectedTemplate, setSelectedTemplate] =
    useState<ReportConfig | null>(null);

  // Get data from Redux
  const salesData = useAppSelector((state) => state.sales.orders);
  const inventoryData = useAppSelector((state) => state.inventory.products);
  const financeData = useAppSelector((state) => state.finance.transactions);
  const customerData = useAppSelector((state) => state.customers.customers);

  const handleGenerateReport = async (config: ReportConfig) => {
    let reportData;

    switch (activeTab) {
      case "sales":
        reportData = generateSalesReport(salesData, config);
        break;
      case "inventory":
        reportData = generateInventoryReport(inventoryData, config);
        break;
      case "finance":
        reportData = generateFinanceReport(financeData, config);
        break;
      case "customers":
        reportData = generateCustomerReport(customerData, config);
        break;
    }

    if (!reportData) return;

    const filename = `${activeTab}-report-${format(new Date(), "yyyy-MM-dd")}`;

    switch (config.format) {
      case "pdf":
        await exportToPDF(reportData, `${filename}.pdf`);
        break;
      case "excel":
        exportToExcel(reportData, `${filename}.xlsx`);
        break;
      case "csv":
        exportToCSV(reportData, `${filename}.csv`);
        break;
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template.config);
    // Auto-generate with template config
    handleGenerateReport({
      ...template.config,
      format: "pdf", // Default format
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <MainLayout>
      <div className="space-y-6 print:space-y-4">
        <div className="flex items-center justify-between print:hidden">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
            <p className="text-muted-foreground">
              View and generate business reports
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" />
              Print
            </Button>
            <ReportBuilder
              onGenerate={handleGenerateReport}
              reportType={activeTab}
            />
          </div>
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as typeof activeTab)
          }
          className="space-y-4"
        >
          <TabsList className="print:hidden">
            <TabsTrigger value="sales">Sales Reports</TabsTrigger>
            <TabsTrigger value="inventory">Inventory Reports</TabsTrigger>
            <TabsTrigger value="finance">Financial Reports</TabsTrigger>
            <TabsTrigger value="customers">Customer Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-4">
            <div className="print:hidden">
              <ReportTemplates
                onSelectTemplate={handleTemplateSelect}
                currentType="sales"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Sales Overview
                  </CardTitle>
                  <CardDescription>Monthly sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Sales
                      </span>
                      <span className="text-2xl font-bold">
                        $
                        {salesData
                          .filter((o) => o.paymentStatus === "paid")
                          .reduce((sum, o) => sum + o.total, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Orders
                      </span>
                      <span className="text-2xl font-bold">
                        {salesData.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Average Order Value
                      </span>
                      <span className="text-2xl font-bold">
                        $
                        {salesData.length > 0
                          ? (
                              salesData.reduce((sum, o) => sum + o.total, 0) /
                              salesData.length
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Sales Trends
                  </CardTitle>
                  <CardDescription>Growth analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        This Month
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        +12.5%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last Month
                      </span>
                      <span className="text-lg font-semibold">$111,250</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        This Year
                      </span>
                      <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                        +28.3%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="print:hidden">
              <ReportTemplates
                onSelectTemplate={handleTemplateSelect}
                currentType="inventory"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Inventory Status
                  </CardTitle>
                  <CardDescription>Current stock levels</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Products
                      </span>
                      <span className="text-2xl font-bold">
                        {inventoryData.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        In Stock
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {
                          inventoryData.filter((p) => p.status === "in_stock")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Low Stock
                      </span>
                      <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                        {
                          inventoryData.filter((p) => p.status === "low_stock")
                            .length
                        }
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Out of Stock
                      </span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        {
                          inventoryData.filter(
                            (p) => p.status === "out_of_stock"
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Category Distribution
                  </CardTitle>
                  <CardDescription>Products by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Array.from(
                      new Set(inventoryData.map((p) => p.category))
                    )
                      .map((category) => {
                        const count = inventoryData.filter(
                          (p) => p.category === category
                        ).length;
                        const percentage = (
                          (count / inventoryData.length) *
                          100
                        ).toFixed(0);
                        return (
                          <div
                            key={category}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm">{category}</span>
                            <span className="text-sm font-medium">
                              {percentage}%
                            </span>
                          </div>
                        );
                      })
                      .slice(0, 5)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4">
            <div className="print:hidden">
              <ReportTemplates
                onSelectTemplate={handleTemplateSelect}
                currentType="finance"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Financial Summary
                  </CardTitle>
                  <CardDescription>Income vs Expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Income
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        $
                        {financeData
                          .filter((t) => t.type === "income")
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Expenses
                      </span>
                      <span className="text-2xl font-bold text-red-600 dark:text-red-400">
                        $
                        {financeData
                          .filter((t) => t.type === "expense")
                          .reduce((sum, t) => sum + t.amount, 0)
                          .toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-sm font-medium">Net Profit</span>
                      <span className="text-2xl font-bold">
                        $
                        {(
                          financeData
                            .filter((t) => t.type === "income")
                            .reduce((sum, t) => sum + t.amount, 0) -
                          financeData
                            .filter((t) => t.type === "expense")
                            .reduce((sum, t) => sum + t.amount, 0)
                        ).toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Profit Margin
                  </CardTitle>
                  <CardDescription>Financial health metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Profit Margin
                      </span>
                      <span className="text-2xl font-bold">
                        {(() => {
                          const income = financeData
                            .filter((t) => t.type === "income")
                            .reduce((sum, t) => sum + t.amount, 0);
                          const expenses = financeData
                            .filter((t) => t.type === "expense")
                            .reduce((sum, t) => sum + t.amount, 0);
                          const profit = income - expenses;
                          return income > 0
                            ? ((profit / income) * 100).toFixed(1)
                            : "0.0";
                        })()}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <div className="print:hidden">
              <ReportTemplates
                onSelectTemplate={handleTemplateSelect}
                currentType="customers"
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Customer Overview
                  </CardTitle>
                  <CardDescription>Customer statistics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Total Customers
                      </span>
                      <span className="text-2xl font-bold">
                        {customerData.length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Active Customers
                      </span>
                      <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {customerData.filter((c) => c.status === "active").length}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        New This Month
                      </span>
                      <span className="text-2xl font-bold">
                        {
                          customerData.filter(
                            (c) =>
                              new Date(c.createdAt).getMonth() ===
                              new Date().getMonth()
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="print:break-inside-avoid">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Customer Growth
                  </CardTitle>
                  <CardDescription>Customer acquisition trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Average Order Value
                      </span>
                      <span className="text-lg font-semibold">
                        $
                        {customerData.length > 0
                          ? (
                              customerData.reduce(
                                (sum, c) => sum + c.totalSpent,
                                0
                              ) / customerData.length
                            ).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "0.00"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="print:hidden">
          <ScheduledReports />
        </div>
      </div>
    </MainLayout>
  );
}

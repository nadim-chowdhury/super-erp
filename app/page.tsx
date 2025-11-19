"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setStats,
  setRecentOrders,
  setTopProducts,
  setSalesChart,
} from "@/lib/store/slices/dashboardSlice";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  generateProducts,
  generateCustomers,
  generateOrders,
} from "@/lib/data/demoData";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { stats, recentOrders, topProducts } = useAppSelector(
    (state) => state.dashboard
  );

  useEffect(() => {
    // Generate demo data
    const products = generateProducts(100);
    const customers = generateCustomers(50);
    const orders = generateOrders(200, customers, products);

    // Calculate stats
    const totalRevenue = orders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);
    const totalOrders = orders.length;
    const totalCustomers = customers.filter(
      (c) => c.status === "active"
    ).length;
    const totalProducts = products.length;

    // Calculate growth (mock data)
    const revenueGrowth = 12.5;
    const ordersGrowth = 8.3;
    const customersGrowth = 15.2;
    const productsGrowth = 5.7;

    // Get recent orders
    const recent = orders
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);

    // Get top products
    const productSales = new Map<
      string,
      { name: string; sales: number; quantity: number }
    >();
    orders.forEach((order) => {
      order.items.forEach((item) => {
        const existing = productSales.get(item.productId) || {
          name: item.productName,
          sales: 0,
          quantity: 0,
        };
        existing.sales += item.total;
        existing.quantity += item.quantity;
        productSales.set(item.productId, existing);
      });
    });
    const top = Array.from(productSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    // Generate sales chart data (last 7 days)
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      const dayOrders = orders.filter((o) => {
        const orderDate = new Date(o.createdAt);
        return orderDate.toDateString() === date.toDateString();
      });
      return {
        date: date.toISOString().split("T")[0],
        sales: dayOrders.reduce((sum, o) => sum + o.total, 0),
      };
    });

    dispatch(
      setStats({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        revenueGrowth,
        ordersGrowth,
        customersGrowth,
        productsGrowth,
      })
    );
    dispatch(setRecentOrders(recent));
    dispatch(setTopProducts(top));
    dispatch(setSalesChart(chartData));
  }, [dispatch]);

  const statCards = [
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
      growth: stats.revenueGrowth,
      icon: DollarSign,
      description: "From all orders",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      growth: stats.ordersGrowth,
      icon: ShoppingCart,
      description: "All time orders",
    },
    {
      title: "Active Customers",
      value: stats.totalCustomers.toLocaleString(),
      growth: stats.customersGrowth,
      icon: Users,
      description: "Active customers",
    },
    {
      title: "Total Products",
      value: stats.totalProducts.toLocaleString(),
      growth: stats.productsGrowth,
      icon: Package,
      description: "In inventory",
    },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      processing: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
      shipped: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
      delivered: "bg-green-500/10 text-green-600 dark:text-green-400",
      cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            const isPositive = card.growth >= 0;
            return (
              <Card key={card.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {card.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{card.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {card.description}
                  </p>
                  <div className="flex items-center gap-1 mt-2">
                    {isPositive ? (
                      <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                    <span
                      className={`text-xs ${
                        isPositive
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {Math.abs(card.growth)}%
                    </span>
                    <span className="text-xs text-muted-foreground">
                      from last month
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        $
                        {order.total.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{product.quantity}</TableCell>
                      <TableCell className="text-right">
                        $
                        {product.sales.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}

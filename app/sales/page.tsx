"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { setOrders, setFilters } from "@/lib/store/slices/salesSlice";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { NewOrderDialog } from "@/components/sales/NewOrderDialog";
import {
  Plus,
  Search,
  Eye,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function SalesPage() {
  const dispatch = useAppDispatch();
  const { orders, filters } = useAppSelector((state) => state.sales);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [customers, setCustomers] = useState<{ id: string; name: string }[]>(
    []
  );
  const [products, setProducts] = useState<
    { id: string; name: string; price: number; stock: number }[]
  >([]);

  useEffect(() => {
    const generatedProducts = generateProducts(100);
    const generatedCustomers = generateCustomers(50);
    const demoOrders = generateOrders(
      200,
      generatedCustomers,
      generatedProducts
    );
    dispatch(setOrders(demoOrders));

    // Set customers and products for the new order dialog
    // Use setTimeout to defer state updates
    setTimeout(() => {
      setCustomers(generatedCustomers.map((c) => ({ id: c.id, name: c.name })));
      setProducts(
        generatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          stock: p.stock,
        }))
      );
    }, 0);
  }, [dispatch]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
      order.customerName.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus =
      filters.status === "all" || order.status === filters.status;
    const matchesPayment =
      filters.paymentStatus === "all" ||
      order.paymentStatus === filters.paymentStatus;
    return matchesSearch && matchesStatus && matchesPayment;
  });

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

  const getPaymentColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      paid: "bg-green-500/10 text-green-600 dark:text-green-400",
      refunded: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  const totalRevenue = filteredOrders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = filteredOrders.filter(
    (o) => o.status === "pending"
  ).length;
  const processingOrders = filteredOrders.filter(
    (o) => o.status === "processing"
  ).length;
  const deliveredOrders = filteredOrders.filter(
    (o) => o.status === "delivered"
  ).length;
  const paidOrders = filteredOrders.filter(
    (o) => o.paymentStatus === "paid"
  ).length;
  const averageOrderValue =
    filteredOrders.length > 0
      ? filteredOrders.reduce((sum, o) => sum + o.total, 0) /
        filteredOrders.length
      : 0;
  const totalItems = filteredOrders.reduce((sum, o) => sum + o.items.length, 0);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Sales</h1>
            <p className="text-muted-foreground">
              Manage your sales and orders
            </p>
          </div>
          <Button onClick={() => setIsNewOrderDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Order
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalItems} total items
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalRevenue.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ${averageOrderValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Pending Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {processingOrders} processing
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {paidOrders} paid orders
              </p>
            </CardContent>
          </Card>
        </div>

        <NewOrderDialog
          open={isNewOrderDialogOpen}
          onOpenChange={setIsNewOrderDialogOpen}
          customers={customers}
          products={products}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter orders by status and payment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={filters.search}
                    onChange={(e) =>
                      dispatch(setFilters({ search: e.target.value }))
                    }
                    className="pl-9"
                  />
                </div>
              </div>
              <Select
                value={filters.status}
                onValueChange={(value) =>
                  dispatch(setFilters({ status: value }))
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Order Status" />
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
              <Select
                value={filters.paymentStatus}
                onValueChange={(value) =>
                  dispatch(setFilters({ paymentStatus: value }))
                }
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Payment Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Payments</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order Number</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{order.items.length}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentColor(order.paymentStatus)}>
                        {order.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      $
                      {order.total.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

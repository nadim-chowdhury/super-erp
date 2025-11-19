"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setOrders,
  setFilters,
  deleteOrder,
  bulkDeleteOrders,
  bulkUpdateOrders,
  bulkUpdateStatus,
  bulkUpdatePaymentStatus,
} from "@/lib/store/slices/salesSlice";
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
import { Checkbox } from "@/components/ui/checkbox";
import { NewOrderDialog } from "@/components/sales/NewOrderDialog";
import { BulkActions } from "@/components/common/BulkActions";
import {
  AdvancedFilters,
  FilterCriteria,
} from "@/components/common/AdvancedFilters";
import {
  Plus,
  Search,
  Eye,
  TrendingUp,
  Package,
  CheckCircle,
  Clock,
  History,
  X,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  addToSearchHistory,
  getSearchHistory,
  removeFromSearchHistory,
} from "@/lib/utils/searchHistory";
import { exportToExcel } from "@/lib/utils/exportUtils";
import { Order } from "@/lib/data/demoData";

export default function SalesPage() {
  const dispatch = useAppDispatch();
  const { orders, filters } = useAppSelector((state) => state.sales);
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: "asc" | "desc" | null;
  }>({ column: "", direction: null });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [savedPresets, setSavedPresets] = useState<
    { id: string; name: string; filters: FilterCriteria[] }[]
  >([]);
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

  // Load saved presets from localStorage
  useEffect(() => {
    const loadPresets = () => {
      const presets = localStorage.getItem("sales_filter_presets");
      if (presets) {
        try {
          setSavedPresets(JSON.parse(presets));
        } catch {
          // Ignore parse errors
        }
      }
    };
    setTimeout(loadPresets, 0);
  }, []);

  // Apply filters and sorting
  const filteredOrders = useMemo(() => {
    let result = orders.filter((order) => {
      // Basic filters
      const matchesSearch =
        filters.search === "" ||
        order.orderNumber.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.customerName.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === "all" || order.status === filters.status;
      const matchesPayment =
        filters.paymentStatus === "all" ||
        order.paymentStatus === filters.paymentStatus;

      if (!matchesSearch || !matchesStatus || !matchesPayment) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        return advancedFilters.every((filter) => {
          const value = (order as any)[filter.field];
          const filterValue = filter.value.toLowerCase();

          switch (filter.operator) {
            case "equals":
              return String(value).toLowerCase() === filterValue;
            case "contains":
              return String(value).toLowerCase().includes(filterValue);
            case "greaterThan":
              return Number(value) > Number(filter.value);
            case "lessThan":
              return Number(value) < Number(filter.value);
            case "between":
              return (
                Number(value) >= Number(filter.value) &&
                Number(value) <= Number(filter.value2 || filter.value)
              );
            default:
              return true;
          }
        });
      }

      return true;
    });

    // Apply sorting
    if (sortConfig.column && sortConfig.direction) {
      result = [...result].sort((a, b) => {
        const aVal = (a as any)[sortConfig.column];
        const bVal = (b as any)[sortConfig.column];
        const multiplier = sortConfig.direction === "asc" ? 1 : -1;

        if (typeof aVal === "number" && typeof bVal === "number") {
          return (aVal - bVal) * multiplier;
        }
        if (aVal instanceof Date && bVal instanceof Date) {
          return (aVal.getTime() - bVal.getTime()) * multiplier;
        }
        return String(aVal).localeCompare(String(bVal)) * multiplier;
      });
    }

    return result;
  }, [orders, filters, advancedFilters, sortConfig]);

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

  const handleDelete = (id: string) => {
    dispatch(deleteOrder(id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredOrders.map((o) => o.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectItem = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    dispatch(bulkDeleteOrders(Array.from(selectedIds)));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    dispatch(
      bulkUpdateStatus({
        ids: Array.from(selectedIds),
        status: status as Order["status"],
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkPaymentStatusChange = (paymentStatus: string) => {
    dispatch(
      bulkUpdatePaymentStatus({
        ids: Array.from(selectedIds),
        paymentStatus: paymentStatus as Order["paymentStatus"],
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedOrders = filteredOrders.filter((o) => selectedIds.has(o.id));
    const exportData = {
      headers: [
        "Order Number",
        "Customer",
        "Items",
        "Status",
        "Payment Status",
        "Total",
        "Date",
      ],
      rows: selectedOrders.map((o) => [
        o.orderNumber,
        o.customerName,
        o.items.length,
        o.status,
        o.paymentStatus,
        o.total,
        new Date(o.createdAt).toLocaleDateString(),
      ]),
      title: "Sales Export",
    };
    exportToExcel(exportData, "sales_export");
  };

  const handleAdvancedFilters = (newFilters: FilterCriteria[]) => {
    setAdvancedFilters(newFilters);
  };

  const handleClearFilters = () => {
    setAdvancedFilters([]);
  };

  const handleSavePreset = (name: string, presetFilters: FilterCriteria[]) => {
    const newPreset = {
      id: Date.now().toString(),
      name,
      filters: presetFilters,
    };
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem("sales_filter_presets", JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("sales_filter_presets", JSON.stringify(updated));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
    if (value.trim()) {
      addToSearchHistory(value);
    }
  };

  const searchHistory = getSearchHistory();
  const isAllSelected =
    filteredOrders.length > 0 &&
    filteredOrders.every((o) => selectedIds.has(o.id));

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
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    value={filters.search}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    onFocus={() => setShowSearchHistory(true)}
                    className="pl-9"
                  />
                  {showSearchHistory && searchHistory.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-60 overflow-y-auto">
                      <div className="p-2 text-xs text-muted-foreground font-semibold flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <History className="h-3 w-3" />
                          Recent Searches
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2"
                          onClick={() => setShowSearchHistory(false)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      {searchHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 hover:bg-accent cursor-pointer flex items-center justify-between group"
                          onClick={() => {
                            handleSearchChange(item.query);
                            setShowSearchHistory(false);
                          }}
                        >
                          <span className="text-sm">{item.query}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFromSearchHistory(item.query);
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
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
                <AdvancedFilters
                  fields={[
                    { name: "orderNumber", label: "Order Number", type: "text" },
                    { name: "customerName", label: "Customer", type: "text" },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: [
                        "pending",
                        "processing",
                        "shipped",
                        "delivered",
                        "cancelled",
                      ],
                    },
                    {
                      name: "paymentStatus",
                      label: "Payment Status",
                      type: "select",
                      options: ["pending", "paid", "refunded"],
                    },
                    { name: "total", label: "Total", type: "number" },
                    { name: "createdAt", label: "Created Date", type: "date" },
                  ]}
                  onApply={handleAdvancedFilters}
                  onClear={handleClearFilters}
                  savedPresets={savedPresets}
                  onSavePreset={handleSavePreset}
                  onDeletePreset={handleDeletePreset}
                />
              </div>
              {advancedFilters.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {advancedFilters.map((filter, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-2">
                      {filter.field} {filter.operator} {filter.value}
                      {filter.operator === "between" && ` - ${filter.value2}`}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => {
                          setAdvancedFilters(
                            advancedFilters.filter((_, i) => i !== idx)
                          );
                        }}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <BulkActions
          selectedCount={selectedIds.size}
          onBulkDelete={handleBulkDelete}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
          statusOptions={[
            { value: "pending", label: "Pending" },
            { value: "processing", label: "Processing" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>
              {filteredOrders.length} order
              {filteredOrders.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={isAllSelected}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "orderNumber" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "orderNumber", direction: "desc" };
                          } else if (
                            sortConfig.column === "orderNumber" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "orderNumber", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Order Number
                        {sortConfig.column === "orderNumber" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "customerName" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "customerName", direction: "desc" };
                          } else if (
                            sortConfig.column === "customerName" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "customerName", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Customer
                        {sortConfig.column === "customerName" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "total" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "total", direction: "desc" };
                          } else if (
                            sortConfig.column === "total" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "total", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Total
                        {sortConfig.column === "total" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No orders found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(order.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(order.id, checked as boolean)
                            }
                          />
                        </TableCell>
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
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(order.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}

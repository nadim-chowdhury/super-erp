import { format, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { Order } from "@/lib/data/demoData";
import { Transaction } from "@/lib/data/demoData";
import { Product } from "@/lib/data/demoData";
import { Customer } from "@/lib/data/demoData";
import { ExportData, formatCurrency, formatDate } from "./exportUtils";
import { ReportConfig } from "@/components/reports/ReportBuilder";

export function generateSalesReport(
  orders: Order[],
  config: ReportConfig
): ExportData {
  // Filter by date range
  let filtered = orders.filter((order) => {
    const orderDate = new Date(order.createdAt);
    return isWithinInterval(orderDate, {
      start: startOfDay(config.dateRange.start),
      end: endOfDay(config.dateRange.end),
    });
  });

  // Apply filters
  if (config.filters.status && config.filters.status !== "all") {
    filtered = filtered.filter((o) => o.status === config.filters.status);
  }

  // Group data if needed
  if (config.grouping.enabled && config.grouping.by !== "none") {
    return generateGroupedSalesReport(filtered, config);
  }

  // Default: detailed order list
  const rows = filtered.map((order) => [
    order.orderNumber,
    formatDate(order.createdAt),
    order.customerName,
    order.status,
    order.paymentStatus,
    formatCurrency(order.total),
    order.items.length.toString(),
  ]);

  return {
    title: "Sales Report",
    headers: [
      "Order Number",
      "Date",
      "Customer",
      "Status",
      "Payment Status",
      "Total",
      "Items",
    ],
    rows,
  };
}

function generateGroupedSalesReport(
  orders: Order[],
  config: ReportConfig
): ExportData {
  const grouped = new Map<string, { count: number; total: number }>();

  orders.forEach((order) => {
    let key: string;
    switch (config.grouping.by) {
      case "day":
        key = format(new Date(order.createdAt), "yyyy-MM-dd");
        break;
      case "week":
        key = format(new Date(order.createdAt), "yyyy-'W'ww");
        break;
      case "month":
        key = format(new Date(order.createdAt), "yyyy-MM");
        break;
      case "status":
        key = order.status;
        break;
      default:
        key = "All";
    }

    const existing = grouped.get(key) || { count: 0, total: 0 };
    grouped.set(key, {
      count: existing.count + 1,
      total: existing.total + order.total,
    });
  });

  const rows = Array.from(grouped.entries())
    .map(([key, data]) => [
      key,
      data.count.toString(),
      formatCurrency(data.total),
      formatCurrency(data.total / data.count),
    ])
    .sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

  return {
    title: "Sales Report (Grouped)",
    headers: ["Period", "Orders", "Total Revenue", "Average Order Value"],
    rows,
  };
}

export function generateInventoryReport(
  products: Product[],
  config: ReportConfig
): ExportData {
  let filtered = products;

  // Apply filters
  if (config.filters.category && config.filters.category !== "all") {
    filtered = filtered.filter((p) => p.category === config.filters.category);
  }

  // Group data if needed
  if (config.grouping.enabled && config.grouping.by === "category") {
    const grouped = new Map<
      string,
      { count: number; totalStock: number; lowStock: number; outOfStock: number }
    >();

    filtered.forEach((product) => {
      const existing = grouped.get(product.category) || {
        count: 0,
        totalStock: 0,
        lowStock: 0,
        outOfStock: 0,
      };
      existing.count += 1;
      existing.totalStock += product.stock;
      if (product.status === "low_stock") existing.lowStock += 1;
      if (product.status === "out_of_stock") existing.outOfStock += 1;
      grouped.set(product.category, existing);
    });

    const rows = Array.from(grouped.entries()).map(([category, data]) => [
      category,
      data.count.toString(),
      data.totalStock.toString(),
      data.lowStock.toString(),
      data.outOfStock.toString(),
    ]);

    return {
      title: "Inventory Report (By Category)",
      headers: ["Category", "Products", "Total Stock", "Low Stock", "Out of Stock"],
      rows,
    };
  }

  // Default: detailed product list
  const rows = filtered.map((product) => [
    product.name,
    product.sku,
    product.category,
    product.status,
    product.stock.toString(),
    product.minStock.toString(),
    formatCurrency(product.price),
    formatCurrency(product.cost),
  ]);

  return {
    title: "Inventory Report",
    headers: [
      "Product Name",
      "SKU",
      "Category",
      "Status",
      "Stock",
      "Min Stock",
      "Price",
      "Cost",
    ],
    rows,
  };
}

export function generateFinanceReport(
  transactions: Transaction[],
  config: ReportConfig
): ExportData {
  // Filter by date range
  let filtered = transactions.filter((transaction) => {
    const transDate = new Date(transaction.date);
    return isWithinInterval(transDate, {
      start: startOfDay(config.dateRange.start),
      end: endOfDay(config.dateRange.end),
    });
  });

  // Apply filters
  if (config.filters.type && config.filters.type !== "all") {
    filtered = filtered.filter((t) => t.type === config.filters.type);
  }

  // Group data if needed
  if (config.grouping.enabled && config.grouping.by !== "none") {
    const grouped = new Map<string, { income: number; expenses: number }>();

    filtered.forEach((transaction) => {
      let key: string;
      switch (config.grouping.by) {
        case "day":
          key = format(new Date(transaction.date), "yyyy-MM-dd");
          break;
        case "week":
          key = format(new Date(transaction.date), "yyyy-'W'ww");
          break;
        case "month":
          key = format(new Date(transaction.date), "yyyy-MM");
          break;
        default:
          key = "All";
      }

      const existing = grouped.get(key) || { income: 0, expenses: 0 };
      if (transaction.type === "income") {
        existing.income += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
      grouped.set(key, existing);
    });

    const rows = Array.from(grouped.entries())
      .map(([key, data]) => [
        key,
        formatCurrency(data.income),
        formatCurrency(data.expenses),
        formatCurrency(data.income - data.expenses),
      ])
      .sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return {
      title: "Profit & Loss Report",
      headers: ["Period", "Income", "Expenses", "Net Profit"],
      rows,
    };
  }

  // Default: detailed transaction list
  const rows = filtered.map((transaction) => [
    formatDate(transaction.date),
    transaction.type,
    transaction.category,
    transaction.description,
    transaction.status,
    formatCurrency(transaction.amount),
  ]);

  return {
    title: "Financial Report",
    headers: ["Date", "Type", "Category", "Description", "Status", "Amount"],
    rows,
  };
}

export function generateCustomerReport(
  customers: Customer[],
  config: ReportConfig
): ExportData {
  // Filter by date range (created date)
  let filtered = customers.filter((customer) => {
    const createdDate = new Date(customer.createdAt);
    return isWithinInterval(createdDate, {
      start: startOfDay(config.dateRange.start),
      end: endOfDay(config.dateRange.end),
    });
  });

  // Group data if needed
  if (config.grouping.enabled && config.grouping.by !== "none") {
    const grouped = new Map<string, { count: number; totalSpent: number }>();

    filtered.forEach((customer) => {
      let key: string;
      switch (config.grouping.by) {
        case "day":
          key = format(new Date(customer.createdAt), "yyyy-MM-dd");
          break;
        case "week":
          key = format(new Date(customer.createdAt), "yyyy-'W'ww");
          break;
        case "month":
          key = format(new Date(customer.createdAt), "yyyy-MM");
          break;
        default:
          key = "All";
      }

      const existing = grouped.get(key) || { count: 0, totalSpent: 0 };
      existing.count += 1;
      existing.totalSpent += customer.totalSpent;
      grouped.set(key, existing);
    });

    const rows = Array.from(grouped.entries())
      .map(([key, data]) => [
        key,
        data.count.toString(),
        formatCurrency(data.totalSpent),
        formatCurrency(data.totalSpent / data.count),
      ])
      .sort((a, b) => (a[0] as string).localeCompare(b[0] as string));

    return {
      title: "Customer Report (Grouped)",
      headers: ["Period", "New Customers", "Total Spent", "Average Spent"],
      rows,
    };
  }

  // Default: detailed customer list
  const rows = filtered.map((customer) => [
    customer.name,
    customer.email,
    customer.phone,
    customer.status,
    customer.totalOrders.toString(),
    formatCurrency(customer.totalSpent),
    formatDate(customer.createdAt),
  ]);

  return {
    title: "Customer Report",
    headers: [
      "Name",
      "Email",
      "Phone",
      "Status",
      "Total Orders",
      "Total Spent",
      "Created",
    ],
    rows,
  };
}



"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setTransactions,
  setFilters,
  deleteTransaction,
  bulkDeleteTransactions,
  bulkUpdateTransactions,
  bulkUpdateStatus,
} from "@/lib/store/slices/financeSlice";
import { Transaction } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateTransactions } from "@/lib/data/demoData";
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
import { AddTransactionDialog } from "@/components/finance/AddTransactionDialog";
import { EditTransactionDialog } from "@/components/finance/EditTransactionDialog";
import { BulkActions } from "@/components/common/BulkActions";
import {
  AdvancedFilters,
  FilterCriteria,
} from "@/components/common/AdvancedFilters";
import {
  Plus,
  Search,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  ArrowUpRight,
  MoreHorizontal,
  Edit,
  Trash2,
  History,
  X,
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

export default function FinancePage() {
  const dispatch = useAppDispatch();
  const { transactions, filters, summary } = useAppSelector(
    (state) => state.finance
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
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

  useEffect(() => {
    const demoTransactions = generateTransactions(300);
    dispatch(setTransactions(demoTransactions));
  }, [dispatch]);

  // Load saved presets from localStorage
  useEffect(() => {
    const loadPresets = () => {
      const presets = localStorage.getItem("finance_filter_presets");
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
  const filteredTransactions = useMemo(() => {
    let result = transactions.filter((transaction) => {
      // Basic filters
      const matchesType =
        filters.type === "all" || transaction.type === filters.type;
      const matchesCategory =
        filters.category === "all" || transaction.category === filters.category;
      const matchesStatus =
        filters.status === "all" || transaction.status === filters.status;

      if (!matchesType || !matchesCategory || !matchesStatus) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        return advancedFilters.every((filter) => {
          const value = (transaction as any)[filter.field];
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
  }, [transactions, filters, advancedFilters, sortConfig]);

  const incomeCategories = Array.from(
    new Set(
      transactions.filter((t) => t.type === "income").map((t) => t.category)
    )
  );
  const expenseCategories = Array.from(
    new Set(
      transactions.filter((t) => t.type === "expense").map((t) => t.category)
    )
  );

  // Calculate additional metrics
  const metrics = useMemo(() => {
    const incomeTransactions = transactions.filter((t) => t.type === "income");
    const expenseTransactions = transactions.filter(
      (t) => t.type === "expense"
    );
    const pendingTransactions = transactions.filter(
      (t) => t.status === "pending"
    );

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const thisMonthIncome = incomeTransactions
      .filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthExpenses = expenseTransactions
      .filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const averageIncome =
      incomeTransactions.length > 0
        ? summary.totalIncome / incomeTransactions.length
        : 0;

    const averageExpense =
      expenseTransactions.length > 0
        ? summary.totalExpenses / expenseTransactions.length
        : 0;

    const profitMargin =
      summary.totalIncome > 0
        ? ((summary.netProfit / summary.totalIncome) * 100).toFixed(1)
        : "0.0";

    return {
      thisMonthIncome,
      thisMonthExpenses,
      averageIncome,
      averageExpense,
      profitMargin,
      pendingCount: pendingTransactions.length,
    };
  }, [transactions, summary]);

  const {
    thisMonthIncome,
    thisMonthExpenses,
    profitMargin,
    pendingCount,
  } = metrics;

  const getTypeColor = (type: string) => {
    return type === "income"
      ? "bg-green-500/10 text-green-600 dark:text-green-400"
      : "bg-red-500/10 text-red-600 dark:text-red-400";
  };

  const handleDelete = (id: string) => {
    dispatch(deleteTransaction(id));
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredTransactions.map((t) => t.id)));
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
    dispatch(bulkDeleteTransactions(Array.from(selectedIds)));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    dispatch(
      bulkUpdateStatus({
        ids: Array.from(selectedIds),
        status: status as Transaction["status"],
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedTransactions = filteredTransactions.filter((t) =>
      selectedIds.has(t.id)
    );
    const exportData = {
      headers: [
        "Date",
        "Type",
        "Category",
        "Description",
        "Amount",
        "Status",
      ],
      rows: selectedTransactions.map((t) => [
        new Date(t.date).toLocaleDateString(),
        t.type,
        t.category,
        t.description,
        t.amount,
        t.status,
      ]),
      title: "Finance Export",
    };
    exportToExcel(exportData, "finance_export");
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
    localStorage.setItem("finance_filter_presets", JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("finance_filter_presets", JSON.stringify(updated));
  };

  const handleSearchChange = (value: string) => {
    // Note: Finance page doesn't have a search filter in the slice, so we'll skip this for now
    // Or we could add it to the slice if needed
  };

  const searchHistory = getSearchHistory();
  const isAllSelected =
    filteredTransactions.length > 0 &&
    filteredTransactions.every((t) => selectedIds.has(t.id));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Finance</h1>
            <p className="text-muted-foreground">
              Manage your financial transactions
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                Total Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                $
                {summary.totalIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${thisMonthIncome.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-muted-foreground" />
                Total Expenses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                $
                {summary.totalExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                ${thisMonthExpenses.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })} this month
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                Net Profit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${
                  summary.netProfit >= 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }`}
              >
                $
                {summary.netProfit.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {profitMargin}% profit margin
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Pending Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingCount}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Awaiting completion
              </p>
            </CardContent>
          </Card>
        </div>

        <AddTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <EditTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedTransaction(null);
            }
          }}
          transaction={selectedTransaction}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter transactions by type, category, and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <Select
                  value={filters.type}
                  onValueChange={(value) => dispatch(setFilters({ type: value }))}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.category}
                  onValueChange={(value) =>
                    dispatch(setFilters({ category: value }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {incomeCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    {expenseCategories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) =>
                    dispatch(setFilters({ status: value }))
                  }
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
                <AdvancedFilters
                  fields={[
                    { name: "description", label: "Description", type: "text" },
                    {
                      name: "type",
                      label: "Type",
                      type: "select",
                      options: ["income", "expense"],
                    },
                    {
                      name: "category",
                      label: "Category",
                      type: "select",
                      options: [...incomeCategories, ...expenseCategories],
                    },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: ["completed", "pending"],
                    },
                    { name: "amount", label: "Amount", type: "number" },
                    { name: "date", label: "Date", type: "date" },
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
            { value: "completed", label: "Completed" },
            { value: "pending", label: "Pending" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Transactions</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transaction
              {filteredTransactions.length !== 1 ? "s" : ""} found
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
                            sortConfig.column === "date" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "date", direction: "desc" };
                          } else if (
                            sortConfig.column === "date" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "date", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Date
                        {sortConfig.column === "date" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "amount" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "amount", direction: "desc" };
                          } else if (
                            sortConfig.column === "amount" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "amount", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Amount
                        {sortConfig.column === "amount" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No transactions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <TableRow key={transaction.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(transaction.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(transaction.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {new Date(transaction.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeColor(transaction.type)}>
                            {transaction.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{transaction.category}</TableCell>
                        <TableCell>{transaction.description}</TableCell>
                        <TableCell
                          className={
                            transaction.type === "income"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }
                        >
                          {transaction.type === "income" ? "+" : "-"}$
                          {transaction.amount.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              transaction.status === "completed"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEdit(transaction)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(transaction.id)}
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

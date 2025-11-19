"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setCustomers,
  setFilters,
  deleteCustomer,
  bulkDeleteCustomers,
  bulkUpdateCustomers,
  bulkUpdateStatus,
} from "@/lib/store/slices/customersSlice";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateCustomers } from "@/lib/data/demoData";
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
import { AddCustomerDialog } from "@/components/customers/AddCustomerDialog";
import { BulkActions } from "@/components/common/BulkActions";
import {
  AdvancedFilters,
  FilterCriteria,
} from "@/components/common/AdvancedFilters";
import {
  Plus,
  Search,
  Mail,
  Phone,
  Users,
  UserCheck,
  DollarSign,
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
import { Customer } from "@/lib/data/demoData";

export default function CustomersPage() {
  const dispatch = useAppDispatch();
  const { customers, filters } = useAppSelector((state) => state.customers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
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
    const demoCustomers = generateCustomers(50);
    dispatch(setCustomers(demoCustomers));
  }, [dispatch]);

  // Load saved presets from localStorage
  useEffect(() => {
    const loadPresets = () => {
      const presets = localStorage.getItem("customers_filter_presets");
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
  const filteredCustomers = useMemo(() => {
    let result = customers.filter((customer) => {
      // Basic filters
      const matchesSearch =
        filters.search === "" ||
        customer.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.email.toLowerCase().includes(filters.search.toLowerCase()) ||
        customer.phone.includes(filters.search);
      const matchesStatus =
        filters.status === "all" || customer.status === filters.status;

      if (!matchesSearch || !matchesStatus) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        return advancedFilters.every((filter) => {
          const value = (customer as any)[filter.field];
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
        return String(aVal).localeCompare(String(bVal)) * multiplier;
      });
    }

    return result;
  }, [customers, filters, advancedFilters, sortConfig]);

  const activeCustomers = filteredCustomers.filter(
    (c) => c.status === "active"
  ).length;
  const inactiveCustomers = filteredCustomers.filter(
    (c) => c.status === "inactive"
  ).length;
  const totalSpent = filteredCustomers.reduce(
    (sum, c) => sum + c.totalSpent,
    0
  );
  const totalOrders = filteredCustomers.reduce(
    (sum, c) => sum + c.totalOrders,
    0
  );
  const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const handleDelete = (id: string) => {
    dispatch(deleteCustomer(id));
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredCustomers.map((c) => c.id)));
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
    dispatch(bulkDeleteCustomers(Array.from(selectedIds)));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    dispatch(
      bulkUpdateStatus({
        ids: Array.from(selectedIds),
        status: status as Customer["status"],
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedCustomers = filteredCustomers.filter((c) =>
      selectedIds.has(c.id)
    );
    const exportData = {
      headers: [
        "Name",
        "Email",
        "Phone",
        "Company",
        "Total Orders",
        "Total Spent",
        "Status",
      ],
      rows: selectedCustomers.map((c) => [
        c.name,
        c.email,
        c.phone,
        c.company || "-",
        c.totalOrders,
        c.totalSpent,
        c.status,
      ]),
      title: "Customers Export",
    };
    exportToExcel(exportData, "customers_export");
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
    localStorage.setItem("customers_filter_presets", JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("customers_filter_presets", JSON.stringify(updated));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
    if (value.trim()) {
      addToSearchHistory(value);
    }
  };

  const searchHistory = getSearchHistory();
  const isAllSelected =
    filteredCustomers.length > 0 &&
    filteredCustomers.every((c) => selectedIds.has(c.id));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
            <p className="text-muted-foreground">
              Manage your customer relationships
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Customer
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredCustomers.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalOrders} total orders
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                Active Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCustomers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {inactiveCustomers} inactive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalSpent.toLocaleString("en-US", {
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
                <Mail className="h-4 w-4 text-muted-foreground" />
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  filteredCustomers.filter(
                    (c) =>
                      new Date(c.createdAt).getMonth() === new Date().getMonth()
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Recently added
              </p>
            </CardContent>
          </Card>
        </div>

        <AddCustomerDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter customers by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search customers..."
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
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <AdvancedFilters
                  fields={[
                    { name: "name", label: "Name", type: "text" },
                    { name: "email", label: "Email", type: "text" },
                    { name: "phone", label: "Phone", type: "text" },
                    { name: "company", label: "Company", type: "text" },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: ["active", "inactive"],
                    },
                    { name: "totalOrders", label: "Total Orders", type: "number" },
                    { name: "totalSpent", label: "Total Spent", type: "number" },
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
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""} found
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
                            sortConfig.column === "name" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "name", direction: "desc" };
                          } else if (
                            sortConfig.column === "name" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "name", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Name
                        {sortConfig.column === "name" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "totalOrders" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "totalOrders", direction: "desc" };
                          } else if (
                            sortConfig.column === "totalOrders" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "totalOrders", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Orders
                        {sortConfig.column === "totalOrders" &&
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
                            sortConfig.column === "totalSpent" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "totalSpent", direction: "desc" };
                          } else if (
                            sortConfig.column === "totalSpent" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "totalSpent", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Total Spent
                        {sortConfig.column === "totalSpent" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No customers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(customer.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(customer.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {customer.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {customer.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {customer.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{customer.company || "-"}</TableCell>
                        <TableCell>{customer.totalOrders}</TableCell>
                        <TableCell>
                          $
                          {customer.totalSpent.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              customer.status === "active"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }
                          >
                            {customer.status}
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
                                className="text-destructive"
                                onClick={() => handleDelete(customer.id)}
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

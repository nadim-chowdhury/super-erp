"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setSuppliers,
  setFilters,
  deleteSupplier,
  bulkDeleteSuppliers,
  bulkUpdateSuppliers,
  bulkUpdateStatus,
} from "@/lib/store/slices/suppliersSlice";
import { Supplier } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateSuppliers } from "@/lib/data/demoData";
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
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import { EditSupplierDialog } from "@/components/suppliers/EditSupplierDialog";
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
  Truck,
  CheckCircle,
  DollarSign,
  Package,
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

export default function SuppliersPage() {
  const dispatch = useAppDispatch();
  const { suppliers, filters } = useAppSelector((state) => state.suppliers);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(
    null
  );
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
    const demoSuppliers = generateSuppliers(30);
    dispatch(setSuppliers(demoSuppliers));
  }, [dispatch]);

  // Load saved presets from localStorage
  useEffect(() => {
    const loadPresets = () => {
      const presets = localStorage.getItem("suppliers_filter_presets");
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
  const filteredSuppliers = useMemo(() => {
    let result = suppliers.filter((supplier) => {
      // Basic filters
      const matchesSearch =
        filters.search === "" ||
        supplier.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        supplier.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesStatus =
        filters.status === "all" || supplier.status === filters.status;

      if (!matchesSearch || !matchesStatus) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        return advancedFilters.every((filter) => {
          const value = (supplier as any)[filter.field];
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
  }, [suppliers, filters, advancedFilters, sortConfig]);

  const activeSuppliers = filteredSuppliers.filter(
    (s) => s.status === "active"
  ).length;
  const inactiveSuppliers = filteredSuppliers.filter(
    (s) => s.status === "inactive"
  ).length;
  const totalPurchases = filteredSuppliers.reduce(
    (sum, s) => sum + s.totalPurchases,
    0
  );
  const totalProducts = filteredSuppliers.reduce(
    (sum, s) => sum + s.productsCount,
    0
  );
  const averagePurchaseValue =
    filteredSuppliers.length > 0
      ? totalPurchases / filteredSuppliers.length
      : 0;

  const handleDelete = (id: string) => {
    dispatch(deleteSupplier(id));
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setIsEditDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredSuppliers.map((s) => s.id)));
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
    dispatch(bulkDeleteSuppliers(Array.from(selectedIds)));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    dispatch(
      bulkUpdateStatus({
        ids: Array.from(selectedIds),
        status: status as Supplier["status"],
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedSuppliers = filteredSuppliers.filter((s) =>
      selectedIds.has(s.id)
    );
    const exportData = {
      headers: [
        "Name",
        "Email",
        "Phone",
        "Address",
        "Products Count",
        "Total Purchases",
        "Status",
      ],
      rows: selectedSuppliers.map((s) => [
        s.name,
        s.email,
        s.phone,
        s.address,
        s.productsCount,
        s.totalPurchases,
        s.status,
      ]),
      title: "Suppliers Export",
    };
    exportToExcel(exportData, "suppliers_export");
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
    localStorage.setItem("suppliers_filter_presets", JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("suppliers_filter_presets", JSON.stringify(updated));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
    if (value.trim()) {
      addToSearchHistory(value);
    }
  };

  const searchHistory = getSearchHistory();
  const isAllSelected =
    filteredSuppliers.length > 0 &&
    filteredSuppliers.every((s) => selectedIds.has(s.id));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
            <p className="text-muted-foreground">
              Manage your supplier relationships
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Supplier
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                Total Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredSuppliers.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalProducts} total products
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
                Active Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeSuppliers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {inactiveSuppliers} inactive
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                Total Purchases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                $
                {totalPurchases.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Avg: ${averagePurchaseValue.toFixed(2)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground mt-1">
                From all suppliers
              </p>
            </CardContent>
          </Card>
        </div>

        <AddSupplierDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
        />

        <EditSupplierDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedSupplier(null);
            }
          }}
          supplier={selectedSupplier}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>Filter suppliers by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers..."
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
                    { name: "address", label: "Address", type: "text" },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: ["active", "inactive"],
                    },
                    {
                      name: "productsCount",
                      label: "Products Count",
                      type: "number",
                    },
                    {
                      name: "totalPurchases",
                      label: "Total Purchases",
                      type: "number",
                    },
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
            <CardTitle>Suppliers</CardTitle>
            <CardDescription>
              {filteredSuppliers.length} supplier
              {filteredSuppliers.length !== 1 ? "s" : ""} found
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
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: typeof sortConfig;
                          if (
                            sortConfig.column === "productsCount" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = {
                              column: "productsCount",
                              direction: "desc",
                            };
                          } else if (
                            sortConfig.column === "productsCount" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = {
                              column: "productsCount",
                              direction: "asc",
                            };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Products
                        {sortConfig.column === "productsCount" &&
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
                            sortConfig.column === "totalPurchases" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = {
                              column: "totalPurchases",
                              direction: "desc",
                            };
                          } else if (
                            sortConfig.column === "totalPurchases" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = {
                              column: "totalPurchases",
                              direction: "asc",
                            };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Total Purchases
                        {sortConfig.column === "totalPurchases" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSuppliers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No suppliers found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <TableRow key={supplier.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(supplier.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(supplier.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {supplier.name}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="h-3 w-3 text-muted-foreground" />
                              {supplier.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="h-3 w-3" />
                              {supplier.phone}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{supplier.productsCount}</TableCell>
                        <TableCell>
                          $
                          {supplier.totalPurchases.toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              supplier.status === "active"
                                ? "bg-green-500/10 text-green-600 dark:text-green-400"
                                : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                            }
                          >
                            {supplier.status}
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
                                onClick={() => handleEdit(supplier)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(supplier.id)}
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

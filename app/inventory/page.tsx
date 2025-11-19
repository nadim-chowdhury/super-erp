"use client";

import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setProducts,
  setFilters,
  deleteProduct,
  bulkDeleteProducts,
  bulkUpdateProducts,
  bulkUpdateStatus,
} from "@/lib/store/slices/inventorySlice";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { generateProducts, Product } from "@/lib/data/demoData";
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
import { AddProductDialog } from "@/components/inventory/AddProductDialog";
import { EditProductDialog } from "@/components/inventory/EditProductDialog";
import { BulkActions } from "@/components/common/BulkActions";
import {
  AdvancedFilters,
  FilterCriteria,
} from "@/components/common/AdvancedFilters";
import { SortableTable, SortConfig } from "@/components/common/SortableTable";
import {
  Plus,
  Search,
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

export default function InventoryPage() {
  const dispatch = useAppDispatch();
  const { products, filters } = useAppSelector((state) => state.inventory);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [advancedFilters, setAdvancedFilters] = useState<FilterCriteria[]>([]);
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: "",
    direction: null,
  });
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [savedPresets, setSavedPresets] = useState<
    { id: string; name: string; filters: FilterCriteria[] }[]
  >([]);

  useEffect(() => {
    const demoProducts = generateProducts(100);
    dispatch(setProducts(demoProducts));
  }, [dispatch]);

  // Load saved presets from localStorage
  useEffect(() => {
    const loadPresets = () => {
      const presets = localStorage.getItem("inventory_filter_presets");
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

  const categories = Array.from(new Set(products.map((p) => p.category)));
  const suppliers = Array.from(new Set(products.map((p) => p.supplier)));

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
      // Basic filters
      const matchesSearch =
        filters.search === "" ||
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.sku.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCategory =
        filters.category === "all" || product.category === filters.category;
      const matchesStatus =
        filters.status === "all" || product.status === filters.status;

      if (!matchesSearch || !matchesCategory || !matchesStatus) {
        return false;
      }

      // Advanced filters
      if (advancedFilters.length > 0) {
        return advancedFilters.every((filter) => {
          const value = (product as any)[filter.field];
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
  }, [products, filters, advancedFilters, sortConfig]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      in_stock: "bg-green-500/10 text-green-600 dark:text-green-400",
      low_stock: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
      out_of_stock: "bg-red-500/10 text-red-600 dark:text-red-400",
    };
    return colors[status] || "bg-gray-500/10 text-gray-600 dark:text-gray-400";
  };

  const handleDelete = (id: string) => {
    dispatch(deleteProduct(id));
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredProducts.map((p) => p.id)));
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
    dispatch(bulkDeleteProducts(Array.from(selectedIds)));
    setSelectedIds(new Set());
  };

  const handleBulkEdit = (data: Record<string, string>) => {
    const updates: Partial<any> = {};
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        updates[key] = data[key];
      }
    });
    dispatch(bulkUpdateProducts({ ids: Array.from(selectedIds), updates }));
    setSelectedIds(new Set());
  };

  const handleBulkStatusChange = (status: string) => {
    dispatch(
      bulkUpdateStatus({
        ids: Array.from(selectedIds),
        status: status as any,
      })
    );
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedProducts = filteredProducts.filter((p) =>
      selectedIds.has(p.id)
    );
    const exportData = {
      headers: [
        "SKU",
        "Name",
        "Category",
        "Stock",
        "Price",
        "Status",
        "Supplier",
      ],
      rows: selectedProducts.map((p) => [
        p.sku,
        p.name,
        p.category,
        p.stock,
        p.price,
        p.status,
        p.supplier,
      ]),
      title: "Inventory Export",
    };
    exportToExcel(exportData, "inventory_export");
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
    localStorage.setItem("inventory_filter_presets", JSON.stringify(updated));
  };

  const handleDeletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    localStorage.setItem("inventory_filter_presets", JSON.stringify(updated));
  };

  const handleSearchChange = (value: string) => {
    dispatch(setFilters({ search: value }));
    if (value.trim()) {
      addToSearchHistory(value);
    }
  };

  const searchHistory = getSearchHistory();
  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedIds.has(p.id));

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory</h1>
            <p className="text-muted-foreground">
              Manage your product inventory
            </p>
          </div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>

        <AddProductDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          suppliers={suppliers}
        />

        <EditProductDialog
          open={isEditDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            if (!open) {
              setSelectedProduct(null);
            }
          }}
          product={selectedProduct}
          suppliers={suppliers}
        />

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
            <CardDescription>
              Filter products by category and status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
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
                    {categories.map((cat) => (
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
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
                <AdvancedFilters
                  fields={[
                    { name: "name", label: "Name", type: "text" },
                    { name: "sku", label: "SKU", type: "text" },
                    {
                      name: "category",
                      label: "Category",
                      type: "select",
                      options: categories,
                    },
                    { name: "stock", label: "Stock", type: "number" },
                    { name: "price", label: "Price", type: "number" },
                    {
                      name: "status",
                      label: "Status",
                      type: "select",
                      options: ["in_stock", "low_stock", "out_of_stock"],
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
          onBulkEdit={handleBulkEdit}
          onBulkStatusChange={handleBulkStatusChange}
          onBulkExport={handleBulkExport}
          statusOptions={[
            { value: "in_stock", label: "In Stock" },
            { value: "low_stock", label: "Low Stock" },
            { value: "out_of_stock", label: "Out of Stock" },
          ]}
          editFields={[
            {
              name: "category",
              label: "Category",
              type: "select",
              options: categories,
            },
            {
              name: "supplier",
              label: "Supplier",
              type: "select",
              options: suppliers,
            },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              {filteredProducts.length} product
              {filteredProducts.length !== 1 ? "s" : ""} found
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
                          let newSort: SortConfig;
                          if (
                            sortConfig.column === "sku" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "sku", direction: "desc" };
                          } else if (
                            sortConfig.column === "sku" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "sku", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        SKU
                        {sortConfig.column === "sku" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: SortConfig;
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
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: SortConfig;
                          if (
                            sortConfig.column === "category" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "category", direction: "desc" };
                          } else if (
                            sortConfig.column === "category" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "category", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Category
                        {sortConfig.column === "category" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: SortConfig;
                          if (
                            sortConfig.column === "stock" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "stock", direction: "desc" };
                          } else if (
                            sortConfig.column === "stock" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "stock", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Stock
                        {sortConfig.column === "stock" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        className="h-8 px-2 lg:px-3 -ml-3"
                        onClick={() => {
                          let newSort: SortConfig;
                          if (
                            sortConfig.column === "price" &&
                            sortConfig.direction === "asc"
                          ) {
                            newSort = { column: "price", direction: "desc" };
                          } else if (
                            sortConfig.column === "price" &&
                            sortConfig.direction === "desc"
                          ) {
                            newSort = { column: "", direction: null };
                          } else {
                            newSort = { column: "price", direction: "asc" };
                          }
                          setSortConfig(newSort);
                        }}
                      >
                        Price
                        {sortConfig.column === "price" &&
                          (sortConfig.direction === "asc" ? " ↑" : " ↓")}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProducts.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(product.id)}
                            onCheckedChange={(checked) =>
                              handleSelectItem(product.id, checked as boolean)
                            }
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          {product.sku}
                        </TableCell>
                        <TableCell>{product.name}</TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>{product.stock}</TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(product.status)}>
                            {product.status.replace("_", " ")}
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
                                onClick={() => handleEdit(product)}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(product.id)}
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

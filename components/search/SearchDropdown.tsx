"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import {
  Search,
  Package,
  Users,
  ShoppingCart,
  UserCircle,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  generateProducts,
  generateCustomers,
  generateOrders,
  generateEmployees,
} from "@/lib/data/demoData";
import Link from "next/link";

interface SearchResult {
  id: string;
  type: "product" | "customer" | "order" | "employee";
  title: string;
  subtitle: string;
  link: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function SearchDropdown() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate demo data once
  const [demoData] = useState(() => {
    const products = generateProducts(100);
    const customers = generateCustomers(50);
    const employees = generateEmployees(40);
    const orders = generateOrders(50, customers, products);
    return { products, customers, employees, orders };
  });

  // Compute search results using useMemo instead of useEffect
  const results = useMemo(() => {
    if (searchQuery.trim().length === 0) {
      return [];
    }

    const query = searchQuery.toLowerCase();
    const searchResults: SearchResult[] = [];

    // Search products
    demoData.products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.sku.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((product) => {
        searchResults.push({
          id: product.id,
          type: "product",
          title: product.name,
          subtitle: `${product.category} • SKU: ${product.sku}`,
          link: `/inventory`,
          icon: Package,
        });
      });

    // Search customers
    demoData.customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(query) ||
          c.email.toLowerCase().includes(query) ||
          c.company?.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((customer) => {
        searchResults.push({
          id: customer.id,
          type: "customer",
          title: customer.name,
          subtitle: customer.email,
          link: `/customers`,
          icon: Users,
        });
      });

    // Search orders
    demoData.orders
      .filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(query) ||
          o.customerName.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((order) => {
        searchResults.push({
          id: order.id,
          type: "order",
          title: order.orderNumber,
          subtitle: `${order.customerName} • $${order.total.toFixed(2)}`,
          link: `/sales`,
          icon: ShoppingCart,
        });
      });

    // Search employees
    demoData.employees
      .filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          e.department.toLowerCase().includes(query) ||
          e.position.toLowerCase().includes(query)
      )
      .slice(0, 3)
      .forEach((employee) => {
        searchResults.push({
          id: employee.id,
          type: "employee",
          title: employee.name,
          subtitle: `${employee.position} • ${employee.department}`,
          link: `/employees`,
          icon: UserCircle,
        });
      });

    return searchResults;
  }, [searchQuery, demoData]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchQuery("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!open && e.target.value.trim().length > 0) {
      setOpen(true);
    }
  };

  const handleClear = () => {
    setSearchQuery("");
    setOpen(false);
    inputRef.current?.focus();
  };

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) {
      acc[result.type] = [];
    }
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels = {
    product: "Products",
    customer: "Customers",
    order: "Orders",
    employee: "Employees",
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-sm">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products, customers, orders..."
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setOpen(true);
            }
          }}
          className="pl-9 pr-9 w-full [&::-webkit-search-cancel-button]:hidden"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="rounded-lg border bg-popover text-popover-foreground shadow-md">
            <div className="max-h-[400px] overflow-y-auto p-2">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type} className="mb-2 last:mb-0">
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase">
                    {typeLabels[type as keyof typeof typeLabels]}
                  </div>
                  {items.map((result) => {
                    const Icon = result.icon;
                    return (
                      <Link
                        key={result.id}
                        href={result.link}
                        onClick={() => {
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
                      >
                        <div className="flex items-center justify-center h-8 w-8 rounded-md bg-muted">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {result.title}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {result.subtitle}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
            <div className="border-t px-2 py-1.5 text-xs text-muted-foreground text-center">
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </div>
          </div>
        </div>
      )}

      {open && searchQuery.trim().length > 0 && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 z-50">
          <div className="rounded-lg border bg-popover text-popover-foreground shadow-md p-4 text-center">
            <p className="text-sm text-muted-foreground">
              No results found for &quot;{searchQuery}&quot;
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

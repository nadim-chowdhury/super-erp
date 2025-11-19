"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Activity } from "@/lib/data/demoData";

interface ActivityFiltersProps {
  filters: {
    module: string;
    type: string;
    user: string;
    dateRange: { start: string; end: string };
  };
  onFilterChange: (filters: Partial<ActivityFiltersProps["filters"]>) => void;
  onClearFilters: () => void;
  uniqueUsers: string[];
}

export function ActivityFilters({
  filters,
  onFilterChange,
  onClearFilters,
  uniqueUsers,
}: ActivityFiltersProps) {
  const hasActiveFilters =
    filters.module !== "all" ||
    filters.type !== "all" ||
    filters.user !== "all" ||
    filters.dateRange.start !== "" ||
    filters.dateRange.end !== "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Filters</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8"
          >
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="module-filter">Module</Label>
          <Select
            value={filters.module}
            onValueChange={(value) => onFilterChange({ module: value })}
          >
            <SelectTrigger id="module-filter">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="inventory">Inventory</SelectItem>
              <SelectItem value="sales">Sales</SelectItem>
              <SelectItem value="customers">Customers</SelectItem>
              <SelectItem value="suppliers">Suppliers</SelectItem>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="employees">Employees</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type-filter">Type</Label>
          <Select
            value={filters.type}
            onValueChange={(value) => onFilterChange({ type: value })}
          >
            <SelectTrigger id="type-filter">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="create">Create</SelectItem>
              <SelectItem value="update">Update</SelectItem>
              <SelectItem value="delete">Delete</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="comment">Comment</SelectItem>
              <SelectItem value="file">File</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="user-filter">User</Label>
          <Select
            value={filters.user}
            onValueChange={(value) => onFilterChange({ user: value })}
          >
            <SelectTrigger id="user-filter">
              <SelectValue placeholder="All users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {uniqueUsers.map((user) => (
                <SelectItem key={user} value={user}>
                  {user}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date-start">Start Date</Label>
          <Input
            id="date-start"
            type="date"
            value={filters.dateRange.start}
            onChange={(e) =>
              onFilterChange({
                dateRange: { ...filters.dateRange, start: e.target.value },
              })
            }
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-end">End Date</Label>
          <Input
            id="date-end"
            type="date"
            value={filters.dateRange.end}
            onChange={(e) =>
              onFilterChange({
                dateRange: { ...filters.dateRange, end: e.target.value },
              })
            }
          />
        </div>
      </div>
    </div>
  );
}


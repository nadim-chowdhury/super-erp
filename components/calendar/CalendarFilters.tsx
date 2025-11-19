"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface CalendarFiltersProps {
  filters: {
    categories: string[];
    search: string;
  };
  onFilterChange: (filters: Partial<CalendarFiltersProps["filters"]>) => void;
  onClearFilters: () => void;
}

const categories = [
  { value: "meeting", label: "Meeting", color: "#3b82f6" },
  { value: "deadline", label: "Deadline", color: "#ef4444" },
  { value: "reminder", label: "Reminder", color: "#f59e0b" },
  { value: "delivery", label: "Delivery", color: "#10b981" },
  { value: "payment", label: "Payment", color: "#8b5cf6" },
  { value: "appointment", label: "Appointment", color: "#ec4899" },
  { value: "other", label: "Other", color: "#6b7280" },
];

export function CalendarFilters({
  filters,
  onFilterChange,
  onClearFilters,
}: CalendarFiltersProps) {
  const hasActiveFilters =
    filters.categories.length > 0 || filters.search.length > 0;

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter((c) => c !== category)
      : [...filters.categories, category];
    onFilterChange({ categories: newCategories });
  };

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
      <div className="space-y-2">
        <Label htmlFor="search">Search</Label>
        <Input
          id="search"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
        />
      </div>
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="space-y-2">
          {categories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={category.value}
                checked={filters.categories.includes(category.value)}
                onCheckedChange={() => handleCategoryToggle(category.value)}
              />
              <Label
                htmlFor={category.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: category.color }}
                />
                <span className="capitalize">{category.label}</span>
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


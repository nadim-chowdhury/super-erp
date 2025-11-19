"use client";

import { useState } from "react";
import { Filter, X, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface FilterCriteria {
  field: string;
  operator: "equals" | "contains" | "greaterThan" | "lessThan" | "between";
  value: string;
  value2?: string;
}

interface AdvancedFiltersProps {
  fields: {
    name: string;
    label: string;
    type: "text" | "select" | "date" | "number";
    options?: string[];
  }[];
  onApply: (filters: FilterCriteria[]) => void;
  onClear: () => void;
  savedPresets?: { id: string; name: string; filters: FilterCriteria[] }[];
  onSavePreset?: (name: string, filters: FilterCriteria[]) => void;
  onDeletePreset?: (id: string) => void;
  onLoadPreset?: (filters: FilterCriteria[]) => void;
}

export function AdvancedFilters({
  fields,
  onApply,
  onClear,
  savedPresets = [],
  onSavePreset,
  onDeletePreset,
  onLoadPreset,
}: AdvancedFiltersProps) {
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState<FilterCriteria[]>([]);
  const [presetName, setPresetName] = useState("");

  const addFilter = () => {
    setFilters([
      ...filters,
      {
        field: fields[0]?.name || "",
        operator: "equals",
        value: "",
      },
    ]);
  };

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const updateFilter = (index: number, updates: Partial<FilterCriteria>) => {
    setFilters(
      filters.map((filter, i) =>
        i === index ? { ...filter, ...updates } : filter
      )
    );
  };

  const handleApply = () => {
    onApply(filters.filter((f) => f.value.trim() !== ""));
    setOpen(false);
  };

  const handleClear = () => {
    setFilters([]);
    onClear();
  };

  const handleSavePreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName, filters);
      setPresetName("");
    }
  };

  const handleLoadPreset = (presetFilters: FilterCriteria[]) => {
    setFilters(presetFilters);
    onApply(presetFilters);
    setOpen(false);
  };

  const operatorOptions = {
    text: [
      { value: "equals", label: "Equals" },
      { value: "contains", label: "Contains" },
    ],
    select: [{ value: "equals", label: "Equals" }],
    date: [
      { value: "equals", label: "Equals" },
      { value: "greaterThan", label: "After" },
      { value: "lessThan", label: "Before" },
      { value: "between", label: "Between" },
    ],
    number: [
      { value: "equals", label: "Equals" },
      { value: "greaterThan", label: "Greater than" },
      { value: "lessThan", label: "Less than" },
      { value: "between", label: "Between" },
    ],
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Advanced Filters
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Advanced Filters</DialogTitle>
          <DialogDescription>
            Create complex filters with multiple criteria
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Saved Presets */}
          {savedPresets.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Saved Presets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map((preset) => (
                    <Badge
                      key={preset.id}
                      variant="secondary"
                      className="cursor-pointer gap-2"
                      onClick={() => handleLoadPreset(preset.filters)}
                    >
                      {preset.name}
                      {onDeletePreset && (
                        <X
                          className="h-3 w-3"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeletePreset(preset.id);
                          }}
                        />
                      )}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filter Criteria */}
          <div className="space-y-3">
            {filters.map((filter, index) => {
              const field = fields.find((f) => f.name === filter.field);
              const operators = field
                ? operatorOptions[field.type] || operatorOptions.text
                : operatorOptions.text;

              return (
                <div
                  key={index}
                  className="flex items-end gap-2 p-3 border rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Field</Label>
                      <Select
                        value={filter.field}
                        onValueChange={(value) =>
                          updateFilter(index, { field: value, value: "" })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {fields.map((field) => (
                            <SelectItem key={field.name} value={field.name}>
                              {field.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Operator</Label>
                      <Select
                        value={filter.operator}
                        onValueChange={(value) =>
                          updateFilter(index, {
                            operator: value as FilterCriteria["operator"],
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {operators.map((op) => (
                            <SelectItem key={op.value} value={op.value}>
                              {op.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Value</Label>
                      {field?.type === "select" && field.options ? (
                        <Select
                          value={filter.value}
                          onValueChange={(value) =>
                            updateFilter(index, { value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.options.map((option) => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          type={
                            field?.type === "date"
                              ? "date"
                              : field?.type === "number"
                              ? "number"
                              : "text"
                          }
                          value={filter.value}
                          onChange={(e) =>
                            updateFilter(index, { value: e.target.value })
                          }
                          placeholder="Enter value"
                        />
                      )}
                    </div>
                  </div>
                  {filter.operator === "between" && (
                    <div className="space-y-1">
                      <Label className="text-xs">To</Label>
                      <Input
                        type={field?.type === "date" ? "date" : "number"}
                        value={filter.value2 || ""}
                        onChange={(e) =>
                          updateFilter(index, { value2: e.target.value })
                        }
                        placeholder="End value"
                        className="w-32"
                      />
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFilter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={addFilter} size="sm">
              + Add Filter
            </Button>
            {onSavePreset && (
              <>
                <Input
                  placeholder="Preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSavePreset}
                  disabled={!presetName.trim() || filters.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Preset
                </Button>
              </>
            )}
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Filters</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

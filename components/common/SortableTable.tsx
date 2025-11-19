"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type SortDirection = "asc" | "desc" | null;
export type SortConfig = {
  column: string;
  direction: SortDirection;
};

interface SortableTableProps {
  columns: {
    key: string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: any) => React.ReactNode;
  }[];
  data: any[];
  onSort?: (config: SortConfig) => void;
  defaultSort?: SortConfig;
  className?: string;
}

export function SortableTable({
  columns,
  data,
  onSort,
  defaultSort,
  className,
}: SortableTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    defaultSort || { column: "", direction: null }
  );

  const handleSort = (columnKey: string) => {
    const column = columns.find((col) => col.key === columnKey);
    if (!column || column.sortable === false) return;

    let newDirection: SortDirection = "asc";
    if (sortConfig.column === columnKey && sortConfig.direction === "asc") {
      newDirection = "desc";
    } else if (
      sortConfig.column === columnKey &&
      sortConfig.direction === "desc"
    ) {
      newDirection = null;
    }

    const newSortConfig: SortConfig = {
      column: newDirection ? columnKey : "",
      direction: newDirection,
    };

    setSortConfig(newSortConfig);
    if (onSort) {
      onSort(newSortConfig);
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortConfig.column !== columnKey || sortConfig.direction === null) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.key}>
                {column.sortable !== false ? (
                  <Button
                    variant="ghost"
                    className="h-8 px-2 lg:px-3 -ml-3"
                    onClick={() => handleSort(column.key)}
                  >
                    <span>{column.label}</span>
                    {getSortIcon(column.key)}
                  </Button>
                ) : (
                  <span>{column.label}</span>
                )}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column) => (
                  <TableCell key={column.key}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : row[column.key]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}


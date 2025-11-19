import * as XLSX from "xlsx";
import { format } from "date-fns";

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title?: string;
}

/**
 * Export data to CSV
 */
export function exportToCSV(data: ExportData, filename?: string): void {
  const csvContent = [
    data.headers.join(","),
    ...data.rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename || `report-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export data to Excel
 */
export function exportToExcel(data: ExportData, filename?: string): void {
  const worksheet = XLSX.utils.aoa_to_sheet([data.headers, ...data.rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

  // Auto-size columns
  const maxWidth = data.headers.reduce((acc, header) => {
    return Math.max(acc, header.length);
  }, 10);
  worksheet["!cols"] = [{ wch: maxWidth }];

  XLSX.writeFile(
    workbook,
    filename || `report-${format(new Date(), "yyyy-MM-dd")}.xlsx`
  );
}

/**
 * Prepare data for PDF export
 */
export function preparePDFData(data: ExportData) {
  return {
    title: data.title || "Report",
    headers: data.headers,
    rows: data.rows,
    generatedAt: format(new Date(), "PPpp"),
  };
}

/**
 * Format currency for display
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  return format(new Date(date), "MMM dd, yyyy");
}

/**
 * Format date range for display
 */
export function formatDateRange(start: Date, end: Date): string {
  return `${format(start, "MMM dd, yyyy")} - ${format(end, "MMM dd, yyyy")}`;
}



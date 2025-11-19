"use client";

import { FileItem } from "@/lib/data/demoData";
import { FilePreview } from "./FilePreview";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Download,
  Trash2,
  Share2,
  Eye,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Archive,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FileGridProps {
  files: FileItem[];
  selectedFiles: string[];
  onFileSelect: (fileId: string) => void;
  onFileDelete: (fileId: string) => void;
  onFileDownload: (file: FileItem) => void;
  onFilePreview: (file: FileItem) => void;
  onFileShare: (file: FileItem) => void;
  onFileClick?: (fileId: string) => void;
}

const categoryIcons = {
  document: FileText,
  image: ImageIcon,
  report: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  other: Archive,
};

const categoryColors = {
  document: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  image: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
  report: "bg-green-500/10 text-green-600 dark:text-green-400",
  spreadsheet: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  presentation: "bg-red-500/10 text-red-600 dark:text-red-400",
  other: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
};

export function FileGrid({
  files,
  selectedFiles,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onFilePreview,
  onFileShare,
  onFileClick,
}: FileGridProps) {
  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No files found</p>
        <p className="text-sm text-muted-foreground mt-2">
          Upload files to get started
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map((file) => {
        const Icon = categoryIcons[file.category] || FileText;
        const isSelected = selectedFiles.includes(file.id);

        return (
          <div
            key={file.id}
            className={cn(
              "group relative border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer",
              isSelected && "ring-2 ring-primary"
            )}
            onClick={() => onFilePreview(file)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onFileSelect(file.id)}
                  onClick={(e) => e.stopPropagation()}
                />
                <div
                  className={cn("p-2 rounded", categoryColors[file.category])}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger
                  asChild
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onFilePreview(file)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileDownload(file)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onFileShare(file)}>
                    <Share2 className="mr-2 h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  {file.permissions.canDelete && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onFileDelete(file.id)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium truncate" title={file.name}>
                {file.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(file.uploadedAt), "MMM d, yyyy")}
              </p>
              {file.associatedEntity && (
                <p className="text-xs text-muted-foreground truncate">
                  Linked to: {file.associatedEntity.name}
                </p>
              )}
            </div>
            {file.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {file.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-xs px-1.5 py-0.5 bg-muted rounded"
                  >
                    {tag}
                  </span>
                ))}
                {file.tags.length > 2 && (
                  <span className="text-xs px-1.5 py-0.5 bg-muted rounded">
                    +{file.tags.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

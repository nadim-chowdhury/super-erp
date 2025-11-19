"use client";

import { FileItem } from "@/lib/data/demoData";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface FileListProps {
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

export function FileList({
  files,
  selectedFiles,
  onFileSelect,
  onFileDelete,
  onFileDownload,
  onFilePreview,
  onFileShare,
  onFileClick,
}: FileListProps) {
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
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  files.length > 0 &&
                  files.every((file) => selectedFiles.includes(file.id))
                }
                onCheckedChange={(checked) => {
                  if (checked) {
                    files.forEach((file) => onFileSelect(file.id));
                  } else {
                    files.forEach((file) => {
                      if (selectedFiles.includes(file.id)) {
                        onFileSelect(file.id);
                      }
                    });
                  }
                }}
              />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Size</TableHead>
            <TableHead>Uploaded By</TableHead>
            <TableHead>Uploaded At</TableHead>
            <TableHead>Version</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map((file) => {
            const Icon = categoryIcons[file.category] || FileText;
            const isSelected = selectedFiles.includes(file.id);

            return (
              <TableRow
                key={file.id}
                className={cn(
                  "cursor-pointer",
                  isSelected && "bg-muted/50"
                )}
                onClick={() => onFileClick?.(file.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onFileSelect(file.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded",
                        categoryColors[file.category]
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium">{file.name}</p>
                      {file.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-md">
                          {file.description}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm capitalize">{file.category}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{formatBytes(file.size)}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{file.uploadedBy}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(file.uploadedAt), "MMM d, yyyy")}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">v{file.version}</span>
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
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
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}


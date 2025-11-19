"use client";

import { useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setFilters,
  toggleFileSelection,
  setViewMode,
  deleteFile,
  bulkDeleteFiles,
} from "@/lib/store/slices/filesSlice";
import { FileItem } from "@/lib/data/demoData";
import { FileGrid } from "./FileGrid";
import { FileList } from "./FileList";
import { FilePreview } from "./FilePreview";
import { FileUploader } from "./FileUploader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import {
  Grid3x3,
  List,
  Search,
  Upload,
  Trash2,
  Download,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FileManagerProps {
  onFileSelect?: (file: FileItem) => void;
}

export function FileManager({ onFileSelect }: FileManagerProps) {
  const dispatch = useAppDispatch();
  const { files, uploadQueue, filters, selectedFiles, viewMode } =
    useAppSelector((state) => state.files);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [showUploader, setShowUploader] = useState(false);

  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      // Category filter
      if (filters.category !== "all" && file.category !== filters.category) {
        return false;
      }

      // Search filter
      if (
        filters.search &&
        !file.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !file.description?.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start) {
        const startDate = new Date(filters.dateRange.start);
        const fileDate = new Date(file.uploadedAt);
        if (fileDate < startDate) {
          return false;
        }
      }

      if (filters.dateRange.end) {
        const endDate = new Date(filters.dateRange.end);
        endDate.setHours(23, 59, 59, 999);
        const fileDate = new Date(file.uploadedAt);
        if (fileDate > endDate) {
          return false;
        }
      }

      return true;
    });
  }, [files, filters]);

  const handleFileSelect = (fileId: string) => {
    dispatch(toggleFileSelection(fileId));
  };

  const handleFileClick = (fileId: string) => {
    const file = files.find((f) => f.id === fileId);
    if (file) {
      setPreviewFile(file);
      onFileSelect?.(file);
    }
  };

  const handleFileDownload = (file: FileItem) => {
    // Simulate download
    console.log("Downloading file:", file.name);
    // In a real app, this would trigger a download
  };

  const handleFileShare = (file: FileItem) => {
    // Simulate sharing
    console.log("Sharing file:", file.name);
    // In a real app, this would open a share dialog
  };

  const handleFileDelete = (fileId: string) => {
    dispatch(deleteFile(fileId));
  };

  const handleBulkDelete = () => {
    if (selectedFiles.length > 0) {
      dispatch(bulkDeleteFiles(selectedFiles));
    }
  };

  const totalUploadSize = uploadQueue.reduce(
    (sum, item) => sum + item.file.size,
    0
  );

  return (
    <div className="space-y-6">
      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              Uploading {uploadQueue.length} file
              {uploadQueue.length !== 1 ? "s" : ""} (
              {formatBytes(totalUploadSize)})
            </h3>
          </div>
          {uploadQueue.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="truncate flex-1">{item.file.name}</span>
                <span className="text-muted-foreground ml-2">
                  {formatBytes(item.file.size)}
                </span>
              </div>
              {item.status === "uploading" && (
                <Progress value={item.progress} className="h-2" />
              )}
              {item.status === "completed" && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  Upload complete
                </div>
              )}
              {item.status === "error" && (
                <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  {item.error || "Upload failed"}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Uploader */}
      {showUploader && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Upload Files</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowUploader(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <FileUploader
            onUploadComplete={(file) => {
              setShowUploader(false);
              onFileSelect?.(file);
            }}
          />
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => {
                dispatch(setFilters({ search: e.target.value }));
              }}
            />
          </div>
          <Select
            value={filters.category}
            onValueChange={(value) => {
              dispatch(setFilters({ category: value }));
            }}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="document">Documents</SelectItem>
              <SelectItem value="image">Images</SelectItem>
              <SelectItem value="report">Reports</SelectItem>
              <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
              <SelectItem value="presentation">Presentations</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          {selectedFiles.length > 0 && (
            <>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download ({selectedFiles.length})
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete ({selectedFiles.length})
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowUploader(!showUploader)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => {
                dispatch(setViewMode("grid"));
              }}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => {
                dispatch(setViewMode("list"));
              }}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* File View */}
      {viewMode === "grid" ? (
        <FileGrid
          files={filteredFiles}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onFileDownload={handleFileDownload}
          onFilePreview={(file) => setPreviewFile(file)}
          onFileShare={handleFileShare}
          onFileClick={handleFileClick}
        />
      ) : (
        <FileList
          files={filteredFiles}
          selectedFiles={selectedFiles}
          onFileSelect={handleFileSelect}
          onFileDelete={handleFileDelete}
          onFileDownload={handleFileDownload}
          onFilePreview={(file) => setPreviewFile(file)}
          onFileShare={handleFileShare}
          onFileClick={handleFileClick}
        />
      )}

      {/* File Preview Dialog */}
      <FilePreview
        file={previewFile}
        open={!!previewFile}
        onOpenChange={(open) => !open && setPreviewFile(null)}
        onDownload={handleFileDownload}
        onShare={handleFileShare}
        onDelete={handleFileDelete}
      />
    </div>
  );
}

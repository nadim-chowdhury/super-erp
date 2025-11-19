"use client";

import { useCallback, useState, useRef } from "react";
import { useAppDispatch } from "@/lib/store/hooks";
import {
  addToUploadQueue,
  updateUploadProgress,
  completeUpload,
  failUpload,
} from "@/lib/store/slices/filesSlice";
import { FileItem } from "@/lib/data/demoData";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, File, CheckCircle2, AlertCircle } from "lucide-react";
import { cn, formatBytes } from "@/lib/utils";

interface FileUploaderProps {
  onUploadComplete?: (file: FileItem) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
}

export function FileUploader({
  onUploadComplete,
  maxFiles = 10,
  acceptedTypes,
}: FileUploaderProps) {
  const dispatch = useAppDispatch();
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const simulateUpload = useCallback(
    (file: File, uploadId: string) => {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 15 + 5; // 5-20% increments

        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);

          // Create file item
          const fileItem: FileItem = {
            id: uploadId,
            name: file.name,
            type: file.name.split(".").pop() || "unknown",
            size: file.size,
            category: file.type.startsWith("image/")
              ? "image"
              : file.type.includes("pdf")
              ? "document"
              : file.type.includes("spreadsheet") || file.type.includes("excel")
              ? "spreadsheet"
              : file.type.includes("presentation") ||
                file.type.includes("powerpoint")
              ? "presentation"
              : "document",
            uploadedBy: "Current User",
            uploadedAt: new Date().toISOString(),
            modifiedAt: new Date().toISOString(),
            version: 1,
            status: "completed",
            tags: [],
            permissions: {
              canView: true,
              canDownload: true,
              canDelete: true,
              canShare: true,
            },
            downloadUrl: `/api/files/${uploadId}/download`,
          };

          dispatch(completeUpload({ id: uploadId, file: fileItem }));
          onUploadComplete?.(fileItem);
        } else {
          dispatch(updateUploadProgress({ id: uploadId, progress }));
        }
      }, 200); // Update every 200ms
    },
    [dispatch, onUploadComplete]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files).slice(0, maxFiles);

      fileArray.forEach((file) => {
        // Validate file type if specified
        if (
          acceptedTypes &&
          acceptedTypes.length > 0 &&
          !acceptedTypes.some((type) => file.type.includes(type))
        ) {
          return;
        }

        const uploadId = crypto.randomUUID();
        dispatch(addToUploadQueue({ id: uploadId, file }));
        simulateUpload(file, uploadId);
      });
    },
    [dispatch, maxFiles, acceptedTypes, simulateUpload]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFiles(e.target.files);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleFiles]
  );

  return (
    <div
      className={cn(
        "border-2 border-dashed rounded-lg p-6 transition-colors",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <Upload className="h-12 w-12 text-muted-foreground" />
        <div className="text-center">
          <p className="text-sm font-medium">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports multiple files (max {maxFiles})
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
        >
          Select Files
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes?.join(",")}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>
    </div>
  );
}

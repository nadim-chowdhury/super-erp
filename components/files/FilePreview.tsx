"use client";

import { FileItem } from "@/lib/data/demoData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Share2,
  Trash2,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  Presentation,
  Archive,
  Calendar,
  User,
  Tag,
  Link as LinkIcon,
} from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  file: FileItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDownload?: (file: FileItem) => void;
  onShare?: (file: FileItem) => void;
  onDelete?: (fileId: string) => void;
}

const categoryIcons = {
  document: FileText,
  image: ImageIcon,
  report: FileText,
  spreadsheet: FileSpreadsheet,
  presentation: Presentation,
  other: Archive,
};

export function FilePreview({
  file,
  open,
  onOpenChange,
  onDownload,
  onShare,
  onDelete,
}: FilePreviewProps) {
  if (!file) return null;

  const Icon = categoryIcons[file.category] || FileText;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {file.name}
          </DialogTitle>
          <DialogDescription>File details and preview</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* File Preview Area */}
          <div className="border rounded-lg p-8 bg-muted/50 flex items-center justify-center min-h-[300px]">
            {file.category === "image" ? (
              <div className="text-center">
                <ImageIcon className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Image preview would appear here
                </p>
              </div>
            ) : (
              <div className="text-center">
                <Icon className="h-24 w-24 mx-auto text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">
                  Preview not available for this file type
                </p>
              </div>
            )}
          </div>

          {/* File Information */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Size</p>
              <p className="text-sm">{formatBytes(file.size)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Type</p>
              <p className="text-sm">{file.type.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Uploaded
              </p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(file.uploadedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Modified
              </p>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(file.modifiedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Uploaded By
              </p>
              <p className="text-sm flex items-center gap-1">
                <User className="h-3 w-3" />
                {file.uploadedBy}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Version
              </p>
              <p className="text-sm">v{file.version}</p>
            </div>
          </div>

          {/* Description */}
          {file.description && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </p>
              <p className="text-sm">{file.description}</p>
            </div>
          )}

          {/* Tags */}
          {file.tags.length > 0 && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Tag className="h-3 w-3" />
                Tags
              </p>
              <div className="flex flex-wrap gap-2">
                {file.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Associated Entity */}
          {file.associatedEntity && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <LinkIcon className="h-3 w-3" />
                Linked To
              </p>
              <Badge variant="outline">
                {file.associatedEntity.type}: {file.associatedEntity.name}
              </Badge>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-4 border-t">
            {file.permissions.canDownload && onDownload && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownload(file)}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            )}
            {file.permissions.canShare && onShare && (
              <Button variant="outline" size="sm" onClick={() => onShare(file)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            )}
            {file.permissions.canDelete && onDelete && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  onDelete(file.id);
                  onOpenChange(false);
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

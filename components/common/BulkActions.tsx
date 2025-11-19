"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface BulkActionsProps {
  selectedCount: number;
  onBulkDelete?: () => void;
  onBulkEdit?: (data: any) => void;
  onBulkStatusChange?: (status: string) => void;
  onBulkExport?: () => void;
  statusOptions?: { value: string; label: string }[];
  editFields?: {
    name: string;
    label: string;
    type: string;
    options?: string[];
  }[];
}

export function BulkActions({
  selectedCount,
  onBulkDelete,
  onBulkEdit,
  onBulkStatusChange,
  onBulkExport,
  statusOptions = [],
  editFields = [],
}: BulkActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [editData, setEditData] = useState<Record<string, string>>({});
  const [selectedStatus, setSelectedStatus] = useState("");

  if (selectedCount === 0) return null;

  const handleBulkDelete = () => {
    if (onBulkDelete) {
      onBulkDelete();
      setShowDeleteDialog(false);
    }
  };

  const handleBulkEdit = () => {
    if (onBulkEdit) {
      onBulkEdit(editData);
      setShowEditDialog(false);
      setEditData({});
    }
  };

  const handleBulkStatusChange = () => {
    if (onBulkStatusChange && selectedStatus) {
      onBulkStatusChange(selectedStatus);
      setShowStatusDialog(false);
      setSelectedStatus("");
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg border">
        <Badge variant="secondary" className="text-sm">
          {selectedCount} selected
        </Badge>
        <div className="flex items-center gap-2 ml-auto">
          {onBulkEdit && editFields.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {onBulkStatusChange && statusOptions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStatusDialog(true)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Change Status
            </Button>
          )}
          {onBulkExport && (
            <Button variant="outline" size="sm" onClick={onBulkExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
          {onBulkDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Selected Items</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedCount} item
              {selectedCount > 1 ? "s" : ""}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleBulkDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      {onBulkEdit && (
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Edit</DialogTitle>
              <DialogDescription>
                Update {selectedCount} item{selectedCount > 1 ? "s" : ""} with
                new values
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {editFields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  {field.type === "select" && field.options ? (
                    <Select
                      value={editData[field.name] || ""}
                      onValueChange={(value) =>
                        setEditData({ ...editData, [field.name]: value })
                      }
                    >
                      <SelectTrigger id={field.name}>
                        <SelectValue placeholder={`Select ${field.label}`} />
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
                    <input
                      id={field.name}
                      type={field.type}
                      value={editData[field.name] || ""}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          [field.name]: e.target.value,
                        })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder={`Enter ${field.label}`}
                    />
                  )}
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditData({});
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleBulkEdit}>Apply Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Status Change Dialog */}
      {onBulkStatusChange && (
        <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change Status</DialogTitle>
              <DialogDescription>
                Update status for {selectedCount} item
                {selectedCount > 1 ? "s" : ""}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowStatusDialog(false);
                  setSelectedStatus("");
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkStatusChange}
                disabled={!selectedStatus}
              >
                Update Status
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

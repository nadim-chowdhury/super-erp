"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanColumn } from "@/lib/store/slices/kanbanSlice";

interface EditColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  column: KanbanColumn | null;
  onUpdate: (updates: Partial<KanbanColumn>) => void;
  onDelete: () => void;
  existingColumns: KanbanColumn[];
}

const DEFAULT_COLORS = [
  "#6b7280", // gray
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#f59e0b", // amber
  "#10b981", // green
  "#ef4444", // red
  "#ec4899", // pink
  "#14b8a6", // teal
];

export function EditColumnDialog({
  open,
  onOpenChange,
  column,
  onUpdate,
  onDelete,
  existingColumns,
}: EditColumnDialogProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (column) {
      const timer = setTimeout(() => {
        setTitle(column.title);
        setColor(column.color || DEFAULT_COLORS[0]);
        setErrors({});
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [column]);

  if (!column) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    // Check for duplicate titles (excluding current column)
    if (
      existingColumns.some(
        (c) =>
          c.id !== column.id &&
          c.title.toLowerCase() === title.toLowerCase().trim()
      )
    ) {
      newErrors.title = "A column with this title already exists";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onUpdate({
      title: title.trim(),
      color,
    });

    setErrors({});
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete "${column.title}"? All cards in this column will be moved to the first column.`)) {
      onDelete();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Column</DialogTitle>
          <DialogDescription>
            Update column details
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">
                Column Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="edit-title"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.title;
                      return newErrors;
                    });
                  }
                }}
                placeholder="e.g., In Progress"
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex gap-2 flex-wrap">
                {DEFAULT_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setColor(col)}
                    className={`
                      w-8 h-8 rounded-full border-2 transition-all
                      ${color === col ? "border-foreground scale-110" : "border-muted"}
                    `}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
            >
              Delete
            </Button>
            <div className="flex-1" />
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


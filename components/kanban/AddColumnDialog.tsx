"use client";

import { useState } from "react";
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

interface AddColumnDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (column: Omit<KanbanColumn, "order">) => void;
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

export function AddColumnDialog({
  open,
  onOpenChange,
  onAdd,
  existingColumns,
}: AddColumnDialogProps) {
  const [title, setTitle] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Title is required";
    }

    // Check for duplicate titles
    if (existingColumns.some((c) => c.title.toLowerCase() === title.toLowerCase().trim())) {
      newErrors.title = "A column with this title already exists";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const columnId = title.toLowerCase().replace(/\s+/g, "_");
    
    // Check for duplicate IDs
    if (existingColumns.some((c) => c.id === columnId)) {
      newErrors.title = "A column with this name already exists";
      setErrors(newErrors);
      return;
    }

    onAdd({
      id: columnId,
      title: title.trim(),
      color,
    });

    setTitle("");
    setColor(DEFAULT_COLORS[0]);
    setErrors({});
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Column</DialogTitle>
          <DialogDescription>
            Create a new column for your Kanban board
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Column Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
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
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setTitle("");
                setErrors({});
              }}
            >
              Cancel
            </Button>
            <Button type="submit">Add Column</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


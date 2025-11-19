"use client";

import React, { useState, useEffect } from "react";
import { KanbanCard as KanbanCardType } from "@/lib/data/demoData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Tag, AlertCircle, Trash2, Save } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CardDetailsProps {
  card: KanbanCardType | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (card: KanbanCardType) => void;
  onDelete?: (cardId: string) => void;
  statusOptions: { id: string; title: string }[];
  priorityOptions: KanbanCardType["priority"][];
  assigneeOptions: string[];
}

const priorityColors = {
  low: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function CardDetails({
  card,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
  statusOptions,
  priorityOptions,
  assigneeOptions,
}: CardDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "",
    priority: "medium" as KanbanCardType["priority"],
    assignees: [] as string[],
    dueDate: "",
    tags: [] as string[],
  });

  useEffect(() => {
    if (card) {
      const timer = setTimeout(() => {
        setFormData({
          title: card.title,
          description: card.description || "",
          status: card.status,
          priority: card.priority,
          assignees: [...card.assignees],
          dueDate: card.dueDate
            ? format(new Date(card.dueDate), "yyyy-MM-dd")
            : "",
          tags: [...card.tags],
        });
        setIsEditing(false);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [card]);

  if (!card) return null;

  const handleSave = () => {
    if (onUpdate) {
      const updatedCard: KanbanCardType = {
        ...card,
        ...formData,
        dueDate: formData.dueDate || undefined,
        updatedAt: new Date().toISOString(),
      };
      onUpdate(updatedCard);
    }
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isOverdue = card.dueDate
    ? new Date(card.dueDate) < new Date() &&
      card.status !== "done" &&
      card.status !== "completed" &&
      card.status !== "delivered"
    : false;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Card" : "Card Details"}</DialogTitle>
          <DialogDescription>View and manage card details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.id} value={option.id}>
                          {option.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) =>
                      setFormData({
                        ...formData,
                        priority: value as KanbanCardType["priority"],
                      })
                    }
                  >
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          <span className="capitalize">{priority}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
                {card.description && (
                  <p className="text-muted-foreground">{card.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Status
                  </Label>
                  <p className="font-medium capitalize">{card.status}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">
                    Priority
                  </Label>
                  <Badge
                    variant="outline"
                    className={cn("mt-1", priorityColors[card.priority])}
                  >
                    {card.priority}
                  </Badge>
                </div>
                {card.dueDate && (
                  <div>
                    <Label className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due Date
                    </Label>
                    <p
                      className={cn(
                        "font-medium",
                        isOverdue && "text-red-600 dark:text-red-400"
                      )}
                    >
                      {format(new Date(card.dueDate), "MMM d, yyyy")}
                      {isOverdue && (
                        <span className="ml-2 text-xs">(Overdue)</span>
                      )}
                    </p>
                  </div>
                )}
                {card.metadata && (
                  <div>
                    <Label className="text-sm text-muted-foreground">
                      Metadata
                    </Label>
                    <div className="space-y-1 mt-1">
                      {card.metadata.orderNumber && (
                        <p className="text-sm">
                          Order: {card.metadata.orderNumber}
                        </p>
                      )}
                      {card.metadata.customerName && (
                        <p className="text-sm">
                          Customer: {card.metadata.customerName}
                        </p>
                      )}
                      {card.metadata.amount && (
                        <p className="text-sm">
                          Amount: ${card.metadata.amount}
                        </p>
                      )}
                      {card.metadata.projectId && (
                        <p className="text-sm">
                          Project: {card.metadata.projectId}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {card.assignees.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <User className="h-3 w-3" />
                    Assignees
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {card.assignees.map((assignee, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(assignee)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {card.tags.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground flex items-center gap-1 mb-2">
                    <Tag className="h-3 w-3" />
                    Tags
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {card.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-4 border-t">
                <p>
                  Created:{" "}
                  {format(new Date(card.createdAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <p>
                  Updated:{" "}
                  {format(new Date(card.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </>
          )}
        </div>
        <DialogFooter className="border-t pt-4 mt-4">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <>
              {onDelete && (
                <Button
                  variant="destructive"
                  onClick={() => {
                    onDelete(card.id);
                    onOpenChange(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Save className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

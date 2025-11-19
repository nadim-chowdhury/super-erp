"use client";

import React from "react";
import { KanbanCard as KanbanCardType } from "@/lib/data/demoData";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, User, AlertCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface KanbanCardProps {
  card: KanbanCardType;
  onClick?: (card: KanbanCardType) => void;
}

const priorityColors = {
  low: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  medium: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  high: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  urgent: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function KanbanCard({ card, onClick }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
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

  const handleClick = (e: React.MouseEvent) => {
    // Prevent click during drag
    e.stopPropagation();
    if (!isDragging) {
      onClick?.(card);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-card border rounded-lg p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-all select-none",
        isDragging && ""
      )}
      onClick={handleClick}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm flex-1 line-clamp-2">
            {card.title}
          </h4>
          <Badge
            variant="outline"
            className={cn("text-xs shrink-0", priorityColors[card.priority])}
          >
            {card.priority}
          </Badge>
        </div>

        {card.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {card.description}
          </p>
        )}

        {card.metadata && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {card.metadata.orderNumber && (
              <span>#{card.metadata.orderNumber}</span>
            )}
            {card.metadata.customerName && (
              <span>{card.metadata.customerName}</span>
            )}
            {card.metadata.amount && <span>${card.metadata.amount}</span>}
            {card.metadata.projectId && <span>{card.metadata.projectId}</span>}
          </div>
        )}

        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.slice(0, 2).map((tag, idx) => (
              <Badge
                key={idx}
                variant="secondary"
                className="text-xs px-1.5 py-0"
              >
                {tag}
              </Badge>
            ))}
            {card.tags.length > 2 && (
              <Badge variant="secondary" className="text-xs px-1.5 py-0">
                +{card.tags.length - 2}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1">
            {card.assignees.slice(0, 3).map((assignee, idx) => (
              <Avatar key={idx} className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {getInitials(assignee)}
                </AvatarFallback>
              </Avatar>
            ))}
            {card.assignees.length > 3 && (
              <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                +{card.assignees.length - 3}
              </div>
            )}
          </div>
          {card.dueDate && (
            <div
              className={cn(
                "flex items-center gap-1 text-xs",
                isOverdue
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
              )}
            >
              {isOverdue ? (
                <AlertCircle className="h-3 w-3" />
              ) : (
                <Calendar className="h-3 w-3" />
              )}
              <span>{format(new Date(card.dueDate), "MMM d")}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

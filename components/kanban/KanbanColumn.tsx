"use client";

import { useMemo } from "react";
import { KanbanCard as KanbanCardType } from "@/lib/data/demoData";
import { KanbanCard } from "./KanbanCard";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Plus, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface KanbanColumnProps {
  id: string;
  title: string;
  cards: KanbanCardType[];
  onCardClick?: (card: KanbanCardType) => void;
  onAddCard?: (status: string) => void;
  onEditColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
  color?: string;
  isDraggingOver?: boolean;
  activeCardId?: string;
}

export function KanbanColumn({
  id,
  title,
  cards,
  onCardClick,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
  color,
  isDraggingOver = false,
  activeCardId,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  });

  const cardIds = useMemo(() => {
    // Filter out the active card being dragged
    return cards
      .filter((card) => card.id !== activeCardId)
      .map((card) => card.id);
  }, [cards, activeCardId]);

  return (
    <div className="flex flex-col h-full min-w-[280px] max-h-full">
      <div
        className={cn(
          "flex flex-col h-full max-h-full bg-muted/30 rounded-lg p-4 transition-all",
          isOver && "bg-muted/50",
        )}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {color && (
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
            )}
            <h3 className="font-semibold text-sm">{title}</h3>
            <Badge variant="secondary" className="text-xs">
              {cards.length}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            {onAddCard && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => onAddCard(id)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {(onEditColumn || onDeleteColumn) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEditColumn && (
                    <DropdownMenuItem onClick={() => onEditColumn(id)}>
                      Edit Column
                    </DropdownMenuItem>
                  )}
                  {onDeleteColumn && (
                    <DropdownMenuItem
                      onClick={() => onDeleteColumn(id)}
                      className="text-destructive"
                    >
                      Delete Column
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>

        <div
          ref={setNodeRef}
          className="flex-1 space-y-2 overflow-y-auto overflow-x-hidden min-h-0 max-h-full"
        >
          <SortableContext
            items={cardIds}
            strategy={verticalListSortingStrategy}
          >
            {cards.filter((card) => card.id !== activeCardId).length === 0 &&
            !isDraggingOver ? (
              <div className="text-center py-8 text-sm text-muted-foreground min-h-[100px] flex items-center justify-center">
                Drop cards here
              </div>
            ) : (
              <>
                {cards
                  .filter((card) => card.id !== activeCardId)
                  .map((card) => (
                    <KanbanCard
                      key={card.id}
                      card={card}
                      onClick={onCardClick}
                    />
                  ))}
                {isDraggingOver && (
                  <div className="border-2 border-dashed border-primary rounded-lg p-3 bg-primary/10 min-h-[80px] flex items-center justify-center animate-pulse">
                    <span className="text-sm text-primary font-medium">
                      Drop here
                    </span>
                  </div>
                )}
              </>
            )}
          </SortableContext>
        </div>
      </div>
    </div>
  );
}

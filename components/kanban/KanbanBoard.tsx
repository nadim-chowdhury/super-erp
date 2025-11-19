"use client";

import React, { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { KanbanCard as KanbanCardType } from "@/lib/data/demoData";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface KanbanBoardProps {
  cards: KanbanCardType[];
  columns: { id: string; title: string; color?: string }[];
  onCardMove?: (cardId: string, newStatus: string) => void;
  onCardClick?: (card: KanbanCardType) => void;
  onAddCard?: (status: string) => void;
  onEditColumn?: (columnId: string) => void;
  onDeleteColumn?: (columnId: string) => void;
}

export function KanbanBoard({
  cards,
  columns,
  onCardMove,
  onCardClick,
  onAddCard,
  onEditColumn,
  onDeleteColumn,
}: KanbanBoardProps) {
  const [activeCard, setActiveCard] = useState<KanbanCardType | null>(null);
  const [overColumnId, setOverColumnId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const cardsByStatus = useMemo(() => {
    const grouped: Record<string, KanbanCardType[]> = {};
    columns.forEach((col) => {
      grouped[col.id] = [];
    });
    cards.forEach((card) => {
      if (grouped[card.status]) {
        grouped[card.status].push(card);
      }
    });
    return grouped;
  }, [cards, columns]);

  const handleDragStart = (event: DragStartEvent) => {
    const card = cards.find((c) => c.id === event.active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    if (over) {
      // Check if we're over a column
      const isValidColumn = columns.some((col) => col.id === over.id);
      if (isValidColumn) {
        setOverColumnId(over.id as string);
      } else {
        // Check if we're over a card - get its column
        const targetCard = cards.find((c) => c.id === over.id);
        if (targetCard) {
          setOverColumnId(targetCard.status);
        } else {
          setOverColumnId(null);
        }
      }
    } else {
      setOverColumnId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setOverColumnId(null);

    if (!over) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // Check if we're dropping on a column (status)
    const isValidColumn = columns.some((col) => col.id === overId);

    if (cardId && overId && isValidColumn) {
      const card = cards.find((c) => c.id === cardId);
      if (card && card.status !== overId) {
        onCardMove?.(cardId, overId);
      }
    } else if (cardId && overId) {
      // Try to find if we dropped on a card (reorder within column)
      const targetCard = cards.find((c) => c.id === overId);
      if (targetCard) {
        // Dropped on another card - move to that card's column
        const card = cards.find((c) => c.id === cardId);
        if (card && card.status !== targetCard.status) {
          onCardMove?.(cardId, targetCard.status);
        }
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-full overflow-x-auto overflow-y-hidden">
        <div className="flex gap-4 h-full min-w-max">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={cardsByStatus[column.id] || []}
              onCardClick={onCardClick}
              onAddCard={onAddCard}
              onEditColumn={onEditColumn}
              onDeleteColumn={onDeleteColumn}
              color={column.color}
              isDraggingOver={overColumnId === column.id && activeCard !== null}
              activeCardId={activeCard?.id}
            />
          ))}
        </div>
      </div>
      <DragOverlay>
        {activeCard ? (
          <div
            className="rotate-2 opacity-95 shadow-lg"
            style={{ width: "280px" }}
          >
            <KanbanCard card={activeCard} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

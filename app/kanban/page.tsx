"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  setCards,
  setBoardType,
  moveCard,
  updateCard,
  deleteCard,
  setSelectedCard,
  setFilters,
  clearFilters,
} from "@/lib/store/slices/kanbanSlice";
import { generateKanbanCards, KanbanCard } from "@/lib/data/demoData";
import { MainLayout } from "@/components/layout/MainLayout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { CardDetails } from "@/components/kanban/CardDetails";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShoppingCart,
  CheckSquare,
  FolderKanban,
  Plus,
  Filter,
  Search,
  X,
} from "lucide-react";

const boardConfigs = {
  orders: {
    title: "Orders",
    icon: ShoppingCart,
    columns: [
      { id: "pending", title: "Pending", color: "#f59e0b" },
      { id: "processing", title: "Processing", color: "#3b82f6" },
      { id: "shipped", title: "Shipped", color: "#8b5cf6" },
      { id: "delivered", title: "Delivered", color: "#10b981" },
    ],
  },
  tasks: {
    title: "Tasks",
    icon: CheckSquare,
    columns: [
      { id: "todo", title: "To Do", color: "#6b7280" },
      { id: "in_progress", title: "In Progress", color: "#3b82f6" },
      { id: "review", title: "Review", color: "#f59e0b" },
      { id: "done", title: "Done", color: "#10b981" },
    ],
  },
  projects: {
    title: "Projects",
    icon: FolderKanban,
    columns: [
      { id: "planning", title: "Planning", color: "#6b7280" },
      { id: "active", title: "Active", color: "#3b82f6" },
      { id: "review", title: "Review", color: "#f59e0b" },
      { id: "completed", title: "Completed", color: "#10b981" },
    ],
  },
};

const priorityOptions: KanbanCard["priority"][] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const assigneeOptions = [
  "John Doe",
  "Jane Smith",
  "Mike Johnson",
  "Sarah Williams",
  "David Brown",
];

export default function KanbanPage() {
  const dispatch = useAppDispatch();
  const { cards, boardType, filters, selectedCard } = useAppSelector(
    (state) => state.kanban
  );
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCardDetailsOpen, setIsCardDetailsOpen] = useState(false);

  useEffect(() => {
    const demoCards = generateKanbanCards(boardType, 30);
    dispatch(setCards(demoCards));
  }, [boardType, dispatch]);

  const boardConfig = boardConfigs[boardType];

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(card.status)) {
        return false;
      }

      // Priority filter
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(card.priority)
      ) {
        return false;
      }

      // Assignee filter
      if (
        filters.assignee !== "all" &&
        !card.assignees.includes(filters.assignee)
      ) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          card.title.toLowerCase().includes(searchLower) ||
          card.description?.toLowerCase().includes(searchLower) ||
          card.tags.some((tag) => tag.toLowerCase().includes(searchLower))
        );
      }

      return true;
    });
  }, [cards, filters]);

  const handleBoardTypeChange = (type: "orders" | "tasks" | "projects") => {
    dispatch(setBoardType(type));
    const demoCards = generateKanbanCards(type, 30);
    dispatch(setCards(demoCards));
  };

  const handleCardMove = (cardId: string, newStatus: string) => {
    dispatch(moveCard({ cardId, newStatus }));
  };

  const handleCardClick = (card: KanbanCard) => {
    dispatch(setSelectedCard(card));
    setIsCardDetailsOpen(true);
  };

  const handleCardUpdate = (card: KanbanCard) => {
    dispatch(updateCard(card));
    setIsCardDetailsOpen(false);
  };

  const handleCardDelete = (cardId: string) => {
    dispatch(deleteCard(cardId));
    setIsCardDetailsOpen(false);
  };

  const handleAddCard = (status: string) => {
    const newCard: KanbanCard = {
      id: crypto.randomUUID(),
      title: "New Card",
      description: "",
      status,
      priority: "medium",
      assignees: [],
      tags: [],
      boardType,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch(setCards([...cards, newCard]));
    dispatch(setSelectedCard(newCard));
    setIsCardDetailsOpen(true);
  };

  const hasActiveFilters =
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.assignee !== "all" ||
    filters.search.length > 0;

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kanban Boards</h1>
            <p className="text-muted-foreground">
              Manage workflows with drag & drop boards
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <Tabs
          value={boardType}
          onValueChange={(value) =>
            handleBoardTypeChange(value as "orders" | "tasks" | "projects")
          }
        >
          <TabsList>
            <TabsTrigger value="orders">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="tasks">
              <CheckSquare className="h-4 w-4 mr-2" />
              Tasks
            </TabsTrigger>
            <TabsTrigger value="projects">
              <FolderKanban className="h-4 w-4 mr-2" />
              Projects
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isFiltersOpen && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Filters</CardTitle>
                  <CardDescription>
                    Filter cards by status, priority, assignee, or search
                  </CardDescription>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dispatch(clearFilters())}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search cards..."
                    className="pl-9"
                    value={filters.search}
                    onChange={(e) =>
                      dispatch(setFilters({ search: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={filters.status[0] || "all"}
                      onValueChange={(value) =>
                        dispatch(
                          setFilters({
                            status: value === "all" ? [] : [value],
                          })
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {boardConfig.columns.map((col) => (
                          <SelectItem key={col.id} value={col.id}>
                            {col.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <Select
                      value={filters.priority[0] || "all"}
                      onValueChange={(value) =>
                        dispatch(
                          setFilters({
                            priority: value === "all" ? [] : [value],
                          })
                        )
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        {priorityOptions.map((priority) => (
                          <SelectItem key={priority} value={priority}>
                            <span className="capitalize">{priority}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assignee</label>
                    <Select
                      value={filters.assignee}
                      onValueChange={(value) =>
                        dispatch(setFilters({ assignee: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Assignees</SelectItem>
                        {assigneeOptions.map((assignee) => (
                          <SelectItem key={assignee} value={assignee}>
                            {assignee}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{boardConfig.title} Board</CardTitle>
                <CardDescription>
                  {filteredCards.length} card
                  {filteredCards.length !== 1 ? "s" : ""} total
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[calc(100vh-380px)] overflow-auto p-4">
              <KanbanBoard
                cards={filteredCards}
                columns={boardConfig.columns}
                onCardMove={handleCardMove}
                onCardClick={handleCardClick}
                onAddCard={handleAddCard}
              />
            </div>
          </CardContent>
        </Card>

        <CardDetails
          card={selectedCard}
          open={isCardDetailsOpen}
          onOpenChange={(open) => {
            setIsCardDetailsOpen(open);
            if (!open) {
              dispatch(setSelectedCard(null));
            }
          }}
          onUpdate={handleCardUpdate}
          onDelete={handleCardDelete}
          statusOptions={boardConfig.columns}
          priorityOptions={priorityOptions}
          assigneeOptions={assigneeOptions}
        />
      </div>
    </MainLayout>
  );
}

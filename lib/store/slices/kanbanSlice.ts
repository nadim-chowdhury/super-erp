import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KanbanCard } from "@/lib/data/demoData";

export interface KanbanColumn {
  id: string;
  title: string;
  color?: string;
  order: number;
}

interface KanbanState {
  cards: KanbanCard[];
  columns: Record<string, KanbanColumn[]>; // boardType -> columns
  boardType: "orders" | "tasks" | "projects";
  filters: {
    status: string[];
    priority: string[];
    assignee: string;
    search: string;
  };
  selectedCard: KanbanCard | null;
}

const initialState: KanbanState = {
  cards: [],
  columns: {
    orders: [
      { id: "pending", title: "Pending", color: "#f59e0b", order: 0 },
      { id: "processing", title: "Processing", color: "#3b82f6", order: 1 },
      { id: "shipped", title: "Shipped", color: "#8b5cf6", order: 2 },
      { id: "delivered", title: "Delivered", color: "#10b981", order: 3 },
    ],
    tasks: [
      { id: "todo", title: "To Do", color: "#6b7280", order: 0 },
      { id: "in_progress", title: "In Progress", color: "#3b82f6", order: 1 },
      { id: "review", title: "Review", color: "#f59e0b", order: 2 },
      { id: "done", title: "Done", color: "#10b981", order: 3 },
    ],
    projects: [
      { id: "planning", title: "Planning", color: "#6b7280", order: 0 },
      { id: "active", title: "Active", color: "#3b82f6", order: 1 },
      { id: "review", title: "Review", color: "#f59e0b", order: 2 },
      { id: "completed", title: "Completed", color: "#10b981", order: 3 },
    ],
  },
  boardType: "orders",
  filters: {
    status: [],
    priority: [],
    assignee: "all",
    search: "",
  },
  selectedCard: null,
};

const kanbanSlice = createSlice({
  name: "kanban",
  initialState,
  reducers: {
    setCards: (state, action: PayloadAction<KanbanCard[]>) => {
      state.cards = action.payload;
    },
    addCard: (state, action: PayloadAction<KanbanCard>) => {
      state.cards.push(action.payload);
    },
    updateCard: (state, action: PayloadAction<KanbanCard>) => {
      const index = state.cards.findIndex(
        (c) => c.id === action.payload.id
      );
      if (index !== -1) {
        state.cards[index] = action.payload;
      }
    },
    deleteCard: (state, action: PayloadAction<string>) => {
      state.cards = state.cards.filter((c) => c.id !== action.payload);
      if (state.selectedCard?.id === action.payload) {
        state.selectedCard = null;
      }
    },
    moveCard: (
      state,
      action: PayloadAction<{ cardId: string; newStatus: string }>
    ) => {
      const card = state.cards.find((c) => c.id === action.payload.cardId);
      if (card) {
        card.status = action.payload.newStatus;
        card.updatedAt = new Date().toISOString();
      }
    },
    setBoardType: (
      state,
      action: PayloadAction<"orders" | "tasks" | "projects">
    ) => {
      state.boardType = action.payload;
    },
    setSelectedCard: (state, action: PayloadAction<KanbanCard | null>) => {
      state.selectedCard = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<KanbanState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: [],
        priority: [],
        assignee: "all",
        search: "",
      };
    },
    addColumn: (
      state,
      action: PayloadAction<{ boardType: string; column: KanbanColumn }>
    ) => {
      if (!state.columns[action.payload.boardType]) {
        state.columns[action.payload.boardType] = [];
      }
      state.columns[action.payload.boardType].push(action.payload.column);
      // Sort by order
      state.columns[action.payload.boardType].sort(
        (a, b) => a.order - b.order
      );
    },
    updateColumn: (
      state,
      action: PayloadAction<{
        boardType: string;
        columnId: string;
        updates: Partial<KanbanColumn>;
      }>
    ) => {
      const columns = state.columns[action.payload.boardType];
      if (columns) {
        const index = columns.findIndex(
          (c) => c.id === action.payload.columnId
        );
        if (index !== -1) {
          columns[index] = { ...columns[index], ...action.payload.updates };
        }
      }
    },
    deleteColumn: (
      state,
      action: PayloadAction<{ boardType: string; columnId: string }>
    ) => {
      const columns = state.columns[action.payload.boardType];
      if (columns) {
        state.columns[action.payload.boardType] = columns.filter(
          (c) => c.id !== action.payload.columnId
        );
        // Move cards from deleted column to first column or remove them
        const firstColumn = state.columns[action.payload.boardType][0];
        if (firstColumn) {
          state.cards.forEach((card) => {
            if (card.status === action.payload.columnId) {
              card.status = firstColumn.id;
            }
          });
        } else {
          // If no columns left, remove cards with this status
          state.cards = state.cards.filter(
            (c) => c.status !== action.payload.columnId
          );
        }
      }
    },
    reorderColumns: (
      state,
      action: PayloadAction<{
        boardType: string;
        columnIds: string[];
      }>
    ) => {
      const columns = state.columns[action.payload.boardType];
      if (columns) {
        const reordered = action.payload.columnIds.map((id, index) => {
          const column = columns.find((c) => c.id === id);
          return column ? { ...column, order: index } : null;
        }).filter(Boolean) as KanbanColumn[];
        state.columns[action.payload.boardType] = reordered;
      }
    },
  },
});

export const {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  moveCard,
  setBoardType,
  setSelectedCard,
  setFilters,
  clearFilters,
  addColumn,
  updateColumn,
  deleteColumn,
  reorderColumns,
} = kanbanSlice.actions;
export default kanbanSlice.reducer;


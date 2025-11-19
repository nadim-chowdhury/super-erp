import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { KanbanCard } from "@/lib/data/demoData";

interface KanbanState {
  cards: KanbanCard[];
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
} = kanbanSlice.actions;
export default kanbanSlice.reducer;


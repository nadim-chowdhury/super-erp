import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CalendarEvent } from "@/lib/data/demoData";

interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  view: "month" | "week" | "day";
  currentDate: string; // ISO date string
  filters: {
    categories: string[];
    search: string;
  };
}

const initialState: CalendarState = {
  events: [],
  selectedEvent: null,
  view: "month",
  currentDate: new Date().toISOString(),
  filters: {
    categories: [],
    search: "",
  },
};

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {
    setEvents: (state, action: PayloadAction<CalendarEvent[]>) => {
      state.events = action.payload;
    },
    addEvent: (state, action: PayloadAction<CalendarEvent>) => {
      state.events.push(action.payload);
    },
    updateEvent: (state, action: PayloadAction<CalendarEvent>) => {
      const index = state.events.findIndex(
        (e) => e.id === action.payload.id
      );
      if (index !== -1) {
        state.events[index] = action.payload;
      }
    },
    deleteEvent: (state, action: PayloadAction<string>) => {
      state.events = state.events.filter((e) => e.id !== action.payload);
      if (state.selectedEvent?.id === action.payload) {
        state.selectedEvent = null;
      }
    },
    setSelectedEvent: (
      state,
      action: PayloadAction<CalendarEvent | null>
    ) => {
      state.selectedEvent = action.payload;
    },
    setView: (state, action: PayloadAction<"month" | "week" | "day">) => {
      state.view = action.payload;
    },
    setCurrentDate: (state, action: PayloadAction<string>) => {
      state.currentDate = action.payload;
    },
    navigateDate: (
      state,
      action: PayloadAction<"prev" | "next" | "today">
    ) => {
      const current = new Date(state.currentDate);
      if (action.payload === "today") {
        state.currentDate = new Date().toISOString();
      } else if (action.payload === "prev") {
        if (state.view === "month") {
          current.setMonth(current.getMonth() - 1);
        } else if (state.view === "week") {
          current.setDate(current.getDate() - 7);
        } else {
          current.setDate(current.getDate() - 1);
        }
        state.currentDate = current.toISOString();
      } else if (action.payload === "next") {
        if (state.view === "month") {
          current.setMonth(current.getMonth() + 1);
        } else if (state.view === "week") {
          current.setDate(current.getDate() + 7);
        } else {
          current.setDate(current.getDate() + 1);
        }
        state.currentDate = current.toISOString();
      }
    },
    updateEventTime: (
      state,
      action: PayloadAction<{ id: string; start: string; end: string }>
    ) => {
      const event = state.events.find((e) => e.id === action.payload.id);
      if (event) {
        event.start = action.payload.start;
        event.end = action.payload.end;
        event.updatedAt = new Date().toISOString();
      }
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<CalendarState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        categories: [],
        search: "",
      };
    },
  },
});

export const {
  setEvents,
  addEvent,
  updateEvent,
  deleteEvent,
  setSelectedEvent,
  setView,
  setCurrentDate,
  navigateDate,
  updateEventTime,
  setFilters,
  clearFilters,
} = calendarSlice.actions;
export default calendarSlice.reducer;


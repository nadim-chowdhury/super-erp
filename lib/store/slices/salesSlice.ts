import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Order } from "@/lib/data/demoData";

interface SalesState {
  orders: Order[];
  selectedOrder: Order | null;
  filters: {
    status: string;
    paymentStatus: string;
    search: string;
    dateRange: { start: string; end: string };
  };
}

const initialState: SalesState = {
  orders: [],
  selectedOrder: null,
  filters: {
    status: "all",
    paymentStatus: "all",
    search: "",
    dateRange: { start: "", end: "" },
  },
};

const salesSlice = createSlice({
  name: "sales",
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    updateOrder: (state, action: PayloadAction<Order>) => {
      const index = state.orders.findIndex((o) => o.id === action.payload.id);
      if (index !== -1) {
        state.orders[index] = action.payload;
      }
    },
    deleteOrder: (state, action: PayloadAction<string>) => {
      state.orders = state.orders.filter((o) => o.id !== action.payload);
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<SalesState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
  },
});

export const {
  setOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  setSelectedOrder,
  setFilters,
} = salesSlice.actions;
export default salesSlice.reducer;

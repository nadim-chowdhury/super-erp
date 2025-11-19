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
    bulkDeleteOrders: (state, action: PayloadAction<string[]>) => {
      state.orders = state.orders.filter(
        (o) => !action.payload.includes(o.id)
      );
    },
    bulkUpdateOrders: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Order> }>
    ) => {
      state.orders = state.orders.map((o) =>
        action.payload.ids.includes(o.id)
          ? { ...o, ...action.payload.updates }
          : o
      );
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Order["status"] }>
    ) => {
      state.orders = state.orders.map((o) =>
        action.payload.ids.includes(o.id)
          ? {
              ...o,
              status: action.payload.status,
            }
          : o
      );
    },
    bulkUpdatePaymentStatus: (
      state,
      action: PayloadAction<{ ids: string[]; paymentStatus: Order["paymentStatus"] }>
    ) => {
      state.orders = state.orders.map((o) =>
        action.payload.ids.includes(o.id)
          ? {
              ...o,
              paymentStatus: action.payload.paymentStatus,
            }
          : o
      );
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
  bulkDeleteOrders,
  bulkUpdateOrders,
  bulkUpdateStatus,
  bulkUpdatePaymentStatus,
} = salesSlice.actions;
export default salesSlice.reducer;

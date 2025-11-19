import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Supplier } from "@/lib/data/demoData";

interface SuppliersState {
  suppliers: Supplier[];
  selectedSupplier: Supplier | null;
  filters: {
    status: string;
    search: string;
  };
}

const initialState: SuppliersState = {
  suppliers: [],
  selectedSupplier: null,
  filters: {
    status: "all",
    search: "",
  },
};

const suppliersSlice = createSlice({
  name: "suppliers",
  initialState,
  reducers: {
    setSuppliers: (state, action: PayloadAction<Supplier[]>) => {
      state.suppliers = action.payload;
    },
    addSupplier: (state, action: PayloadAction<Supplier>) => {
      state.suppliers.push(action.payload);
    },
    updateSupplier: (state, action: PayloadAction<Supplier>) => {
      const index = state.suppliers.findIndex(
        (s) => s.id === action.payload.id
      );
      if (index !== -1) {
        state.suppliers[index] = action.payload;
      }
    },
    deleteSupplier: (state, action: PayloadAction<string>) => {
      state.suppliers = state.suppliers.filter((s) => s.id !== action.payload);
    },
    setSelectedSupplier: (state, action: PayloadAction<Supplier | null>) => {
      state.selectedSupplier = action.payload;
    },
    setFilters: (
      state,
      action: PayloadAction<Partial<SuppliersState["filters"]>>
    ) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    bulkDeleteSuppliers: (state, action: PayloadAction<string[]>) => {
      state.suppliers = state.suppliers.filter(
        (s) => !action.payload.includes(s.id)
      );
    },
    bulkUpdateSuppliers: (
      state,
      action: PayloadAction<{ ids: string[]; updates: Partial<Supplier> }>
    ) => {
      state.suppliers = state.suppliers.map((s) =>
        action.payload.ids.includes(s.id)
          ? { ...s, ...action.payload.updates }
          : s
      );
    },
    bulkUpdateStatus: (
      state,
      action: PayloadAction<{ ids: string[]; status: Supplier["status"] }>
    ) => {
      state.suppliers = state.suppliers.map((s) =>
        action.payload.ids.includes(s.id)
          ? {
              ...s,
              status: action.payload.status,
            }
          : s
      );
    },
  },
});

export const {
  setSuppliers,
  addSupplier,
  updateSupplier,
  deleteSupplier,
  setSelectedSupplier,
  setFilters,
  bulkDeleteSuppliers,
  bulkUpdateSuppliers,
  bulkUpdateStatus,
} = suppliersSlice.actions;
export default suppliersSlice.reducer;
